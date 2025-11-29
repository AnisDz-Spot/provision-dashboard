"use client";

import { use } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import projectsData from "@/data/projects.json";
import tasksData from "@/data/tasks.json";
import teamData from "@/data/team.json";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Users, DollarSign, Calendar } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = projectsData.find((p) => p.id === id);
  const projectTasks = tasksData.filter((t) => t.projectId === id);
  const teamMembers = teamData.filter((m) => project?.team.includes(m.id));

  if (!project) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "secondary"> = {
      completed: "success",
      "in-progress": "default",
      planning: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.replace("-", " ")}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          {getStatusBadge(project.status)}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date</span>
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date</span>
                      <span>{formatDate(project.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{project.progress}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Budget</span>
                      <span>{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spent</span>
                      <span>{formatCurrency(project.spent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold">
                        {formatCurrency(project.budget - project.spent)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span>{teamMembers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tasks</span>
                      <span>{projectTasks.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "success"
                              : task.status === "in-progress"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-4 rounded-lg border border-border"
                    >
                      <Avatar name={member.name} size="md" />
                      <div className="flex-1">
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                        <Badge
                          variant={
                            member.status === "available"
                              ? "success"
                              : member.status === "busy"
                              ? "warning"
                              : "secondary"
                          }
                          className="mt-1"
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="text-2xl font-bold">
                      {formatCurrency(project.budget)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="text-xl">
                      {formatCurrency(project.spent)}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4">
                    <div
                      className="bg-primary h-4 rounded-full"
                      style={{
                        width: `${(project.spent / project.budget) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(project.budget - project.spent)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kanban" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              Kanban board view - Navigate to the dedicated Kanban page for full
              functionality
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

