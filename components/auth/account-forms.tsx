"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCurrentAccount,
  mergeLocalReaderDataToAccount,
  type AccountUser,
} from "@/lib/storage/reader-sync";

type Mode = "login" | "signup";

type AuthResponse = {
  data?: {
    user: AccountUser;
  };
  error?: {
    message: string;
  };
};

export function AccountForms() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    getCurrentAccount().then(setUser);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json()) as AuthResponse;

    if (!response.ok || !payload.data?.user) {
      setMessage(payload.error?.message ?? "Authentication failed.");
      setPending(false);
      return;
    }

    await mergeLocalReaderDataToAccount();
    setUser(payload.data.user);
    setPassword("");
    setPending(false);
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setUser(null);
    router.refresh();
  }

  if (user) {
    return (
      <div className="rounded-md border border-border bg-card p-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/bible">Continue Reading</a>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "login" ? "default" : "outline"}
          onClick={() => setMode("login")}
        >
          Log in
        </Button>
        <Button
          type="button"
          variant={mode === "signup" ? "default" : "outline"}
          onClick={() => setMode("signup")}
        >
          Sign up
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            required
          />
        </div>
        {message ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Working..." : mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
