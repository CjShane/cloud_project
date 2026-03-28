import {
  BookOpen,
  Bookmark,
  Calendar,
  Search,
} from "lucide-react"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { StudyPlansSection } from "@/components/study-plans-section"
import { ScriptureReader } from "@/components/scripture-reader"
import { DevotionalSection } from "@/components/devotional-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CtaSection } from "@/components/cta-section"
import { fetchDailyVerse } from "@/lib/api/daily-verse"
import { fetchBiblePassage } from "@/lib/api/bible-api"
import {
  fetchComparedPassages,
  type ComparedPassages,
} from "@/lib/api/compare-passages"
import { BOOKS } from "@/lib/bible/books"
import type { NormalizedPassage } from "@/lib/normalize/bible"
import type { DailyVerseResult } from "@/lib/api/daily-verse"

function buildFallbackPassage(
  reference: string,
  translation: string,
): NormalizedPassage {
  return {
    reference,
    translation,
    verses: [
      {
        book: reference.split(" ")[0] ?? "Genesis",
        chapter: 1,
        verse: 1,
        text: "Passage unavailable at the moment.",
        translation,
        reference: `${reference}:1`,
      },
    ],
  }
}

function buildFallbackCompare(reference: string): ComparedPassages {
  return {
    reference,
    primary: buildFallbackPassage(reference, "web"),
    secondary: buildFallbackPassage(reference, "kjv"),
  }
}

const fallbackDailyVerse: DailyVerseResult = {
  passage: buildFallbackPassage("Psalm 23:1", "web"),
  source: "fallback",
}

export const revalidate = 3600

export default async function Home() {
  const [dailyVerse, initialPassage, comparePreview] = await Promise.all([
    fetchDailyVerse("web").catch(() => fallbackDailyVerse),
    fetchBiblePassage("Genesis 1:1-20", "web").catch(() =>
      buildFallbackPassage("Genesis 1:1-20", "web"),
    ),
    fetchComparedPassages("John 3:16", "web", "kjv").catch(() =>
      buildFallbackCompare("John 3:16"),
    ),
  ])

  const features = [
    {
      icon: BookOpen,
      title: "Bible Reader",
      description: "Move chapter by chapter with consistent navigation and clean typography.",
      href: "/bible",
    },
    {
      icon: Search,
      title: "Passage Lookup",
      description: "Jump straight to any reference without losing context.",
      href: "/lookup",
    },
    {
      icon: Calendar,
      title: "Daily Verse",
      description: "Get an hourly-updated verse for a focused reading moment.",
      href: "/daily",
    },
    {
      icon: Bookmark,
      title: "Translation Compare",
      description: "Compare two translations side by side when studying a passage.",
      href: "/compare",
    },
    {
      icon: BookOpen,
      title: "Chapter Navigation",
      description: "Use previous and next controls to keep the flow moving.",
      href: "/bible",
    },
    {
      icon: Search,
      title: "Normalized Data",
      description: "All scripture data is normalized before it reaches the UI.",
      href: "/lookup",
    },
  ]

  const studyPlans = [
    {
      title: "Bible Reader",
      description: "Read by book and chapter with the full reader controls.",
      category: "Reader",
      href: "/bible",
      meta: [
        { label: "Best for", value: "Deep reading" },
      ],
    },
    {
      title: "Passage Lookup",
      description: "Search for any reference and get a clean, normalized response.",
      category: "Lookup",
      href: "/lookup",
      meta: [
        { label: "Best for", value: "Quick checks" },
      ],
    },
    {
      title: "Daily Verse",
      description: "A focused verse refreshed hourly for a short daily session.",
      category: "Daily",
      href: "/daily",
      meta: [
        { label: "Best for", value: "Daily rhythm" },
      ],
    },
    {
      title: "Compare Translations",
      description: "View two translations side by side for study and clarity.",
      category: "Compare",
      href: "/compare",
      meta: [
        { label: "Best for", value: "Study sessions" },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection dailyVerse={dailyVerse} />
      <FeaturesSection features={features} />
      <StudyPlansSection plans={studyPlans} />
      <ScriptureReader
        initialPassage={initialPassage}
      />
      <DevotionalSection dailyVerse={dailyVerse} />
      <TestimonialsSection compare={comparePreview} />
      <CtaSection />
    </div>
  )
}
