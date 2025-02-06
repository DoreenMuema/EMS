package com.muema.EMS.controllers;

import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepository;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;


@RestController
@RequestMapping("/uploads")
public class FileUploadsController {

    @Autowired
    private EmployeeRepository employeeRepository;

    private final String uploadDir = System.getProperty("user.dir") + "/uploads"; // Using the current working directory

    public FileUploadsController() {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (!created) {
                System.err.println("Could not create upload directory: " + uploadDir);
            }
        }
    }

    private static final Logger logger = LoggerFactory.getLogger(FileUploadsController.class);

    @PostMapping("/upload")
    @Secured({"ROLE_EMPLOYEE", "ROLE_ADMIN"})
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                        @RequestParam("employeeId") long employeeId) {
        // Log received file details
        logger.info("Received upload request for Employee ID: {}", employeeId);
        logger.info("Original file name: {}", file.getOriginalFilename());
        logger.info("File content type: {}", file.getContentType());

        // Validate file type (allowing common image formats and PDF)
        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            logger.warn("Invalid file type: {}", contentType);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Only images and PDF files are allowed."));
        }

        // Call the saveProofFile method to save the file and get the URL
        String fileUrl = saveProofFile(file, employeeId);

        // Update employee record with the file URL
        Optional<Employee> optionalEmployee = employeeRepository.findById(employeeId);
        if (optionalEmployee.isPresent()) {
            Employee employee = optionalEmployee.get();
            employee.setImageUrl(fileUrl); // Store relative URL in database
            employeeRepository.save(employee);
            logger.info("Updated employee {} with new image URL: {}", employeeId, fileUrl);
        } else {
            logger.warn("Employee not found for ID: {}", employeeId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Employee not found."));
        }

        // Return success response
        return ResponseEntity.ok(Map.of("success", true, "fileUrl", fileUrl));
    }

    // Helper method to save the proof file and return the file URL
    private String saveProofFile(MultipartFile file, long employeeId) {
        try {
            // Generate file name using employeeId as the unique identifier
            String originalFileName = file.getOriginalFilename();
            String contentType = file.getContentType();
            String extension = getFileExtension(file.getOriginalFilename(), contentType);  // Get file extension based on content type
            String uniqueFileName = employeeId + "_Photo" + extension; // Use employeeId as part of the filename

            // Construct the file path
            Path filePath = Paths.get(uploadDir, uniqueFileName);

            // Save the file to the server
            file.transferTo(filePath.toFile());

            // Generate the file URL
            return "http://localhost:8080/uploads/" + uniqueFileName;  // File URL to return

        } catch (IOException e) {
            logger.error("Error saving file: {}", e.getMessage());
            return null;
        }
    }

    // Helper method to extract the correct file extension based on content type
    private String getFileExtension(String fileName, String contentType) {
        if (contentType.startsWith("image/")) {
            if (contentType.equals("image/jpeg")) {
                return ".jpg"; // Ensure correct file extension for JPEG images
            } else if (contentType.equals("image/png")) {
                return ".png"; // Ensure correct file extension for PNG images
            } else if (contentType.equals("image/gif")) {
                return ".gif"; // Ensure correct file extension for GIF images
            } else {
                return ".jpg"; // Default to .jpg for unhandled image formats
            }
        } else if (contentType.equals("application/pdf")) {
            return ".pdf"; // PDF file
        }
        return ".bin"; // Default binary file extension
    }

    @GetMapping("/{fileName:.+}")
    @Secured({"ROLE_EMPLOYEE", "ROLE_ADMIN"})
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            // Extract actual filename if the input includes a full URL
            if (fileName.contains("http://localhost:8080/uploads/")) {
                fileName = fileName.substring(fileName.lastIndexOf("/") + 1); // Keep only the actual filename
            }

            // Remove any unexpected prefixes like "2-"
            fileName = fileName.replaceFirst("^\\d+-", ""); // Removes "2-" at the start if present

            // Log the extracted filename for debugging
            logger.info("Extracted fileName: {}", fileName);

            // Resolve file path
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            // Ensure file exists
            if (!resource.exists()) {
                logger.warn("File not found: {}", fileName);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream"; // Default binary
            }

            // Return file as a response
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            logger.error("Error retrieving file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}