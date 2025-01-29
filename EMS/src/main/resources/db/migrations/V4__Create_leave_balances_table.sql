CREATE TABLE leave_balance (
                               leave_balance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                               employee_id BIGINT NOT NULL,
                               leave_type VARCHAR(50) NOT NULL,
                               available_balance INT NOT NULL,
                               eligible_balance INT NOT NULL,
                               FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);
