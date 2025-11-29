"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import tasksData from "@/data/tasks.json";
import projectsData from "@/data/projects.json";
import teamData from "@/data/team.json";
import { formatDate } from "@/lib/utils";
import { Search, Plus, Filter } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

type StatusFilter = "all" | "to-do" | "in-progress" | "in-review" | "completed";
type PriorityFilter = "all" | "high" | "medium" | "low";

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    return tasksData.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === "all" || task.assigneeId === assigneeFilter;
      const matchesProject =
        projectFilter === "all" || task.projectId === projectFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAssignee &&
        matchesProject
      );
    });
  }, [
    searchQuery,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    projectFilter,
  ]);

  const getTaskProject = (projectId: string) => {
    return projectsData.find((p) => p.id === projectId);
  };

  const getTaskAssignee = (assigneeId: string) => {
    return teamData.find((m) => m.id === assigneeId);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track all tasks across projects
            </p>
          </div>
          <Button className="gap-2">
            <Plus size={18} />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">All Status</option>
                <option value="to-do">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="completed">Completed</option>
              </Select>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
              <Select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="all">All Assignees</option>
                {teamData.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </Select>
              <Select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projectsData.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const project = getTaskProject(task.projectId);
                const assignee = getTaskAssignee(task.assigneeId);
                const overdue = isOverdue(task.dueDate) && task.status !== "completed";

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{task.title}</h4>
                          {overdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Project: {project?.name}</span>
                          <span>Due: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {assignee && (
                          <div className="flex items-center gap-2">
                            <Avatar name={assignee.name} size="sm" />
                            <span className="text-sm">{assignee.name}</span>
                          </div>
                        )}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

