interface OtpRecord {
  code: string
  expiresAt: number
}

const otpStore = new Map<string, OtpRecord>()
const ttlMs = 5 * 60 * 1000

export function createOtp(phone: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + ttlMs,
  })

  return code
}

export function verifyOtp(phone: string, code: string) {
  const entry = otpStore.get(phone)

  if (!entry) {
    return { ok: false, message: 'No verification code was requested for this phone number.' }
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone)
    return { ok: false, message: 'The verification code has expired. Request a new one.' }
  }

  if (entry.code !== code) {
    return { ok: false, message: 'The verification code is incorrect.' }
  }

  otpStore.delete(phone)
  return { ok: true, message: 'Phone number verified successfully.' }
}
