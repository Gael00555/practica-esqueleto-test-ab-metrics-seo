'use server'

import { cookies } from 'next/headers'
import { COOKIE, assignVariant } from '@/lib/experiment'
import { recordConversionEvent } from '@/lib/db'

export async function recordConversion(): Promise<{
  status: 'recorded' | 'duplicate' | 'no-visitor'
}> {
  const visitorId = (await cookies()).get(COOKIE.visitor)?.value
  if (!visitorId) return { status: 'no-visitor' }

  // La variante se recalcula desde el id: no se confía en lo que mande el cliente.
  const variant = assignVariant(visitorId)
  const inserted = recordConversionEvent(visitorId, variant)
  return { status: inserted ? 'recorded' : 'duplicate' }
}