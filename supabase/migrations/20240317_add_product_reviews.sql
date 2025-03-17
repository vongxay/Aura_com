/*
  # Add Product Reviews and Category

  1. Updates
    - Add `category` field to products table
  
  2. New Tables
    - `product_reviews` - Store user reviews for products
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `user_id` (uuid, references auth.users)
      - `user_name` (text)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS
    - Add policies for reviews
*/

-- Add category to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;

-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for product reviews
CREATE POLICY "Users can view all product reviews"
  ON product_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to prevent multiple reviews for the same product
CREATE OR REPLACE FUNCTION prevent_multiple_reviews()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM product_reviews
    WHERE user_id = NEW.user_id AND product_id = NEW.product_id AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'User has already reviewed this product';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent multiple reviews
CREATE TRIGGER check_one_review_per_product
  BEFORE INSERT OR UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION prevent_multiple_reviews();

-- Add category to some existing products (example data)
UPDATE products SET category = 'เครื่องสำอาง' WHERE id = '1';
UPDATE products SET category = 'อาหารเสริม' WHERE id = '2';
UPDATE products SET category = 'สกินแคร์' WHERE id = '3';
UPDATE products SET category = 'เครื่องสำอาง' WHERE id = '4'; 