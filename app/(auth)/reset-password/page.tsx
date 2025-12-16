import { AuthResetPassword } from "@/components/auth-reset-password";
import { Suspense } from "react";

export default function RouteComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthResetPassword />
    </Suspense>
  );
}
