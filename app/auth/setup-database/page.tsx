"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Database,
} from "lucide-react";

export default function SetupDatabasePage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "connection" | "schema" | "success">(
    "info"
  );
  const [connectionString, setConnectionString] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (step === "info") {
      setStep("connection");
      return;
    }

    if (step === "connection") {
      setLoading(true);
      setError(null);

      try {
        if (!connectionString) {
          throw new Error("Please enter your connection string");
        }

        const response = await fetch("/api/user/database-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionString }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to connect");
        }

        setStep("schema");
      } catch (err: any) {
        setError(err.message || "Connection failed");
      } finally {
        setLoading(false);
      }
    }

    if (step === "schema") {
      setStep("success");
    }
  };

  const schemaSQL = `
-- Run this SQL in your database console

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10, 2),
  status TEXT DEFAULT 'planning',
  priority TEXT DEFAULT 'medium',
  spent DECIMAL(10, 2) DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'Developer',
  workload INT DEFAULT 0,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_team_user ON team_members(user_id);
`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {/* Step 1: Info */}
        {step === "info" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connect Your Database
              </CardTitle>
              <CardDescription>
                Choose any PostgreSQL provider and connect it in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">
                  Recommended Providers (Free to Start):
                </h3>

                <div className="grid gap-3">
                  {[
                    {
                      name: "Neon",
                      url: "https://neon.tech",
                      desc: "Serverless PostgreSQL, easiest setup",
                    },
                    {
                      name: "Railway",
                      url: "https://railway.app",
                      desc: "Simple, fast PostgreSQL hosting",
                    },
                    {
                      name: "Render",
                      url: "https://render.com",
                      desc: "Free tier with PostgreSQL support",
                    },
                    {
                      name: "AWS RDS",
                      url: "https://aws.amazon.com/rds",
                      desc: "Enterprise-grade, pay as you go",
                    },
                  ].map((provider) => (
                    <a
                      key={provider.name}
                      href={provider.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-border rounded-lg hover:bg-accent transition-colors flex items-start justify-between"
                    >
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {provider.desc}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Pro Tip:</strong> You control and pay for your
                  database directly. We simply store your connection string.
                </p>
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg">
                I Have My Connection String →
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 2: Connection String */}
        {step === "connection" && (
          <>
            <CardHeader>
              <CardTitle>Enter Connection String</CardTitle>
              <CardDescription>
                Find this in your database provider's dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs font-mono text-slate-600">
                  postgresql://user:password@host:5432/database
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Connection String</label>
                <Input
                  type="password"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  placeholder="postgresql://user:password@host:5432/database"
                  className="mt-2 font-mono text-xs"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-900">
                  <strong>Security:</strong> Your connection string is encrypted
                  and stored securely. We never share it.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("info")}
                  disabled={loading}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={loading || !connectionString}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection →"
                  )}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: Schema */}
        {step === "schema" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Connection Successful!
              </CardTitle>
              <CardDescription>
                Now create the required tables in your database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  ✓ Connection verified. Copy the SQL below and run it in your
                  database console.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Database Schema</label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(schemaSQL);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Copy SQL
                  </button>
                </div>
                <textarea
                  value={schemaSQL}
                  readOnly
                  className="w-full h-48 p-3 border border-border rounded-lg font-mono text-xs bg-slate-50"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>Next:</strong> Go to your database console (Neon/Railway),
                  click the SQL editor, paste the schema above, and run it.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("connection")}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  I've Created the Tables →
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                All Set!
              </CardTitle>
              <CardDescription>Your database is ready to use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900">
                  ✓ Your database is connected and ready to use!
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">What's Next:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    <span>Set up two-factor authentication (optional)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    <span>Access your dashboard</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    <span>
                      Anytime you need more storage, upgrade your database on
                      your provider
                    </span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => router.push("/auth/setup-2fa")}
                className="w-full"
                size="lg"
              >
                Continue to 2FA Setup
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Skip to Dashboard
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
