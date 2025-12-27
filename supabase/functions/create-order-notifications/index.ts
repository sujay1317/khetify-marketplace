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

    const { orderId, customerName, total, items } = await req.json();
    
    console.log("Creating notifications for order:", orderId);

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
