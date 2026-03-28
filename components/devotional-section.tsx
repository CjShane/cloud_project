import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { DailyVerseResult } from "@/lib/api/daily-verse"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type DevotionalSectionProps = {
  dailyVerse: DailyVerseResult
}

const quickLinks = [
  {
    title: "Bible Reader",
    description: "Pick a book and chapter to read straight through.",
    href: "/bible",
  },
  {
    title: "Passage Lookup",
    description: "Jump to any passage by reference.",
    href: "/lookup",
  },
  {
    title: "Daily Verse",
    description: "See the latest daily verse and its source.",
    href: "/daily",
  },
  {
    title: "Compare",
    description: "Read the same verse in two translations.",
    href: "/compare",
  },
]

export function DevotionalSection({ dailyVerse }: DevotionalSectionProps) {
  const verse = dailyVerse.passage.verses[0]

  return (
    <section className="bg-primary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm text-primary-foreground/80">
              <span>Daily Verse</span>
            </div>

            <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
              {dailyVerse.passage.reference}
            </h2>

            <p className="mt-3 text-sm text-primary-foreground/70">
              Updated hourly - {dailyVerse.passage.translation.toUpperCase()}
            </p>

            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/90">
              &ldquo;{verse?.text ?? "No verse available."}&rdquo;
            </p>

            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link href="/daily">
                View Daily Verse
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-foreground">
              Keep Studying
            </h3>
            {quickLinks.map((item) => (
              <Card
                key={item.title}
                className="border-0 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-primary-foreground/70">
                      {item.title}
                    </p>
                    <p className="text-base font-medium text-primary-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-primary-foreground">
                    <Link href={item.href}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
