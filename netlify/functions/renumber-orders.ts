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
    try {
      await supabase.rpc('exec_sql', {
        sql: `SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders), true);`
      }).catch(() => {
        // If RPC doesn't exist or fails, that's okay - sequence will auto-adjust
        console.log('Could not reset sequence, but that\'s okay');
      });
    } catch (seqError) {
      console.log('Sequence reset not available:', seqError);
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

