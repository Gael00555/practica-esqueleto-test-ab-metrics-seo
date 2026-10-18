import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Taller Norte · Laboratorio 01',
  robots: { index: false, follow: false },
}

export default function HomePage() {
  return (
    <main id="contenido" className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-14">
      <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
        Laboratorio 01
      </p>
      <h1 className="font-serif text-4xl leading-tight tracking-tight text-balance md:text-5xl">
        Una landing, dos mensajes, una sola URL indexable
      </h1>
      <p className="text-lg leading-relaxed text-muted-foreground">
        Experimento A/B de Taller Norte: la variante se asigna en el servidor, vive en una cookie y no en la URL.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/practica" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Abrir la landing
        </Link>
        <Link href="/bitacora" className="rounded-md border border-border px-4 py-2 text-sm">
          Abrir la bitácora
        </Link>
      </div>
    </main>
  )
}