import type { Metadata } from 'next'
import Link from 'next/link'
import {
  HASH_EXAMPLE_ID,
  TEST_CASE,
  VARIANTS,
  assignVariant,
  conversionRate,
  formatCount,
  formatPoints,
  formatRate,
  rateGap,
  type ExperimentLog,
  type Variant,
} from '@/lib/experiment'
import { readLog } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Bitácora',
  robots: { index: false, follow: false },
}

// La bitácora lee la base en cada request: no se cachea.
export const dynamic = 'force-dynamic'

const ROWS: Variant[] = ['a', 'b']

function LogTable({ log, caption }: { log: ExperimentLog; caption: string }) {
  return (
    <>
      <table className="w-full text-left text-sm">
        <caption className="mb-3 text-left text-muted-foreground">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 font-medium">Variante</th>
            <th className="py-2 font-medium">Impresiones</th>
            <th className="py-2 font-medium">Conversiones</th>
            <th className="py-2 font-medium">Tasa</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((variant) => (
            <tr key={variant} className="border-b border-border">
              <td className="py-3">
                {variant.toUpperCase()} · {VARIANTS[variant].name}
              </td>
              <td className="py-3 font-mono">{formatCount(log[variant].impressions)}</td>
              <td className="py-3 font-mono">{formatCount(log[variant].conversions)}</td>
              <td className="py-3 font-mono">{formatRate(conversionRate(log[variant]))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-mono text-sm">B − A = {formatPoints(rateGap(log))}</p>
    </>
  )
}

export default function BitacoraPage() {
  const live = readLog()

  return (
    <main id="contenido" className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:py-14">
      <p className="font-mono text-[0.7rem] tracking-[0.16em] text-muted-foreground uppercase">
        Laboratorio 01
      </p>
      <h1 className="max-w-2xl font-serif text-4xl tracking-tight text-balance md:text-5xl">
        Bitácora
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
        La tasa es conversiones divididas por impresiones. Sin impresiones, la tasa no existe.
        Una tasa más alta no es una prueba: acá no se declara ganador.
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl">Caso de prueba fijo</h2>
        <LogTable
          log={TEST_CASE}
          caption="Cohorte fija. A tiene que dar 7,50%, B 13,14% y la diferencia 5,64 pp."
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl">Eventos reales (base de datos)</h2>
        <LogTable log={live} caption="Conteos guardados en la base. Sin impresiones, la tasa dice Pendiente." />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-serif text-2xl">Verificación del hash</h2>
        <p className="font-mono text-sm">
          assignVariant({`'${HASH_EXAMPLE_ID}'`}) → {assignVariant(HASH_EXAMPLE_ID).toUpperCase()}
        </p>
      </section>

      <Link href="/practica" className="text-sm text-muted-foreground underline">
        Volver a la landing
      </Link>
    </main>
  )
}