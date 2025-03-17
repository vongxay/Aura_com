/*
  # Update Points Calculation System

  This migration updates the points calculation system to award 1 point per item
  instead of calculating points based on the price.

  Changes:
  1. Update the calculate_points function
  2. Update the update_user_points function to count items
*/

-- Update function to award 1 point per item regardless of price
CREATE OR REPLACE FUNCTION calculate_points(price decimal)
RETURNS integer AS $$
BEGIN
  -- Always return 1 point regardless of price
  RETURN 1;
END;
$$ LANGUAGE plpgsql;

-- Update function to add points based on number of items in order
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_points (user_id, points)
  VALUES (NEW.user_id, (
    -- Sum the quantity of items in the order
    SELECT SUM(quantity)
    FROM order_items
    WHERE order_items.order_id = NEW.id
  ))
  ON CONFLICT (user_id) DO UPDATE
  SET points = user_points.points + EXCLUDED.points,
      updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: No need to recreate the trigger as it already exists 