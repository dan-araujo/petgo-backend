CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON veterinaries
FOR EACH ROW 
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp_customers
BEFORE UPDATE ON customers
FOR EACH ROW 
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp_stores
BEFORE UPDATE ON stores
FOR EACH ROW 
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp_delivery
BEFORE UPDATE ON delivery
FOR EACH ROW 
EXECUTE FUNCTION update_timestamp();
