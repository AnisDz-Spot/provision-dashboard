"use client";

import { use } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import teamData from "@/data/team.json";
import tasksData from "@/data/tasks.json";
import projectsData from "@/data/projects.json";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Mail, Calendar, Briefcase } from "lucide-react";
import { LineChartComponent } from "@/components/charts";

export default function TeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const member = teamData.find((m) => m.id === id);
  const memberTasks = tasksData.filter((t) => t.assigneeId === id);
  const memberProjects = projectsData.filter((p) =>
    p.team.includes(id)
  );

  if (!member) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Team member not found</h1>
          <Link href="/team">
            <Button>Back to Team</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

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

  // Activity data for chart
  const activityData = [
    { week: "Week 1", tasks: 8 },
    { week: "Week 2", tasks: 12 },
    { week: "Week 3", tasks: 10 },
    { week: "Week 4", tasks: 15 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/team">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{member.name}</h1>
            <p className="text-muted-foreground">{member.role}</p>
          </div>
          {getStatusBadge(member.status)}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{member.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Joined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium">{formatDate(member.joinedDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Current</span>
                  <p className="font-medium text-2xl">{member.workload}%</p>
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
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {memberProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border"
                  >
                    <span className="font-medium">{project.name}</span>
                    <Badge
                      variant={
                        project.status === "completed"
                          ? "success"
                          : project.status === "in-progress"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartComponent
              data={activityData}
              dataKey="tasks"
              xKey="week"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memberTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(task.dueDate)}
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
      </div>
    </MainLayout>
  );
}


