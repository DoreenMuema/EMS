CREATE TABLE notification (
                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                              employee_id BIGINT NOT NULL,
                              type ENUM('LEAVE_REQUEST', 'TASK_ASSIGNMENT', 'MEETING_REMINDER', 'TASK_EXTENSION'),
                              message TEXT,
                              recipient_id BIGINT,
                              recipient_role VARCHAR(50),
                              read BOOLEAN DEFAULT FALSE,
                              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              leave_application_id BIGINT,
                              FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE,
                              FOREIGN KEY (leave_application_id) REFERENCES leave_application(leave_application_id) ON DELETE SET NULL
);
