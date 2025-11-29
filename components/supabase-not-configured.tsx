"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SupabaseNotConfiguredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <span className="font-bold text-xl">Supabase Not Configured</span>
          </div>
          <CardTitle className="text-2xl">Setup Required</CardTitle>
          <CardDescription>
            The app needs Supabase credentials to function
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-sm">To get started:</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>
                Create a project at{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  supabase.com
                </a>
              </li>
              <li>
                Go to{" "}
                <strong>Settings → API</strong>
              </li>
              <li>Copy your <strong>Project URL</strong> and <strong>anon/public key</strong></li>
              <li>
                {process.env.NODE_ENV === "production" ? (
                  <>
                    Add these to your{" "}
                    <strong>Vercel environment variables</strong>:
                    <div className="mt-2 bg-background rounded p-2 text-xs font-mono">
                      <div>NEXT_PUBLIC_SUPABASE_URL=your-url</div>
                      <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key</div>
                    </div>
                  </>
                ) : (
                  <>
                    Update <strong>.env.local</strong> with your credentials
                  </>
                )}
              </li>
              {process.env.NODE_ENV !== "production" && (
                <li>Restart the development server</li>
              )}
            </ol>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm">
            <p className="text-muted-foreground">
              More info: See <strong>SETUP_GUIDE.md</strong> for detailed instructions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
