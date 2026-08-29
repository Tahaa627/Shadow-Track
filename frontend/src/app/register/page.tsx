import {
  AuthLayout,
  RegisterForm,
} from "@/features/auth";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Set up your organization and start building a clearer view of your technology environment."
    >
      <RegisterForm />
    </AuthLayout>
  );
}