'use client'

import { OFFER, VARIANTS, type Variant } from '@/lib/experiment'
import { recordConversion } from '@/app/practica/actions'

export function Landing({
  variant,
  track = true,
}: {
  variant: Variant
  track?: boolean
}) {
  const copy = VARIANTS[variant]

  return (
    <section className="flex flex-col gap-6">
      <h1 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight text-balance md:text-6xl">
        {copy.headline}
        {copy.emphasis ? (
          <>
            {' '}
            <em>{copy.emphasis}</em>
          </>
        ) : null}
      </h1>

      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
        {copy.lede}
      </p>

      <dl className="grid max-w-2xl gap-4 sm:grid-cols-2">
        {OFFER.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 border-t border-border pt-3">
            <dt className="font-mono text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase">
              {item.label}
            </dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => {
          if (track) void recordConversion()
        }}
        className="w-fit rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        {copy.cta}
      </button>
    </section>
  )
}