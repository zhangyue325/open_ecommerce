import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleLoginButton from "./google-login-button";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawNext = resolvedSearchParams.next;
  const nextValue = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  const nextPath = getSafeNextPath(nextValue);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Yellow Pixel</CardTitle>
          <CardDescription>
            Continue with Google to access your creative workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleLoginButton nextPath={nextPath} />
          <Link
            href="https://www.yellowpixel.io"
            className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Back to landing page
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

function getSafeNextPath(nextPath: string | undefined) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/template";
  }

  return nextPath;
}
