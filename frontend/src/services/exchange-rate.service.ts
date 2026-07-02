const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/usd"

export interface UsdExchangeRates {
  baseCode: string
  rates: Record<string, number>
  lastUpdateUtc: string
}

export interface CurrencyInfo {
  code: string
  name: string
  popular?: boolean
}

interface ExchangeRateApiResponse {
  result: string
  base_code: string
  rates: Record<string, number>
  time_last_update_utc: string
}

/** Monedas populares mostradas primero en el selector */
export const POPULAR_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "Dólar estadounidense", popular: true },
  { code: "DOP", name: "Peso dominicano", popular: true },
  { code: "MXN", name: "Peso mexicano", popular: true },
  { code: "COP", name: "Peso colombiano", popular: true },
  { code: "EUR", name: "Euro", popular: true },
  { code: "GBP", name: "Libra esterlina", popular: true },
  { code: "CAD", name: "Dólar canadiense", popular: true },
  { code: "ARS", name: "Peso argentino", popular: true },
  { code: "BRL", name: "Real brasileño", popular: true },
  { code: "CHF", name: "Franco suizo", popular: true },
  { code: "JPY", name: "Yen japonés", popular: true },
  { code: "CNY", name: "Yuan chino", popular: true },
]

const currencyDisplayNames =
  typeof Intl !== "undefined"
    ? new Intl.DisplayNames(["es"], { type: "currency" })
    : null

/** Obtiene las tasas de cambio con base USD desde open.er-api.com */
export async function getUsdExchangeRates(): Promise<UsdExchangeRates> {
  const res = await fetch(EXCHANGE_RATE_API)
  if (!res.ok) throw new Error("No se pudo obtener la tasa de cambio")

  const data = (await res.json()) as ExchangeRateApiResponse
  if (data.result !== "success" || !data.rates) {
    throw new Error("Respuesta inválida de la API de cambio")
  }

  return {
    baseCode: data.base_code,
    rates: data.rates,
    lastUpdateUtc: data.time_last_update_utc,
  }
}

export function getCurrencyName(code: string): string {
  const popular = POPULAR_CURRENCIES.find((c) => c.code === code)
  if (popular) return popular.name
  return currencyDisplayNames?.of(code) ?? code
}

/** Lista ordenada: populares primero, luego el resto alfabéticamente */
export function buildCurrencyList(rates: Record<string, number>): CurrencyInfo[] {
  const popularCodes = new Set(POPULAR_CURRENCIES.map((c) => c.code))
  const popular = POPULAR_CURRENCIES.filter((c) => c.code in rates)
  const others = Object.keys(rates)
    .filter((code) => !popularCodes.has(code))
    .sort()
    .map((code) => ({ code, name: getCurrencyName(code) }))
  return [...popular, ...others]
}

/**
 * Convierte entre dos monedas usando tasas con base USD.
 * rates[X] = cuántas unidades de X equivalen a 1 USD.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  if (from === to) return amount
  const fromRate = rates[from]
  const toRate = rates[to]
  if (!fromRate || !toRate) return NaN
  return (amount / fromRate) * toRate
}

export function getExchangeRate(
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  return convertCurrency(1, from, to, rates)
}

export function formatConvertedAmount(value: number): string {
  if (!Number.isFinite(value)) return ""
  const abs = Math.abs(value)
  if (abs >= 1000) return value.toFixed(2)
  if (abs >= 1) return value.toFixed(4)
  if (abs >= 0.01) return value.toFixed(6)
  return value.toFixed(8)
}
