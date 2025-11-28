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
 * Generate order_id in original format: timestamp + random 4 digits
 * Format: 17345678901234 (Date.now() + random 4 digits)
 */
function generateOrderId(): string {
  return `${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

/**
 * Netlify serverless function to regenerate order_id values
 * 
 * This function regenerates order_id for all orders to the original format
 * (timestamp + random digits) instead of "ORDER-1", "ORDER-2", etc.
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

    // Get all orders
    const { data: allOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_id, created_at')
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
        body: JSON.stringify({ count: 0, message: 'No orders to regenerate' }),
      };
    }

    // Regenerate order_id for each order
    let updatedCount = 0;
    for (const order of allOrders) {
      // Generate new order_id in original format
      // Use the order's created_at timestamp to maintain chronological order
      const orderDate = new Date(order.created_at);
      const timestamp = orderDate.getTime();
      const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const newOrderId = `${timestamp}${randomDigits}`;

      // Update the order
      const { error: updateError } = await supabase
        .from('orders')
        .update({ order_id: newOrderId })
        .eq('id', order.id);
      
      if (updateError) {
        console.error(`Error updating order ${order.id}:`, updateError);
        throw new Error(`Failed to update order ${order.id}: ${updateError.message}`);
      }
      
      updatedCount++;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        count: updatedCount,
        message: `Successfully regenerated order_id for ${updatedCount} orders`
      }),
    };
  } catch (error: any) {
    console.error("Error regenerating order IDs:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || "Failed to regenerate order IDs",
        details: error.stack || null
      }),
    };
  }
};

