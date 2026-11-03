# Data model (first draft)

Subject to change in Phase 2.

## products
- id, slug, name, description, ingredients, allergens, storage_tips, image_url, is_active

## variants
- id, product_id, label (e.g. "Whole wheat, 800g"), flour_type, weight_g, price_ils, stock_quantity

## customers
- id, name, email, phone

## orders
- id, customer_id, status (pending, paid, preparing, ready, delivered, cancelled), fulfillment (pickup or delivery), delivery_address, total_ils, payment_reference, created_at

## order_items
- id, order_id, variant_id, quantity, unit_price_ils

## advisor_messages (for logging and evaluation)
- id, session_id, role, content, created_at

## Notes
- Store money as integers (agorot) to avoid rounding errors.
- Keep a price snapshot in `order_items` so old orders stay correct if prices change.
