-- Fix order #1 status to 'done' so it appears in the pipeline
-- The order currently has status='completed' but pipeline expects 'done'

begin;

UPDATE public.orders
SET status = 'done', updated_at = now()
WHERE id = 1;

commit;

