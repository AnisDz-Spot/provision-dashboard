"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  DoughnutChartComponent,
  AreaChartComponent,
} from "@/components/charts";
import projectsData from "@/data/projects.json";
import tasksData from "@/data/tasks.json";
import teamData from "@/data/team.json";
import { formatCurrency } from "@/lib/utils";
import { FolderKanban, CheckSquare, Users, TrendingUp, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  // Calculate metrics
  const totalProjects = projectsData.length;
  const overdueTasks = tasksData.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "completed"
  ).length;
  const totalTeamMembers = teamData.length;
  const averageWorkload = Math.round(
    teamData.reduce((sum, member) => sum + member.workload, 0) / totalTeamMembers
  );

  // Weekly task progress data
  const weeklyData = [
    { week: "Week 1", completed: 12, total: 20 },
    { week: "Week 2", completed: 18, total: 25 },
    { week: "Week 3", completed: 15, total: 22 },
    { week: "Week 4", completed: 22, total: 28 },
  ];

  // Project status distribution
  const statusData = [
    { name: "Completed", value: projectsData.filter((p) => p.status === "completed").length },
    { name: "In Progress", value: projectsData.filter((p) => p.status === "in-progress").length },
    { name: "Planning", value: projectsData.filter((p) => p.status === "planning").length },
  ];

  // Priority distribution
  const priorityData = [
    { name: "High", value: projectsData.filter((p) => p.priority === "high").length },
    { name: "Medium", value: projectsData.filter((p) => p.priority === "medium").length },
    { name: "Low", value: projectsData.filter((p) => p.priority === "low").length },
  ];

  // Budget utilization
  const budgetData = projectsData.map((project) => ({
    name: project.name,
    budget: project.budget,
    spent: project.spent,
  }));

  // My tasks (first 5 tasks)
  const myTasks = tasksData.slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your projects and team performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {projectsData.filter((p) => p.status === "in-progress").length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageWorkload}%</div>
              <p className="text-xs text-muted-foreground">
                Average workload across team
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeamMembers}</div>
              <p className="text-xs text-muted-foreground">
                {teamData.filter((m) => m.status === "available").length} available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Task Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartComponent
                data={weeklyData}
                dataKey="completed"
                xKey="week"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChartComponent data={statusData} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DoughnutChartComponent data={priorityData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget vs Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={budgetData.slice(0, 5)}
                dataKey="spent"
                xKey="name"
              />
            </CardContent>
          </Card>
        </div>

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
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

