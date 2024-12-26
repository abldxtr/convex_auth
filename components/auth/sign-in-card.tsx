import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "react-hook-form";
// import { FaGithub } from "react-icons/fa";
// import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { SignInFlow } from "../types";

interface SignInCardProps {
  setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { signIn } = useAuthActions();

  const handlePasswordSignIn = form.handleSubmit(({ email, password }) => {
    setSigningIn(true);
    //  signIn(provider:"password", param:{ email, password, flow: "signIn" })
    void signIn("password",{ email, password, flow: "signIn" })

      .catch(() => {
        setError("Invalid email or password");
      })
      .finally(() => {
        setSigningIn(false);
      });
  });

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login to continue</CardTitle>
        <CardDescription>
          Use your email or another service to continue
        </CardDescription>
      </CardHeader>
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5" onSubmit={handlePasswordSignIn}>
          <Input
            {...form.register("email", {
              required: true,
            })}
            disabled={signingIn}
            placeholder="Email"
            type="email"
          />
          <Input
            {...form.register("password", {
              required: true,
            })}
            disabled={signingIn}
            placeholder="Password"
            type="password"
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={signingIn}
          >
            Continue
          </Button>
        </form>
        <Separator />

        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <span
            className="text-sky-700 hover:underline cursor-pointer"
            onClick={() => setState("signUp")}
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
};
