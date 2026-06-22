export const cleanPhone = (phone) => (phone || '').replace(/[^\d+]/g, '')

export const telLink = (phone) => `tel:${cleanPhone(phone)}`

export const waLink = (phone, message = '') => {
  let p = cleanPhone(phone)
  if (p && !p.startsWith('+') && p.length === 10) p = `91${p}` // assume India if 10-digit local number
  const base = `https://wa.me/${p.replace('+', '')}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
