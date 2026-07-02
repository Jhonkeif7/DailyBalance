import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import type { CurrencyInfo } from "@/services/exchange-rate.service"
import { useCurrencyPickerContext } from "./currency-picker-context"

interface CurrencyPickerTriggerProps {
  pickerId: string
  value: string
  currencies: CurrencyInfo[]
  disabled?: boolean
}

interface CurrencyPickerPanelProps {
  pickerId: string
  value: string
  currencies: CurrencyInfo[]
  onChange: (code: string) => void
}

function CurrencyPickerTrigger({
  pickerId,
  value,
  currencies,
  disabled,
}: CurrencyPickerTriggerProps) {
  const ctx = useCurrencyPickerContext()
  const open = ctx?.activeId === pickerId
  const selected = currencies.find((c) => c.code === value)

  const toggle = () => {
    if (disabled) return
    ctx?.setActiveId(open ? null : pickerId)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={toggle}
      className="flex w-full min-w-0 items-center justify-between gap-2 px-3 py-2.5 text-left disabled:opacity-50 sm:px-4 sm:py-3"
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <span className="min-w-0 truncate text-xs sm:text-sm">
        <span className="font-medium sm:hidden">{value}</span>
        <span className="hidden sm:inline">{selected?.name ?? value}</span>
      </span>
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
          open && "rotate-180"
        )}
        aria-hidden="true"
      />
    </button>
  )
}

function CurrencyPickerPanel({
  pickerId,
  value,
  currencies,
  onChange,
}: CurrencyPickerPanelProps) {
  const ctx = useCurrencyPickerContext()
  const [search, setSearch] = useState("")
  const open = ctx?.activeId === pickerId

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return currencies
    return currencies.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    )
  }, [currencies, search])

  const popular = filtered.filter((c) => c.popular)
  const rest = filtered.filter((c) => !c.popular)

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const handleSelect = (code: string) => {
    onChange(code)
    ctx?.setActiveId(null)
    setSearch("")
  }

  const renderItems = (items: CurrencyInfo[]) =>
    items.map((currency) => (
      <button
        key={currency.code}
        type="button"
        onClick={() => handleSelect(currency.code)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2.5 text-left text-sm hover:bg-accent active:bg-accent",
          currency.code === value && "bg-accent/60"
        )}
      >
        <span className="min-w-0 truncate">
          <span className="font-medium">{currency.code}</span>
          <span className="text-muted-foreground"> — {currency.name}</span>
        </span>
        {currency.code === value && (
          <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        )}
      </button>
    ))

  if (!open) return null

  return (
    <div
      role="listbox"
      className="overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
    >
      <div className="border-b border-border p-2">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Buscar moneda…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto overscroll-contain p-1 sm:max-h-56">
        {filtered.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Sin resultados
          </p>
        ) : (
          <>
            {popular.length > 0 && (
              <div className="mb-1">
                <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Populares
                </p>
                {renderItems(popular)}
              </div>
            )}
            {rest.length > 0 && (
              <div>
                {popular.length > 0 && (
                  <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Todas
                  </p>
                )}
                {renderItems(rest)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface CurrencyPickerRowProps {
  pickerId: string
  value: string
  currencies: CurrencyInfo[]
  onChange: (code: string) => void
  disabled?: boolean
  children: ReactNode
}

function CurrencyPickerRow({
  pickerId,
  value,
  currencies,
  onChange,
  disabled,
  children,
}: CurrencyPickerRowProps) {
  const ctx = useCurrencyPickerContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const open = ctx?.activeId === pickerId

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        ctx?.setActiveId(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.stopPropagation()
      ctx?.setActiveId(null)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape, true)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape, true)
    }
  }, [open, ctx])

  return (
    <div ref={containerRef} className="space-y-2">
      {children}
      <CurrencyPickerPanel
        pickerId={pickerId}
        value={value}
        currencies={currencies}
        onChange={onChange}
      />
    </div>
  )
}

export { CurrencyPickerTrigger, CurrencyPickerRow }
