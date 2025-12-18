import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Edit } from "lucide-react"
import type { Account } from "./currency-tab"

interface AccountTabProps {
  accounts: Account[]
}

function AccountTab({ accounts }: AccountTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {accounts.map((account) => {
        const Icon = account.icon
        return (
          <Card key={account.id} className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription className="capitalize">{account.type}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Balance Actual</p>
                <p
                  className={`text-3xl font-bold ${account.balance >= 0 ? "text-emerald-500" : "text-red-500"}`}
                >
                  ${Math.abs(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                  {account.currency}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default AccountTab
