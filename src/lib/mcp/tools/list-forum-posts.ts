import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_forum_posts",
  title: "List farmer forum posts",
  description: "List posts from the Khetify farmer forum, newest first, optionally filtered by category.",
  inputSchema: {
    category: z.string().trim().optional().describe("Category filter."),
    limit: z.number().int().min(1).max(50).optional().describe("Max posts (default 15)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let request = supabaseForUser(ctx)
      .from("forum_posts")
      .select("id,title,content,category,likes_count,comments_count,is_pinned,created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 15);
    if (category) request = request.ilike("category", category);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
