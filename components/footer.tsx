import Link from "next/link"
import { Book } from "lucide-react"

const footerLinks = {
  explore: [
    { label: "Read the Bible", href: "/bible" },
    { label: "Lookup a Passage", href: "/lookup" },
  ],
  tools: [
    { label: "Daily Verse", href: "/daily" },
    { label: "Compare Translations", href: "/compare" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Book className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Scripture & Study
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A calm place to read, search, and compare Scripture with clarity.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.tools.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              (c) 2026 Scripture & Study. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Home
              </Link>
              <Link
                href="/bible"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Read
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
