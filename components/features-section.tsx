import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type FeatureItem = {
  icon: LucideIcon
  title: string
  description: string
  href: string
}

type FeaturesSectionProps = {
  features: FeatureItem[]
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Everything You Need for Deeper Study
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Powerful tools designed to help you engage with scripture like never before.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border bg-card transition-all hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Explore
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
