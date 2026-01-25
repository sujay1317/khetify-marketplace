// ============================================================
// EDGE FUNCTION: create-order-notifications
// Purpose: Create notifications for sellers and admins when orders are placed
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
interface OrderItem {
  seller_id: string;
  product_id: string;
  quantity: number;
}

interface RequestBody {
  orderId: string;
  customerName: string;
  total: number;
  items: OrderItem[];
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUUID(value: string): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

function sanitizeString(value: string, maxLength: number): string {
  if (typeof value !== 'string') return '';
  // Remove HTML tags and trim
  return value.replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
}

function validateRequestBody(body: unknown): { valid: true; data: RequestBody } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { orderId, customerName, total, items } = body as Record<string, unknown>;

  // Validate orderId
  if (!orderId || typeof orderId !== 'string' || !validateUUID(orderId)) {
    return { valid: false, error: 'Invalid orderId: must be a valid UUID' };
  }

  // Validate customerName
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
    return { valid: false, error: 'Invalid customerName: must be a non-empty string' };
  }
  if (customerName.length > 200) {
    return { valid: false, error: 'Invalid customerName: must be less than 200 characters' };
  }

  // Validate total
  if (typeof total !== 'number' || total <= 0 || !isFinite(total)) {
    return { valid: false, error: 'Invalid total: must be a positive number' };
  }

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Invalid items: must be a non-empty array' };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== 'object') {
      return { valid: false, error: `Invalid item at index ${i}` };
    }
    if (item.seller_id && !validateUUID(item.seller_id)) {
      return { valid: false, error: `Invalid seller_id at item index ${i}` };
    }
    if (item.product_id && !validateUUID(item.product_id)) {
      return { valid: false, error: `Invalid product_id at item index ${i}` };
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      return { valid: false, error: `Invalid quantity at item index ${i}: must be a positive integer` };
    }
  }

  return {
    valid: true,
    data: {
      orderId,
      customerName: sanitizeString(customerName, 200),
      total,
      items: items as OrderItem[],
    },
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentication check - verify the user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Invalid token or user not found:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validation = validateRequestBody(rawBody);
    if (!validation.valid) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { orderId, customerName, total, items } = validation.data;

    // Validate the order exists and belongs to the authenticated user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_id, total")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (order.customer_id !== user.id) {
      console.error("User is not the owner of this order");
      return new Response(
        JSON.stringify({ error: "Unauthorized - You don't own this order" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the actual order total from database for notification (not client-provided)
    const verifiedTotal = order.total;

    console.log("Creating notifications for order:", orderId, "by user:", user.id);

    // Get unique seller IDs from order items in database (not from client input)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("seller_id")
      .eq("order_id", orderId);

    const sellerIds: string[] = [...new Set(
      (orderItems || []).map(item => item.seller_id).filter(Boolean)
    )] as string[];
    
    // Get all admin users
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminIds = adminRoles?.map(r => r.user_id) || [];

    // Create notifications for sellers
    const sellerNotifications = sellerIds.map((sellerId) => ({
      user_id: sellerId,
      title: "New Order Received! 🛒",
      message: `${customerName} placed an order worth ₹${verifiedTotal}. Check your dashboard for details.`,
      type: "order",
      order_id: orderId,
    }));

    // Create notifications for admins
    const adminNotifications = adminIds.map((adminId: string) => ({
      user_id: adminId,
      title: "New Order Placed! 📦",
      message: `${customerName} placed an order worth ₹${verifiedTotal} with ${items.length} item(s).`,
      type: "order",
      order_id: orderId,
    }));

    const allNotifications = [...sellerNotifications, ...adminNotifications];

    if (allNotifications.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .insert(allNotifications);

      if (error) {
        console.error("Error creating notifications:", error);
        throw error;
      }

      console.log(`Created ${allNotifications.length} notifications`);
    }

    return new Response(
      JSON.stringify({ success: true, count: allNotifications.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in create-order-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
