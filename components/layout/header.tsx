"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Moon, Sun, User, LogOut } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("User");
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      setUser(authUser);
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", authUser.id)
        .single();
      
      if (profile?.name) {
        setUserName(profile.name);
      } else if (authUser.email) {
        setUserName(authUser.email.split("@")[0]);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="search"
              placeholder="Search projects, tasks..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </Button>

          <Button variant="ghost" size="sm" aria-label="Notifications">
            <Bell size={18} />
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar name={userName} size="sm" />
              <span className="hidden md:inline">{userName}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

