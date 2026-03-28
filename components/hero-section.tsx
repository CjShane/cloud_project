"use client"

import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import type { DailyVerseResult } from "@/lib/api/daily-verse"
import { Button } from "@/components/ui/button"

type HeroSectionProps = {
  dailyVerse: DailyVerseResult
}

export function HeroSection({ dailyVerse }: HeroSectionProps) {
  const verse = dailyVerse.passage.verses[0]
  const verseText = verse?.text ?? "No verse available."
  const verseRef = dailyVerse.passage.reference

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 sm:py-28 lg:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>Your daily companion for spiritual growth</span>
          </div>
          
          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Discover the Word.
            <br />
            <span className="text-primary">Transform Your Life.</span>
          </h1>
          
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl text-pretty">
            Dive deep into scripture with guided study plans, daily devotionals, 
            and powerful tools designed to help you grow in your faith journey.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 text-base">
              <Link href="/bible">
                Start Reading
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
              <Link href="/lookup">Lookup a Passage</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            <p className="text-center font-serif text-sm uppercase tracking-widest text-muted-foreground">
              Verse of the Day
            </p>
            <blockquote className="mt-4 text-center font-serif text-xl italic leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
              &ldquo;{verseText}&rdquo;
            </blockquote>
            <p className="mt-4 text-center text-base font-medium text-primary">
              {verseRef} ({dailyVerse.passage.translation.toUpperCase()})
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
