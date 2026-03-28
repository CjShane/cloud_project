import Link from "next/link"
import type { ComparedPassages } from "@/lib/api/compare-passages"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type TestimonialsSectionProps = {
  compare: ComparedPassages
}

export function TestimonialsSection({ compare }: TestimonialsSectionProps) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Compare Translations Side by Side
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See the same passage across translations without leaving the page.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {[compare.primary, compare.secondary].map((passage) => (
            <Card key={passage.translation} className="border-border bg-card">
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-muted-foreground">
                  {passage.translation.toUpperCase()}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {compare.reference}
                </p>
                <div className="mt-4 space-y-3 font-serif text-foreground">
                  {passage.verses.slice(0, 3).map((verse) => (
                    <p key={verse.reference} className="leading-relaxed">
                      <span className="mr-2 font-semibold">
                        {verse.chapter}:{verse.verse}
                      </span>
                      <span>{verse.text}</span>
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild>
            <Link
              href={`/compare?reference=${encodeURIComponent(compare.reference)}`}
            >
              Open Translation Compare
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
