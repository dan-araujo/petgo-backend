CREATE OR REPLACE VIEW v_orders_detailed AS 
SELECT 
  o.id,
  o.created_at,
  o.status,
  o.total,
  c.name AS customer_name,
  c.email AS customer_email,
  s.name AS store_name,
  d.name AS delivery_person_name,
  COUNT(oi.id) AS total_items
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN stores s ON o.store_id = s.id
LEFT JOIN delivery d ON o.delivery_person_id = d.id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.deleted_at IS NULL
GROUP BY o.id, c.name, c.email, s.name, d.name;

CREATE OR REPLACE VIEW v_top_product AS 
SELECT
  p.id,
  p.name,
  p.category,
  s.name AS store_name
  COUNT(id.id) AS total_sales,
  SUM(oi.quantity) AS total_quantity,
  SUM(oi.subtotal) AS total_renvenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN stores s ON p.store_id = s.id 
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.name, p.category, s.name
ORDER BY total_sales DESC;