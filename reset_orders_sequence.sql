-- SQL function to reset orders sequence after renumbering
-- Run this in Supabase SQL Editor to create the function

CREATE OR REPLACE FUNCTION reset_orders_sequence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset the sequence to the current max ID + 1
  PERFORM setval('orders_id_seq', COALESCE((SELECT MAX(id) FROM orders), 0) + 1, false);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_orders_sequence() TO authenticated;
GRANT EXECUTE ON FUNCTION reset_orders_sequence() TO anon;

