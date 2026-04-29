"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCurrentAccount,
  listenForAccountChanges,
  notifyAccountChanged,
  type AccountUser,
} from "@/lib/storage/reader-sync";

export function AccountStatus() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    function refreshAccount() {
      getCurrentAccount()
        .then((account) => {
          if (active) {
            setUser(account);
          }
        })
        .finally(() => {
          if (active) {
            setLoaded(true);
          }
        });
    }

    refreshAccount();
    const removeListener = listenForAccountChanges(refreshAccount);

    return () => {
      active = false;
      removeListener();
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setUser(null);
    notifyAccountChanged();
    window.location.href = "/account";
  }

  if (!loaded) {
    return <span className="hidden h-9 w-20 rounded-md bg-secondary md:inline-flex" />;
  }

  if (!user) {
    return (
      <Button asChild variant="outline" className="hidden md:inline-flex h-10 px-4">
        <Link href="/account">
          <UserRound className="h-4 w-4" />
          Account
        </Link>
      </Button>
    );
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Link
        href="/account"
        className="max-w-40 truncate text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {user.email}
      </Link>
      <Button size="icon" variant="ghost" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  );
}
