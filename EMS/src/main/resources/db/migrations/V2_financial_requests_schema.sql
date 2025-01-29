-- Create Financial Request Table
CREATE TABLE financial_requests (
                                    id SERIAL PRIMARY KEY,
                                    employee_id INT NOT NULL,
                                    item_description TEXT NOT NULL,
                                    amount DECIMAL(10,2) NOT NULL,
                                    status VARCHAR(100) NOT NULL,
                                    proof_file_url VARCHAR(500),
                                    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    type VARCHAR(50) CHECK (type IN ('REQUISITION', 'CLAIM')),
                                    CONSTRAINT fk_financial_employee FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);