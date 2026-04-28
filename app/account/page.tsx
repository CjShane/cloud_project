import { AccountForms } from "@/components/auth/account-forms";
import { PageShell } from "@/components/ui/page-shell";

export default function AccountPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
          <p className="text-muted-foreground">
            Keep your notes and reading progress available across devices.
          </p>
        </header>
        <AccountForms />
      </section>
    </PageShell>
  );
}
