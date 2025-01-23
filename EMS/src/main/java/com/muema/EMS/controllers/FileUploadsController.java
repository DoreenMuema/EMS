package com.muema.EMS.controllers;

import com.muema.EMS.model.Employee;
import com.muema.EMS.repo.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/uploads")
public class FileUploadsController {

    @Autowired
    private EmployeeRepository employeeRepository;

    private final String uploadDir = "uploads/";

    @PostMapping("/upload")
    @Secured({"ROLE_EMPLOYEE", "ROLE_ADMIN"})
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("employeeId") long employeeId) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Only images and PDF files are allowed."));
            }

            // Ensure upload directory is absolute and writable
            String uploadDir = System.getProperty("java.io.tmpdir") + "/uploads"; // Using a temp directory
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                boolean created = directory.mkdirs();
                if (!created) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("success", false, "message", "Could not create upload directory."));
                }
            }
            if (!directory.canWrite()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "message", "Upload directory is not writable."));
            }

            // Sanitize file name and generate unique file name
            String originalFileName = file.getOriginalFilename();
            String sanitizedFileName = originalFileName != null ? originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_") : "file";
            String uniqueFileName = System.currentTimeMillis() + "_" + sanitizedFileName;
            Path filePath = Paths.get(uploadDir, uniqueFileName);

            // Log file path for debugging
            System.out.println("Target file path: " + filePath);

            // Save the file
            file.transferTo(filePath.toFile());

            String fileUrl = "/uploads/" + uniqueFileName;

            // Update employee record with the file URL
            Optional<Employee> optionalEmployee = employeeRepository.findById(employeeId);
            if (optionalEmployee.isPresent()) {
                Employee employee = optionalEmployee.get();
                employee.setImageUrl(fileUrl);
                employeeRepository.save(employee);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Employee not found."));
            }

            // Return success response
            return ResponseEntity.ok(Map.of("success", true, "fileUrl", fileUrl));
        } catch (IOException e) {
            e.printStackTrace(); // Log the error details
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "File upload failed: " + e.getMessage()));
        }
    }


    @GetMapping("/{filename}")
    @Secured({"ROLE_EMPLOYEE", "ROLE_ADMIN"})
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            // Resolve the file path and normalize it
            Path filePath = Paths.get(System.getProperty("java.io.tmpdir") + "/uploads/").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            // Check if the resource exists and is readable
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);
            }

            // Determine the content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Return the file as a response
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}