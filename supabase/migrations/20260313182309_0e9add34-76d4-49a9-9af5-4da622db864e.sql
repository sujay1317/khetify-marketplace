GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_name(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_seller_public_info(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_seller_of_order(uuid) TO anon, authenticated;