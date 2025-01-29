-- Create Leave Application Table
CREATE TABLE leave (
                       leave_application_id SERIAL PRIMARY KEY,
                       employee_id INT NOT NULL,
                       start_date DATE NOT NULL,
                       end_date DATE NOT NULL,
                       reason TEXT NOT NULL,
                       status VARCHAR(100) NOT NULL,
                       description TEXT,
                       days_requested INT,
                       submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       leave_type VARCHAR(100) NOT NULL,
                       CONSTRAINT fk_leave_employee FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);