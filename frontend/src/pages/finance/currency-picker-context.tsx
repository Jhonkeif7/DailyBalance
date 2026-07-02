import { createContext, useContext, useMemo, useState } from "react"

interface CurrencyPickerContextValue {
  activeId: string | null
  setActiveId: (id: string | null) => void
}

const CurrencyPickerContext = createContext<CurrencyPickerContextValue | null>(null)

function CurrencyPickerProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const value = useMemo(
    () => ({ activeId, setActiveId }),
    [activeId]
  )

  return (
    <CurrencyPickerContext.Provider value={value}>
      {children}
    </CurrencyPickerContext.Provider>
  )
}

function useCurrencyPickerContext() {
  return useContext(CurrencyPickerContext)
}

export { CurrencyPickerProvider, useCurrencyPickerContext }
