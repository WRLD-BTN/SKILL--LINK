# Supabase Notes

Run `schema.sql` inside the Supabase SQL editor after creating your `skilllink-zw` project.

Recommended auth settings for the MVP:

- Enable email/password auth
- Enable phone auth
- Disable email confirmation during early testing if you want faster onboarding
- Add `http://localhost:5173` to your allowed redirect URLs
- Use phone as the primary login identifier and keep email optional
- Review `phone-auth-setup.md` for the phone-first and Africa's Talking setup
