"use client";

import { Button } from "@motormetrics/ui/components/button";
import { Input } from "@motormetrics/ui/components/input";
import { Label } from "@motormetrics/ui/components/label";
import { authClient } from "@web/app/admin/lib/auth-client";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";

interface LoginFormClientProps {
  googleButtonContent: ReactNode;
  dividerText: string;
  emailLabel: string;
  passwordLabel: string;
  loginButtonText: string;
  loadingButtonText: string;
}

export function LoginFormClient({
  googleButtonContent,
  dividerText,
  emailLabel,
  passwordLabel,
  loginButtonText,
  loadingButtonText,
}: LoginFormClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          toast.success("Signed in successfully");
          router.push("/admin");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to sign in");
          setIsLoading(false);
        },
      },
    );
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/admin",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {googleButtonContent}
        </Button>
      </div>

      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
        <span className="relative z-10 bg-card px-2 text-muted-foreground">
          {dividerText}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{emailLabel}</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{passwordLabel}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? loadingButtonText : loginButtonText}
        </Button>
      </div>
    </form>
  );
}
