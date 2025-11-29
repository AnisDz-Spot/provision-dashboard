"use client";

import { useState } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import teamData from "@/data/team.json";
import { formatDate } from "@/lib/utils";
import { Search, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = teamData.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "secondary"> = {
      available: "success",
      busy: "warning",
      away: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>{status}</Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their workload
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <Link key={member.id} href={`/team/${member.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar name={member.name} size="lg" />
                    <div>
                      <h3 className="text-lg font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {member.email}
                      </p>
                    </div>
                    <div className="w-full space-y-2">
                      {getStatusBadge(member.status)}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Workload</span>
                        <span className="font-medium">{member.workload}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            member.workload > 80
                              ? "bg-destructive"
                              : member.workload > 60
                              ? "bg-warning"
                              : "bg-primary"
                          }`}
                          style={{ width: `${member.workload}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center mt-2">
                        {member.skills.slice(0, 3).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

