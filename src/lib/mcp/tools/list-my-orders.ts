import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_orders",
  title: "List my orders",
  description: "List the signed-in user's Khetify orders with their line items, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max orders (default 10)."),
    status: z.string().trim().optional().describe("Filter by order status, e.g. 'pending'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let request = supabaseForUser(ctx)
      .from("orders")
      .select(
        "id,status,total,payment_method,shipping_address,created_at,order_items(id,product_name,quantity,price)",
      )
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (status) request = request.eq("status", status);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { orders: data ?? [] },
    };
  },
});
