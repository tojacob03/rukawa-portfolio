DROP POLICY IF EXISTS "Allow functions to insert contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Public can submit contact forms" ON public.contact_submissions;
REVOKE INSERT ON public.contact_submissions FROM anon, authenticated;