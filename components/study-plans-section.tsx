import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type StudyPlanItem = {
  title: string
  description: string
  category: string
  href: string
  meta: { label: string; value: string }[]
}

type StudyPlansSectionProps = {
  plans: StudyPlanItem[]
}

export function StudyPlansSection({ plans }: StudyPlansSectionProps) {
  return (
    <section className="bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Explore the Core Tools
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Move between reading, lookup, daily verses, and comparison without losing focus.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/bible">
              Start in Reader
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.title}
              className="group border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="p-5">
                <Badge variant="secondary" className="mb-3 font-medium">
                  {plan.category}
                </Badge>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {plan.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                
                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {plan.meta.map((item) => (
                    <div key={`${plan.title}-${item.label}`} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>

                <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
                  <Link href={plan.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
