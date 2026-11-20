import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type BarChartItem = {
  label: string
  value: number
  colorClassName?: string
}

// A tiny, dependency-free bar chart for dashboard overviews.
export function SimpleBarChart({
  title,
  data,
}: {
  title: string
  data: BarChartItem[]
}) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => {
          const width = (item.value / max) * 100

          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full ${item.colorClassName ?? "bg-primary"}`}
                  style={{ width: `${Math.max(width, item.value > 0 ? 6 : 0)}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
