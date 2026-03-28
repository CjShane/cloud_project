"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/bible", label: "Read" },
  { href: "/lookup", label: "Lookup" },
  { href: "/daily", label: "Daily Verse" },
  { href: "/compare", label: "Compare" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-6 py-4 sm:px-10">
        <span className="mr-2 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
          Cloud Project
        </span>
        <nav className="flex flex-wrap gap-2" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "rounded-md border border-zinc-400 bg-zinc-100/60 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-100"
                    : "rounded-md border border-zinc-300 bg-zinc-100/60 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-200"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
