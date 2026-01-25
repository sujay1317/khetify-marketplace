
-- Grant execute permission on has_role function to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Also grant on get_user_role if it exists
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
