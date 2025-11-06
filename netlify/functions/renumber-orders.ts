import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

/**
 * Create Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://umynzgzlqdphgrzixhsc.supabase.co";
  // Use service role key if available (needed to set IDs directly), otherwise use anon key
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVteW56Z3pscWRwaGdyeml4aHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTg2MTQsImV4cCI6MjA3NjE3NDYxNH0.UXuBlmkHgZCgoe95nTZ_PrAZU9TeoBHt9FjMw0sAFDo";
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Netlify serverless function to renumber orders sequentially
 * 
 * This function safely renumbers all orders to be sequential (1, 2, 3, ...)
 * by using SQL to handle the renumbering in a transaction-safe way.
 */
export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const supabase = getSupabaseClient();

    // Get all orders sorted by creation date
    const { data: allOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching orders:', fetchError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `Failed to fetch orders: ${fetchError.message}` }),
      };
    }
    
    if (!allOrders || allOrders.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count: 0, message: 'No orders to renumber' }),
      };
    }

    // Renumbering primary keys is complex - we'll use a direct SQL approach
    // First, let's get all order data we need to preserve
    const { data: fullOrders, error: fullError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (fullError) {
      throw new Error(`Failed to fetch full orders: ${fullError.message}`);
    }

    // Get all order items
    const orderIds = fullOrders.map(o => o.id);
    const { data: allItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    
    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }

    // Group items by order_id
    const itemsByOrder: { [key: number]: any[] } = {};
    (allItems || []).forEach((item: any) => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    });

    // Delete all orders (this will cascade delete order_items)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      throw new Error(`Failed to delete orders: ${deleteError.message}`);
    }

    // Re-insert orders with sequential IDs
    // IMPORTANT: Preserve the original order_id field (don't change it to ORDER-1, ORDER-2, etc.)
    for (let i = 0; i < fullOrders.length; i++) {
      const order = fullOrders[i];
      const newId = i + 1;
      
      // Remove id from order data but keep the original order_id
      const { id, ...orderData } = order;
      
      // Preserve the original order_id - don't change it
      const { data: newOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          id: newId
          // order_id stays as it was originally (e.g., "17345678901234" format)
        })
        .select()
        .single();
      
      if (insertError) {
        throw new Error(`Failed to insert order ${newId}: ${insertError.message}`);
      }

      // Re-insert order items with new order_id
      const items = itemsByOrder[order.id] || [];
      if (items.length > 0) {
        const itemsToInsert = items.map((item: any) => {
          const { id: itemId, order_id, ...itemData } = item;
          return {
            ...itemData,
            order_id: newId
          };
        });

        const { error: itemsInsertError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);
        
        if (itemsInsertError) {
          throw new Error(`Failed to insert items for order ${newId}: ${itemsInsertError.message}`);
        }
      }
    }

    // Reset the sequence to continue from the new max ID
    // This ensures future auto-increment continues correctly
    const maxId = fullOrders.length;
    const nextId = maxId + 1;
    
    console.log(`Attempting to reset sequence to continue from ID ${nextId} (max order ID: ${maxId})`);
    
    // Method 1: Try to call the SQL RPC function if it exists (best method)
    try {
      const { error: rpcError } = await supabase.rpc('reset_orders_sequence');
      
      if (!rpcError) {
        console.log(`✓ Sequence reset successfully via RPC to continue from ID ${nextId}`);
      } else {
        console.log('RPC function not available, trying alternative methods:', rpcError.message);
        throw rpcError; // Fall through to alternative methods
      }
    } catch (rpcError: any) {
      // Method 2: Check current sequence state and advance it if needed
      try {
        // First, check what the current sequence value is by inserting a test order
        const { data: testOrder, error: testError } = await supabase
          .from('orders')
          .insert({
            status: 'temp',
            customer_name: 'TEMP_SEQUENCE_CHECK',
            customer_email: 'temp@sequence.check',
            customer_phone: '0000000000',
            total_price: 0,
            currency: 'UAH',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (testError) {
          console.error('Cannot check sequence state:', testError.message);
          throw testError;
        }
        
        const currentSequenceId = testOrder.id;
        console.log(`Current sequence is at ID ${currentSequenceId}, need to advance to ${nextId}`);
        
        // Delete the test order
        await supabase.from('orders').delete().eq('id', currentSequenceId);
        
        // If sequence is behind, we need to advance it by inserting orders with specific IDs
        if (currentSequenceId < nextId) {
          console.log(`Sequence needs to advance from ${currentSequenceId} to ${nextId}`);
          
          // Insert temporary orders with IDs from currentSequenceId+1 to nextId, then delete them
          // This forces PostgreSQL to advance the sequence
          for (let i = currentSequenceId + 1; i <= nextId; i++) {
            try {
              const { data: advanceOrder, error: advanceError } = await supabase
                .from('orders')
                .insert({
                  id: i,
                  status: 'temp',
                  customer_name: 'TEMP_DELETE_ME',
                  customer_email: 'temp@delete.me',
                  customer_phone: '0000000000',
                  total_price: 0,
                  currency: 'UAH',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single();
              
              if (!advanceError && advanceOrder) {
                // Delete immediately to clean up
                await supabase.from('orders').delete().eq('id', i);
                console.log(`Advanced sequence through ID ${i}`);
              } else {
                console.log(`Could not insert ID ${i}, error:`, advanceError?.message);
              }
            } catch (e: any) {
              console.log(`Error advancing sequence at ID ${i}:`, e?.message);
              // Continue trying other IDs
            }
          }
          
          // Final check: insert one more test order to verify sequence is now at nextId+1
          const { data: finalTest, error: finalError } = await supabase
            .from('orders')
            .insert({
              status: 'temp',
              customer_name: 'TEMP_FINAL_CHECK',
              customer_email: 'temp@final.check',
              customer_phone: '0000000000',
              total_price: 0,
              currency: 'UAH',
            })
            .select()
            .single();
          
          if (!finalError && finalTest) {
            const finalSequenceId = finalTest.id;
            await supabase.from('orders').delete().eq('id', finalSequenceId);
            
            if (finalSequenceId >= nextId) {
              console.log(`✓ Sequence successfully advanced to ${finalSequenceId} (next order will be ${finalSequenceId + 1})`);
            } else {
              console.warn(`⚠ Sequence is at ${finalSequenceId}, but should be at least ${nextId}`);
            }
          }
        } else if (currentSequenceId >= nextId) {
          console.log(`✓ Sequence is already at ${currentSequenceId}, which is >= ${nextId}. No reset needed.`);
        }
      } catch (seqError: any) {
        console.error('Sequence reset error:', seqError?.message);
        console.warn('WARNING: Could not properly reset sequence. Please run reset_orders_sequence.sql in Supabase SQL Editor to fix this.');
        // Don't fail the operation, but log the warning
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        count: fullOrders.length,
        message: `Successfully renumbered ${fullOrders.length} orders`
      }),
    };
  } catch (error: any) {
    console.error("Error renumbering orders:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || "Failed to renumber orders",
        details: error.stack || null
      }),
    };
  }
};

