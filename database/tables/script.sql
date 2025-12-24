CREATE TABLE products (
id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID() NOT NULL,
name VARCHAR(255) NOT NULL,
description TEXT,
price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
category VARCHAR(100) NOT NULL,
image_url VARCHAR(500),
is_active BOOLEAN DEFAULT TRUE,
stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
store_id UUID NOT NULL, 
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP,

CONSTRAINT fk_products_store
FOREIGN KEY (store_id)
REFERENCES stores(id)
ON DELETE CASCADE
);

CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);

CREATE TABLE addresses(
id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
customer_id UUID NOT NULL,
street VARCHAR(255) NOT NULL,
number VARCHAR(20) NOT NULL, 
complement VARCHAR(100),
neighborhood VARCHAR(100) NOT NULL, 
city VARCHAR(100) NOT NULL,
cep VARCHAR(8) NOT NULL, 
is_default BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP,

CONSTRAINT fk_address_customer
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE
);

CREATE INDEX idx_address_customer_id ON addresses(customer_id);
CREATE INDEX idx_address_is_default ON addresses(is_default);
CREATE INDEX idx_address_deleted_at ON addresses(deleted_at);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL,
    store_id UUID NOT NULL,
    delivery_person_id UUID,
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'in_delivery', 'delivered', 'cancelled')
    ),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid', 'refunded')
    ),
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN ('credit_card', 'debit_card', 'pix', 'cash')
    ),
    delivery_address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_orders_customer 
        FOREIGN KEY (customer_id) 
        REFERENCES customers(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_orders_store 
        FOREIGN KEY (store_id) 
        REFERENCES stores(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_orders_delivery 
        FOREIGN KEY (delivery_person_id) 
        REFERENCES delivery(id) 
        ON DELETE SET NULL
);


CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_delivery_person_id ON orders(delivery_person_id);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_created_at ON orders(created_at DESC);
CREATE INDEX idx_deleted_at ON orders(deleted_at);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_order_items_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_order_items_product 
        FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON DELETE RESTRICT
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE TABLE categories(
id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
name VARCHAR(100) NOT NULL UNIQUE, 
slug VARCHAR(100) NOT NULL UNIQUE, 
icon_url VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
deleted_at TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);

CREATE TABLE carts(
id UUID PRIMARY KEY DEFAULT UUID_GENERATE_V4(),
customer_id UUID NOT NULL, 
product_id UUID NOT NULL, 
quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT fk_carts_customer
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE,

CONSTRAINT fk_carts_product
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE CASCADE,

CONSTRAINT unique_customer_product UNIQUE (customer_id, product_id)
);

CREATE INDEX idx_carts_customer_id ON carts(customer_id);
CREATE INDEX idx_carts_product_id ON carts(product_id);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    store_id UUID NOT NULL,
    delivery_person_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_reviews_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_reviews_customer 
        FOREIGN KEY (customer_id) 
        REFERENCES customers(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_reviews_store 
        FOREIGN KEY (store_id) 
        REFERENCES stores(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_reviews_delivery 
        FOREIGN KEY (delivery_person_id) 
        REFERENCES delivery(id) 
        ON DELETE SET NULL,
    
    CONSTRAINT unique_review_per_order UNIQUE (order_id)
);

CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_store_id ON reviews(store_id);
CREATE INDEX idx_reviews_delivery_person_id ON reviews(delivery_person_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_deleted_at ON reviews(deleted_at);

CREATE OR REPLACE FUNCTION update_updated_at_columns()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_columns();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_columns();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_columns();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_columns();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_columns();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_columns();


COMMENT ON TABLE products IS 'Produtos cadastrados pelas lojas';
COMMENT ON TABLE addresses IS 'Endereços de entrega dos clientes';
COMMENT ON TABLE orders IS 'Pedidos realizados pelos clientes';
COMMENT ON TABLE order_items IS 'Itens individuais de cada pedido';
COMMENT ON TABLE categories IS 'Categoria de produtos';
COMMENT ON TABLE carts IS 'Carrinho de compras dos clientes';
COMMENT ON TABLE reviews IS 'Avaliações de pedidos e entregas';