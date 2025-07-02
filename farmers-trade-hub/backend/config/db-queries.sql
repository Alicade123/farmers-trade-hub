-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Store hashed password (bcrypt)
    role VARCHAR(20) CHECK (role IN ('Farmer', 'Buyer', 'Admin')) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- =============================================
-- 2. PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    quantity NUMERIC(10, 2) CHECK (quantity >= 0) NOT NULL,
    price NUMERIC(12, 2) CHECK (price >= 0) NOT NULL,
    image BYTEA, -- For storing binary image data (e.g., jpg/png)
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional index for category
CREATE INDEX idx_products_category ON products(category);

-- =============================================
-- 3. BIDS TABLE
-- =============================================
CREATE TABLE bids (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) CHECK (amount > 0) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 4. ORDERS TABLE
-- =============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    quantity NUMERIC(10, 2) CHECK (quantity > 0) NOT NULL,
    final_price NUMERIC(12, 2) CHECK (final_price > 0) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. ADMIN COMMISSION TABLE
-- =============================================
CREATE TABLE admin_commission (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    commission_percent NUMERIC(5, 2) CHECK (commission_percent >= 0 AND commission_percent <= 100) NOT NULL,
    amount NUMERIC(12, 2) CHECK (amount >= 0) NOT NULL
);

-- =============================================
-- 7. TRANSPORTERS TABLE (OPTIONAL)
-- =============================================
CREATE TABLE transporters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    vehicle_number VARCHAR(50),
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--8. Optional linking table for orders & transporters
CREATE TABLE order_transport (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transporter_id INTEGER NOT NULL REFERENCES transporters(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. BIDS_FEES TABLE (OPTIONAL)
-- =============================================
CREATE TABLE bid_fees (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP
);
