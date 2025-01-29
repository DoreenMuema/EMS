CREATE TABLE task (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      employee_id BIGINT NOT NULL,
                      title VARCHAR(255),
                      description TEXT,
                      due_date DATE,
                      start_date TIMESTAMP,
                      assigned_by VARCHAR(255),
                      status ENUM('PENDING', 'COMPLETED', 'EXTENSION_REQUESTED', 'APPROVED', 'REJECTED'),
                      extension_reason TEXT,
                      extension_requested_date TIMESTAMP,
                      extension_approved BOOLEAN DEFAULT FALSE,
                      created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);
