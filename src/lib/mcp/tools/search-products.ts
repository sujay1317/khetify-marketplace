import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search approved Khetify marketplace products by name or category (seeds, fertilizers, pesticides, tools).",
  inputSchema: {
    query: z.string().trim().optional().describe("Text to match against product names."),
    category: z.string().trim().optional().describe("Category filter, e.g. 'seeds'."),
    organic_only: z.boolean().optional().describe("Only return organic products."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, organic_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let request = supabaseForUser(ctx)
      .from("products")
      .select("id,name,category,price,original_price,unit,stock,is_organic,description,seller_id")
      .eq("is_approved", true)
      .limit(limit ?? 20);

    if (query) request = request.ilike("name", `%${query}%`);
    if (category) request = request.ilike("category", category);
    if (organic_only) request = request.eq("is_organic", true);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
