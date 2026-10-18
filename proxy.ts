import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  COOKIE,
  SESSION_WINDOW,
  THIRTY_DAYS,
  assignVariant,
  cookieOptions,
  isVariant,
} from '@/lib/experiment'

const BOT = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit/i

function cleanHeaders(request: NextRequest) {
  // Nunca confiamos en estos headers si vienen de afuera.
  const headers = new Headers(request.headers)
  headers.delete('x-lab-variant')
  headers.delete('x-lab-visitor')
  headers.delete('x-lab-count')
  return headers
}

export function proxy(request: NextRequest) {
  // Preview: instrumento. No escribe cookies ni cuenta.
  if (isVariant(request.nextUrl.searchParams.get('preview'))) {
    return NextResponse.next({ request: { headers: cleanHeaders(request) } })
  }

  // Crawler: control fijo, sin cookies, sin contar. Misma URL, mismo canonical.
  if (BOT.test(request.headers.get('user-agent') ?? '')) {
    const headers = cleanHeaders(request)
    headers.set('x-lab-variant', 'a')
    return NextResponse.next({ request: { headers } })
  }

  const secure = request.nextUrl.protocol === 'https:'
  const existing = request.cookies.get(COOKIE.visitor)?.value
  const visitorId = existing ?? crypto.randomUUID()
  const variant = assignVariant(visitorId)
  const newSession = !request.cookies.has(COOKIE.impressed)

  const headers = cleanHeaders(request)
  headers.set('x-lab-variant', variant)
  headers.set('x-lab-visitor', visitorId)
  if (newSession) headers.set('x-lab-count', '1')

  const response = NextResponse.next({ request: { headers } })

  if (!existing) {
    response.cookies.set(COOKIE.visitor, visitorId, cookieOptions(secure, THIRTY_DAYS))
    response.cookies.set(COOKIE.variant, variant, cookieOptions(secure, THIRTY_DAYS))
  }
  if (newSession) {
    response.cookies.set(COOKIE.impressed, '1', cookieOptions(secure, SESSION_WINDOW))
  }
  return response
}

export const config = {
  matcher: ['/practica'],
}