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
ALTER TABLE users ADD COLUMN profile_img BYTEA; -- to store image binary (optional)


CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS location      TEXT,
  ADD COLUMN IF NOT EXISTS lat           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS geom          GEOGRAPHY(Point, 4326);

UPDATE users
  SET geom = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- index for fast “within radius” searches
CREATE INDEX IF NOT EXISTS idx_users_geom ON users USING GIST (geom);

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
 ALTER TABLE products
ADD COLUMN bidding_closed BOOLEAN DEFAULT FALSE;

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

-- =============================================
-- 9. Winners TABLE (OPTIONAL)
-- =============================================

CREATE TABLE winners (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  bid_id INTEGER NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE winners ADD COLUMN payment_id INTEGER REFERENCES payments(id);
-- 10. payments

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,  -- Usually admin
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,  -- Buyer or Farmer
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  winner_id INTEGER REFERENCES winners(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  momo_reference VARCHAR(100) UNIQUE, -- MoMo Transaction ID
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  description TEXT, -- optional (e.g., "Bid Winner Payment", "Refund", etc.)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAaMP,
  paid_at TIMESTAMP
);

--11. wallets
 CREATE TABLE wallets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--12 . refunds 

CREATE TABLE refunds (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

