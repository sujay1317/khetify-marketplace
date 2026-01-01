import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { orderId, customerName, total, items } = await req.json();

    // Validate the order exists and belongs to the authenticated user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("customer_id")
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

    console.log("Creating notifications for order:", orderId, "by user:", user.id);

    // Get unique seller IDs from order items
    const sellerIds: string[] = [...new Set(items.map((item: any) => item.seller_id).filter(Boolean))] as string[];
    
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
      message: `${customerName} placed an order worth ₹${total}. Check your dashboard for details.`,
      type: "order",
      order_id: orderId,
    }));

    // Create notifications for admins
    const adminNotifications = adminIds.map((adminId: string) => ({
      user_id: adminId,
      title: "New Order Placed! 📦",
      message: `${customerName} placed an order worth ₹${total} with ${items.length} item(s).`,
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
