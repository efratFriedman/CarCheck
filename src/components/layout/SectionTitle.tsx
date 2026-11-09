export function SectionTitle({ id, title, meta }: { id?: string; title: string; meta?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2 id={id} className="text-xl font-bold">
        {title}
      </h2>
      {meta && <p className="text-sm text-muted">{meta}</p>}
    </div>
  )
}
