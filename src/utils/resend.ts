export function getResendClient() {
  const { Resend } = require('resend') as typeof import('resend')
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not set')
  }
  return new Resend(apiKey)
}
