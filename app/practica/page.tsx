import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import { Landing } from '@/components/landing'
import {
  CANONICAL_PATH,
  COOKIE,
  VARIANTS,
  assignVariant,
  isVariant,
  type Variant,
} from '@/lib/experiment'
import { recordImpression } from '@/lib/db'

type PracticaPageProps = {
  searchParams: Promise<{ preview?: string | string[] }>
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

// Orden: preview (solo para mirar) > header del proxy > cookie > control.
async function resolveVariant(preview: Variant | null): Promise<Variant> {
  if (preview) return preview

  const headerVariant = (await headers()).get('x-lab-variant')
  if (isVariant(headerVariant)) return headerVariant

  const visitorId = (await cookies()).get(COOKIE.visitor)?.value
  if (visitorId) return assignVariant(visitorId)

  return 'a'
}

export async function generateMetadata({
  searchParams,
}: PracticaPageProps): Promise<Metadata> {
  const params = await searchParams
  const requested = firstParam(params.preview)
  const preview = isVariant(requested) ? requested : null
  const variant = await resolveVariant(preview)
  const copy = VARIANTS[variant]

  return {
    title: { absolute: copy.seoTitle },
    description: copy.seoDescription,
    alternates: { canonical: CANONICAL_PATH },
    robots: preview
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export default async function PracticaPage({ searchParams }: PracticaPageProps) {
  const params = await searchParams
  const requested = firstParam(params.preview)
  const preview = isVariant(requested) ? requested : null
  const variant: Variant = await resolveVariant(preview)

  // Impresión: solo fuera del preview, y solo si el proxy marcó sesión nueva.
  if (!preview) {
    const h = await headers()
    const visitorId = h.get('x-lab-visitor')
    if (h.get('x-lab-count') === '1' && visitorId) {
      recordImpression(visitorId, variant)
    }
  }

  return (
    <main id="contenido" className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:py-14">
      {preview ? (
        <p className="border-b border-border pb-4 text-sm text-muted-foreground">
          Estás viendo el copy {preview.toUpperCase()} por query. No persiste, no cuenta
          como visita del experimento y esta vista lleva noindex.
        </p>
      ) : null}

      <Landing variant={variant} track={!preview} />

      <div className="flex flex-wrap gap-2">
        <Link href="/practica?preview=a" className="rounded-md border border-border px-3 py-1.5 text-sm">
          Ver copy A
        </Link>
        <Link href="/practica?preview=b" className="rounded-md border border-border px-3 py-1.5 text-sm">
          Ver copy B
        </Link>
        <Link href="/bitacora" className="rounded-md border border-border px-3 py-1.5 text-sm">
          Bitácora
        </Link>
      </div>
    </main>
  )
}