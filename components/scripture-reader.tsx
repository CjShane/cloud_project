"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy } from "lucide-react"
import type { NormalizedPassage } from "@/lib/normalize/bible"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ScriptureReaderProps = {
  initialPassage: NormalizedPassage
}

export function ScriptureReader({
  initialPassage,
}: ScriptureReaderProps) {
  const passage = initialPassage
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const continueHref = "/bible?book=GEN&chapter=1&translation=web"
  const compareHref = "/compare?reference=Genesis%201&primary=web&secondary=kjv"

  const verseText = passage.verses.find((verse) => verse.verse === selectedVerse)?.text

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Beautiful Reading Experience
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Clean, distraction-free scripture reading, check out the full reader{" "}
            <Link href="/bible" className="text-primary underline underline-offset-4">
              here
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <Card className="overflow-hidden border-border">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="space-y-4 font-serif text-lg leading-relaxed text-foreground">
                {(() => {
                  const groups: typeof passage.verses[] = []
                  passage.verses.forEach((verse, index) => {
                    const groupIndex = Math.floor(index / 5)
                    if (!groups[groupIndex]) {
                      groups[groupIndex] = []
                    }
                    groups[groupIndex].push(verse)
                  })

                  return groups.map((group, groupIndex) => (
                    <p key={`group-${groupIndex}`}>
                      {group.map((verse, index) => (
                        <span
                          key={verse.reference}
                          className={`cursor-pointer rounded-md px-1.5 py-0.5 transition-colors ${
                            selectedVerse === verse.verse
                              ? "bg-primary/10"
                              : "hover:bg-secondary/50"
                          }`}
                          onClick={() =>
                            setSelectedVerse(
                              selectedVerse === verse.verse ? null : verse.verse,
                            )
                          }
                        >
                          <sup className="mr-1 text-sm font-medium text-primary">
                            {verse.verse}
                          </sup>
                          <span>{verse.text}</span>
                          {index < group.length - 1 ? " " : ""}
                        </span>
                      ))}
                    </p>
                  ))
                })()}
              </div>

              {selectedVerse && verseText ? (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6">
                  <Button asChild variant="outline" size="sm">
                    <Link href={continueHref}>Continue Reading</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={compareHref}>Compare Translations</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          `${verseText} (${passage.reference}:${selectedVerse})`,
                        )
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      } catch {
                        setCopied(false)
                      }
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

