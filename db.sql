USE taran_agency_db;

-- User Table
CREATE TABLE user_table (
    user_num INT AUTO_INCREMENT UNIQUE,
    name VARCHAR(50),
    phone VARCHAR(11),
    password VARCHAR(100),
    role_id ENUM('Admin', 'customer', 'employees'),
    is_active ENUM('Y', 'N') DEFAULT 'Y',
    doa DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_num)
);

-- OTP Access Table
CREATE TABLE otp_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    phone VARCHAR(11),
    otp_access VARCHAR(6),
    is_active ENUM('Y', 'N') DEFAULT 'Y',
    doa DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product Master Table
CREATE TABLE product_master (
    prod_num INT AUTO_INCREMENT PRIMARY KEY,
    prod_name VARCHAR(255),
    description TEXT,
    image VARCHAR(255),
    price DECIMAL(10, 2),
    batch VARCHAR(50),
    mfg TEXT,
    cgst DECIMAL(10, 2),
    sgst DECIMAL(10, 2),
    is_active ENUM('Y', 'N') DEFAULT 'Y',
    doa DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Address Table
CREATE TABLE address_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    address TEXT,
    user_id INT,
    default_flag ENUM('Y', 'N') DEFAULT 'N',
    is_active ENUM('Y', 'N') DEFAULT 'Y',
    doa DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stock Table
CREATE TABLE stock_table (
    stock_num INT AUTO_INCREMENT PRIMARY KEY,
    prod_num INT,
    user_id INT,
    qty INT,
    batch VARCHAR(50),
    mfg TEXT,
    is_active ENUM('Y', 'N') DEFAULT 'Y',
    doa DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prod_num) REFERENCES product_master(prod_num),
    FOREIGN KEY (user_id) REFERENCES user_table(user_num)
);

-- Order Table
CREATE TABLE order_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_json JSON,
    amount DECIMAL(10, 2),
    order_status ENUM('on_cart', 'payment done', 'delivered'),
    delivered_by VARCHAR(100),
    is_active ENUM('Y', 'N') DEFAULT 'Y',
    doa DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_table(user_num)
);

-- Invoice Table
CREATE TABLE invoice (
    invoice_num INT AUTO_INCREMENT PRIMARY KEY,
    txn_id VARCHAR(255),
    order_id INT,
    cgst DECIMAL(10, 2),
    sgst DECIMAL(10, 2),
    amount DECIMAL(10, 2),
    total_amt DECIMAL(10, 2),
    user_id INT,
    mode_of_payment VARCHAR(50),
    is_active ENUM('Y', 'N') DEFAULT 'Y',
    doa DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES order_table(id),
    FOREIGN KEY (user_id) REFERENCES user_table(user_num)
);
