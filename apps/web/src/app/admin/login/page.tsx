import { LoginForm } from "@web/app/admin/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-surface-secondary p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
        <div className="text-balance px-6 text-center text-default-500 text-xs">
          Protected admin area - Authorised users only
        </div>
      </div>
    </div>
  );
}
