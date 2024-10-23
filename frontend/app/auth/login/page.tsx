"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/app/stores/user-store";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user, loading } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        window.location.href = "/";
        return { success: true };
      } else {
        const error = await response.json();
        console.error(error);
        toast({
          title: "Uh oh! Something went wrong.",
          description: error.errors[0],
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Failed to authenticate:", error);
      return { success: false, error: "Failed to authenticate" };
    }
  };

  if (user) {
    router.push("/");
  }

  if (loading || user) return null;

  return (
    <div className="h-[75%] flex items-center justify-center w-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthForm type="login" onSubmit={handleSubmit} />

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            className="w-full flex flex-row items-center gap-2"
            variant="surface"
            style={{ cursor: "pointer" }}
          >
            <Image src="/google.png" alt="Google" width={20} height={20} />
            Continue with Google
          </Button> */}

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
