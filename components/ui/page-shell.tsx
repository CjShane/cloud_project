import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-12 sm:px-6 lg:px-8">
      {children}
    </section>
  );
}
