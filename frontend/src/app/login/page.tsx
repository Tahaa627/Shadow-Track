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
      <LoginForm />
    </AuthLayout>
  );
}