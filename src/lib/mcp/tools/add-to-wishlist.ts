import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_to_wishlist",
  title: "Add to wishlist",
  description: "Save a Khetify product to the signed-in user's wishlist.",
  inputSchema: { product_id: z.string().uuid().describe("Product ID to save.") },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ product_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("wishlists")
      .upsert({ user_id: ctx.getUserId(), product_id }, { onConflict: "user_id,product_id" })
      .select();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved product ${product_id} to your wishlist.` }],
      structuredContent: { item: data?.[0] ?? null },
    };
  },
});
