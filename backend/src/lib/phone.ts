export function normalizeZimbabwePhone(input: string) {
  const digits = input.replace(/\D/g, '')

  if (!digits) {
    return null
  }

  if (digits.startsWith('263') && digits.length === 12 && digits[3] === '7') {
    return `+${digits}`
  }

  if (digits.startsWith('07') && digits.length === 10) {
    return `+263${digits.slice(1)}`
  }

  if (digits.startsWith('7') && digits.length === 9) {
    return `+263${digits}`
  }

  return null
}
