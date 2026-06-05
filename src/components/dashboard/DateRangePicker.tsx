'use client'

interface Props {
  dateFrom: string
  dateTo: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
}

export function DateRangePicker({ dateFrom, dateTo, onFromChange, onToChange }: Props) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="date"
        value={dateFrom}
        max={dateTo}
        onChange={(e) => onFromChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm bg-white"
      />
      <span className="text-muted-foreground">~</span>
      <input
        type="date"
        value={dateTo}
        min={dateFrom}
        max={new Date().toISOString().slice(0, 10)}
        onChange={(e) => onToChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm bg-white"
      />
    </div>
  )
}
