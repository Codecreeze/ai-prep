"use client";

import { useRouter } from "next/navigation";
import { useLogoutMutation } from "@/lib/api/authApi";
import { Button } from "@/components/ui/Button";

export const LogoutButton = () => {
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleClick = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Button variant="ghost" onClick={handleClick} disabled={isLoading} className="!px-3 !py-1.5">
      Sign out
    </Button>
  );
};
