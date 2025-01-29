-- Create Employee Table
CREATE TABLE employee (
                          employee_id SERIAL PRIMARY KEY,
                          first_name VARCHAR(255) NOT NULL,
                          surname VARCHAR(255) NOT NULL,
                          other_name VARCHAR(255),
                          phone VARCHAR(20) UNIQUE NOT NULL,
                          username VARCHAR(100) UNIQUE NOT NULL,
                          password VARCHAR(255) NOT NULL,
                          last_login TIMESTAMP,
                          password_expiry TIMESTAMP,
                          id_number VARCHAR(50) UNIQUE,
                          role VARCHAR(100),
                          name VARCHAR(255),
                          email VARCHAR(255) DEFAULT 'N/A',
                          age INTEGER,
                          designation VARCHAR(255) DEFAULT 'N/A',
                          is_active BOOLEAN DEFAULT TRUE,
                          employment_date DATE,
                          employment_type VARCHAR(100),
                          dob DATE,
                          gender VARCHAR(50),
                          department VARCHAR(255),
                          address VARCHAR(500),
                          image_url VARCHAR(500),
                          leave_balance INTEGER DEFAULT 0
);




