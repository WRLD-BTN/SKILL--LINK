# Phone-First Auth Setup

SkillLink now treats `phone` as the primary identity field for client and tradesperson accounts. `email` is optional.

## Supabase

1. In Supabase Auth, enable `Phone Login`.
2. Configure phone auth to use a custom `Send SMS Hook` if you want Africa's Talking to deliver OTP messages.
3. Keep phone numbers in E.164 format, for example `+263718321438`.

## Africa's Talking

Backend environment variables:

```env
AT_USERNAME=sandbox
AT_API_KEY=your-africas-talking-api-key
AT_SENDER_ID=
AT_VERIFICATION_MESSAGE=Your SkillLink verification code is
```

## Local API endpoints

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`

## Note

The current backend keeps OTP codes in memory for development. Move them to a durable store before launch.
