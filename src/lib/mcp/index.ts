import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProductsTool from "./tools/search-products";
import getProductTool from "./tools/get-product";
import listMyOrdersTool from "./tools/list-my-orders";
import listMyWishlistTool from "./tools/list-my-wishlist";
import addToWishlistTool from "./tools/add-to-wishlist";
import listForumPostsTool from "./tools/list-forum-posts";
import createForumPostTool from "./tools/create-forum-post";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "khetify-marketplace",
  title: "Khetify Marketplace",
  version: "0.1.0",
  instructions:
    "Tools for the Khetify farm-supplies marketplace. Browse and look up products, read and post in the farmer forum, and read or update the signed-in user's own orders and wishlist. All data access runs as the connected user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchProductsTool,
    getProductTool,
    listMyOrdersTool,
    listMyWishlistTool,
    addToWishlistTool,
    listForumPostsTool,
    createForumPostTool,
  ],
});
