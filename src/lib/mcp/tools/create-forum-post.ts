import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_forum_post",
  title: "Create farmer forum post",
  description: "Publish a new post to the Khetify farmer forum as the signed-in user.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Post title."),
    content: z.string().trim().min(1).describe("Post body."),
    category: z.string().trim().min(1).describe("Post category, e.g. 'general'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, content, category }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("forum_posts")
      .insert({ user_id: ctx.getUserId(), title, content, category })
      .select();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? null) }],
      structuredContent: { post: data?.[0] ?? null },
    };
  },
});
