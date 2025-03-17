/*
  # Add Points System

  1. New Tables
    - `user_points` - Track user points
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `points` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - Calculate points based on purchase amount
    - Update user points after purchase

  3. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create user points table
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own points"
  ON user_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update user points"
  ON user_points FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate points based on price
CREATE OR REPLACE FUNCTION calculate_points(price decimal)
RETURNS integer AS $$
BEGIN
  RETURN CASE
    WHEN price >= 80 THEN 3
    WHEN price >= 30 THEN 2
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to update user points after purchase
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_points (user_id, points)
  VALUES (NEW.user_id, (
    SELECT SUM(calculate_points(products.price))
    FROM order_items
    JOIN products ON products.id = order_items.product_id
    WHERE order_items.order_id = NEW.id
  ))
  ON CONFLICT (user_id) DO UPDATE
  SET points = user_points.points + EXCLUDED.points,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update points after order
CREATE TRIGGER update_points_after_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();