export const PHONE_REGEX = /^8 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
export const PHONE_FORMAT_HINT = '8 (918) 999-99-99'

export function formatPhone(value) {
  let digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''

  if (digits[0] === '7') digits = `8${digits.slice(1)}`
  if (digits[0] !== '8') digits = `8${digits}`
  digits = digits.slice(0, 11)

  const code = digits.slice(1, 4)
  const mid = digits.slice(4, 7)
  const part1 = digits.slice(7, 9)
  const part2 = digits.slice(9, 11)

  let result = '8'
  if (digits.length > 1) result += ` (${code}`
  if (digits.length >= 4) result += ')'
  if (digits.length > 4) result += ` ${mid}`
  if (digits.length > 7) result += `-${part1}`
  if (digits.length > 9) result += `-${part2}`
  return result
}

export function isValidPhone(value) {
  return PHONE_REGEX.test(String(value || '').trim())
}
