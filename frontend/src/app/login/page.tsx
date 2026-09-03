import { Suspense } from "react";

import {
  AuthLayout,
  LoginForm,
} from "@/features/auth";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to access your ShadowAudit workspace."
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}