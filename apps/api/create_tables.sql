-- Create transactions table for MariaDB
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId VARCHAR(100) NOT NULL UNIQUE,
  status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  customerEmail VARCHAR(255) NOT NULL,
  customerName VARCHAR(255) NOT NULL,
  customerPhone VARCHAR(50),
  street VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(2) DEFAULT 'NG',
  orderItems JSON,
  paydestal_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on orderId for faster lookups
CREATE INDEX idx_orderId ON transactions(orderId);
CREATE INDEX idx_status ON transactions(status);