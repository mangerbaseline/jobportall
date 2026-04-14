import { LoginForm } from "@/components/login-form";


export default function Login() {
  return (
    <div className="relative min-h-screen bg-white">
      <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #475569 100%)",
    }}
  />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <LoginForm className="w-full max-w-sm" />
      </div>
    </div>
  );
}