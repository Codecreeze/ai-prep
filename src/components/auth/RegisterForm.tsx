"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegisterMutation } from "@/lib/api/authApi";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ErrorText } from "@/components/ui/ErrorText";
import { Spinner } from "@/components/ui/Spinner";

export const RegisterForm = () => {
  const router = useRouter();
  const [register, { isLoading }] = useRegisterMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ email, password }).unwrap();
      router.push("/dashboard/analyze");
    } catch (err) {
      const message = (err as { data?: { error?: { message?: string } } })?.data?.error?.message;
      setError(message ?? "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Create an account</h1>
        <p className="text-sm text-muted mt-1">Start generating interview prep kits.</p>
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
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="text-xs text-muted -mt-3">Minimum 8 characters.</p>
      {error && <ErrorText>{error}</ErrorText>}
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Spinner />}
        {isLoading ? "Creating account..." : "Register"}
      </Button>
      <p className="text-sm text-muted text-center">
        Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </form>
  );
};
