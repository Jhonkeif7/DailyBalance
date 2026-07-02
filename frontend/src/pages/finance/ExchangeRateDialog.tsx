import { useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  buildCurrencyList,
  convertCurrency,
  formatConvertedAmount,
  getCurrencyName,
  getExchangeRate,
  getUsdExchangeRates,
  type CurrencyInfo,
  type UsdExchangeRates,
} from "@/services/exchange-rate.service"
import { formatNumber } from "./finance-utils"
import { CurrencyPickerRow, CurrencyPickerTrigger } from "./CurrencyPicker"
import { CurrencyPickerProvider, useCurrencyPickerContext } from "./currency-picker-context"

interface ExchangeRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CurrencyRowProps {
  pickerId: string
  id: string
  amount: string
  currency: string
  currencies: CurrencyInfo[]
  onAmountChange: (value: string) => void
  onCurrencyChange: (code: string) => void
  disabled?: boolean
}

function CurrencyRow({
  pickerId,
  id,
  amount,
  currency,
  currencies,
  onAmountChange,
  onCurrencyChange,
  disabled,
}: CurrencyRowProps) {
  return (
    <CurrencyPickerRow
      pickerId={pickerId}
      value={currency}
      currencies={currencies}
      onChange={onCurrencyChange}
    >
      <div className="rounded-2xl border border-border sm:rounded-full">
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
            className="min-w-0 w-full border-0 bg-transparent px-3 py-2.5 text-base outline-none focus:ring-0 disabled:opacity-50 sm:flex-1 sm:px-4 sm:py-3"
            autoComplete="off"
          />
          <div className="hidden w-px self-stretch bg-border sm:block" aria-hidden="true" />
          <div className="min-w-0 border-t border-border sm:flex-[1.2] sm:border-t-0 md:flex-[1.4]">
            <CurrencyPickerTrigger
              pickerId={pickerId}
              value={currency}
              currencies={currencies}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </CurrencyPickerRow>
  )
}

function formatLastUpdate(utc: string): string {
  try {
    return new Intl.DateTimeFormat("es-DO", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(new Date(utc))
  } catch {
    return utc
  }
}

function ExchangeRateDialog({ open, onOpenChange }: ExchangeRateDialogProps) {
  const [rates, setRates] = useState<UsdExchangeRates | null>(null)
  const [loading, setLoading] = useState(false)
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("DOP")
  const [fromAmount, setFromAmount] = useState("1")
  const [toAmount, setToAmount] = useState("")

  const currencies = useMemo(
    () => (rates ? buildCurrencyList(rates.rates) : []),
    [rates]
  )

  const exchangeRate = rates ? getExchangeRate(fromCurrency, toCurrency, rates.rates) : null

  const syncToAmount = (amount: string, from: string, to: string, rateData: UsdExchangeRates) => {
    const parsed = parseFloat(amount)
    if (Number.isNaN(parsed)) {
      setToAmount("")
      return
    }
    setToAmount(formatConvertedAmount(convertCurrency(parsed, from, to, rateData.rates)))
  }

  const syncFromAmount = (amount: string, from: string, to: string, rateData: UsdExchangeRates) => {
    const parsed = parseFloat(amount)
    if (Number.isNaN(parsed)) {
      setFromAmount("")
      return
    }
    setFromAmount(formatConvertedAmount(convertCurrency(parsed, to, from, rateData.rates)))
  }

  const fetchRates = async () => {
    setLoading(true)
    try {
      const data = await getUsdExchangeRates()
      setRates(data)
      syncToAmount(fromAmount || "1", fromCurrency, toCurrency, data)
    } catch {
      toast.error("No se pudo cargar la tasa de cambio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) void fetchRates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (!rates) return
    syncToAmount(value, fromCurrency, toCurrency, rates)
  }

  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    if (!rates) return
    syncFromAmount(value, fromCurrency, toCurrency, rates)
  }

  const handleFromCurrencyChange = (code: string) => {
    const nextTo = code === toCurrency ? fromCurrency : toCurrency
    if (code === toCurrency) setToCurrency(fromCurrency)
    setFromCurrency(code)
    if (rates) syncToAmount(fromAmount || "1", code, nextTo, rates)
  }

  const handleToCurrencyChange = (code: string) => {
    const nextFrom = code === fromCurrency ? toCurrency : fromCurrency
    if (code === fromCurrency) setFromCurrency(toCurrency)
    setToCurrency(code)
    if (rates) syncToAmount(fromAmount || "1", nextFrom, code, rates)
  }

  const fromName = getCurrencyName(fromCurrency)
  const toName = getCurrencyName(toCurrency)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CurrencyPickerProvider>
        <ExchangeRateDialogContent
          loading={loading}
          exchangeRate={exchangeRate}
          fromName={fromName}
          toName={toName}
          rates={rates}
          fromAmount={fromAmount}
          toAmount={toAmount}
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          currencies={currencies}
          onFetchRates={fetchRates}
          onFromAmountChange={handleFromAmountChange}
          onToAmountChange={handleToAmountChange}
          onFromCurrencyChange={handleFromCurrencyChange}
          onToCurrencyChange={handleToCurrencyChange}
        />
      </CurrencyPickerProvider>
    </Dialog>
  )
}

interface ExchangeRateDialogContentProps {
  loading: boolean
  exchangeRate: number | null
  fromName: string
  toName: string
  rates: UsdExchangeRates | null
  fromAmount: string
  toAmount: string
  fromCurrency: string
  toCurrency: string
  currencies: CurrencyInfo[]
  onFetchRates: () => void
  onFromAmountChange: (value: string) => void
  onToAmountChange: (value: string) => void
  onFromCurrencyChange: (code: string) => void
  onToCurrencyChange: (code: string) => void
}

function ExchangeRateDialogContent({
  loading,
  exchangeRate,
  fromName,
  toName,
  rates,
  fromAmount,
  toAmount,
  fromCurrency,
  toCurrency,
  currencies,
  onFetchRates,
  onFromAmountChange,
  onToAmountChange,
  onFromCurrencyChange,
  onToCurrencyChange,
}: ExchangeRateDialogContentProps) {
  const pickerCtx = useCurrencyPickerContext()

  return (
    <DialogContent
      className="max-h-[90dvh] gap-4 overflow-x-hidden overflow-y-auto p-4 sm:max-w-[480px] sm:gap-6 sm:p-6"
      onEscapeKeyDown={(event) => {
        if (pickerCtx?.activeId) event.preventDefault()
      }}
    >
      <div className="min-w-0 space-y-1 pr-6 pt-1">
        {loading && !exchangeRate ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
            Cargando tasa de cambio…
          </div>
        ) : exchangeRate ? (
          <>
            <p className="text-xs text-muted-foreground sm:text-sm">
              1 {fromName} es igual a
            </p>
            <p className="text-2xl font-normal leading-tight tracking-tight text-foreground sm:text-4xl">
              <span className="break-words">{formatNumber(exchangeRate)}</span>{" "}
              <span className="break-words">{toName}</span>
            </p>
            <div className="flex flex-col gap-1 pt-1 text-[11px] text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1.5 sm:gap-y-1 sm:text-xs">
              {rates?.lastUpdateUtc && (
                <span className="break-words">{formatLastUpdate(rates.lastUpdateUtc)}</span>
              )}
              <span className="hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <span>De ExchangeRate-API</span>
              <span className="hidden sm:inline" aria-hidden="true">
                ·
              </span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto w-fit p-0 text-[11px] text-muted-foreground sm:text-xs"
                onClick={() => void onFetchRates()}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-1 inline h-3 w-3 ${loading ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                Actualizar
              </Button>
            </div>
          </>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">Tasa no disponible</p>
        )}
      </div>

      <div className="min-w-0 space-y-2.5 sm:space-y-3">
        <CurrencyRow
          pickerId="from"
          id="from-amount"
          amount={fromAmount}
          currency={fromCurrency}
          currencies={currencies}
          onAmountChange={onFromAmountChange}
          onCurrencyChange={onFromCurrencyChange}
          disabled={!rates || loading}
        />
        <CurrencyRow
          pickerId="to"
          id="to-amount"
          amount={toAmount}
          currency={toCurrency}
          currencies={currencies}
          onAmountChange={onToAmountChange}
          onCurrencyChange={onToCurrencyChange}
          disabled={!rates || loading}
        />
      </div>
    </DialogContent>
  )
}

export { ExchangeRateDialog }
