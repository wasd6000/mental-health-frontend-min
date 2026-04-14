type Channel = 'sms' | 'email'

interface StoredCode {
  code: string
  expiresAt: number
  cooldownUntil: number
  channel: Channel
  target: string
}

const LS_PREFIX = 'VERIFICATION_CODE::'

function keyOf(channel: Channel, target: string) {
  return `${LS_PREFIX}${channel}::${target}`
}

function now() {
  return Date.now()
}

function readStored(channel: Channel, target: string): StoredCode | null {
  const raw = localStorage.getItem(keyOf(channel, target))
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredCode
  } catch {
    return null
  }
}

function writeStored(channel: Channel, target: string, data: StoredCode) {
  localStorage.setItem(keyOf(channel, target), JSON.stringify(data))
}

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function getCooldownRemainingSeconds(channel: Channel, target: string): number {
  const s = readStored(channel, target)
  if (!s) return 0
  const remainMs = s.cooldownUntil - now()
  return remainMs > 0 ? Math.ceil(remainMs / 1000) : 0
}

export function sendVerificationCode(params: {
  channel: Channel
  target: string
  cooldownSeconds?: number
  ttlSeconds?: number
}): { code: string; expiresAt: number; cooldownUntil: number } {
  const cooldownSeconds = params.cooldownSeconds ?? 60
  const ttlSeconds = params.ttlSeconds ?? 300

  const existing = readStored(params.channel, params.target)
  if (existing && existing.cooldownUntil > now()) {
    throw new Error(`请${Math.ceil((existing.cooldownUntil - now()) / 1000)}秒后再试`)
  }

  const code = genCode()
  const expiresAt = now() + ttlSeconds * 1000
  const cooldownUntil = now() + cooldownSeconds * 1000

  writeStored(params.channel, params.target, {
    code,
    expiresAt,
    cooldownUntil,
    channel: params.channel,
    target: params.target,
  })

  return { code, expiresAt, cooldownUntil }
}

export function verifyCode(params: { channel: Channel; target: string; code: string }): { ok: boolean; reason?: string } {
  const s = readStored(params.channel, params.target)
  if (!s) return { ok: false, reason: '请先获取验证码' }
  if (s.expiresAt <= now()) return { ok: false, reason: '验证码已过期，请重新获取' }
  if (String(params.code).trim() !== s.code) return { ok: false, reason: '验证码错误' }
  return { ok: true }
}

