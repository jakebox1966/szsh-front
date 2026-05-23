import { Suspense } from "react";
import { LoginPageClient } from "./LoginPageClient";

export const metadata = {
  title: "로그인 | szsh.kr",
  description: "소셜 계정으로 szsh.kr에 로그인하세요.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageClient />
    </Suspense>
  );
}
