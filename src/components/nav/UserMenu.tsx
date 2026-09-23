"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/lib/api/authApi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tooltip } from "@/components/ui/Tooltip";

export const UserMenu = ({ email }: { email: string }) => {
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <Tooltip label={email} align="end">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Account menu"
          aria-expanded={open}
          className="size-8 rounded-full bg-primary text-white grid place-items-center text-sm font-semibold hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {initial}
        </button>
      </Tooltip>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-40 py-1">
            <p className="px-3 py-2 text-sm text-muted truncate border-b border-border">{email}</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmingLogout(true);
              }}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background"
            >
              Sign out
            </button>
          </div>
        </>
      )}
      {confirmingLogout && (
        <ConfirmDialog
          title="Sign out"
          message="Are you sure you want to sign out? You'll need to sign in again to see your kits."
          confirmLabel="Sign out"
          onConfirm={handleLogout}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}
    </div>
  );
};
