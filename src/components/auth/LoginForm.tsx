"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/lib/api/authApi";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ErrorText } from "@/components/ui/ErrorText";
import { Spinner } from "@/components/ui/Spinner";

export const LoginForm = () => {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password }).unwrap();
      router.push("/kits");
    } catch (err) {
      const message = (err as { data?: { error?: { message?: string } } })?.data?.error?.message;
      setError(message ?? "Sign in failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted mt-1">Sign in to see your prep kits.</p>
      </div>
      <TextField
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Spinner />}
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-sm text-muted text-center">
        No account? <Link href="/register" className="text-primary font-medium hover:underline">Register</Link>
      </p>
    </form>
  );
};
