"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import projectsData from "@/data/projects.json";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Grid, List, Plus } from "lucide-react";

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "planning" | "in-progress" | "completed";
type PriorityFilter = "all" | "high" | "medium" | "low";

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [clientFilter, setClientFilter] = useState("all");

  const clients = useMemo(
    () => Array.from(new Set(projectsData.map((p) => p.client))),
    []
  );

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || project.priority === priorityFilter;
      const matchesClient =
        clientFilter === "all" || project.client === clientFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesClient;
    });
  }, [searchQuery, statusFilter, priorityFilter, clientFilter]);

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

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "destructive" | "warning" | "secondary"> = {
      high: "destructive",
      medium: "warning",
      low: "secondary",
    };
    return (
      <Badge variant={variants[priority] || "secondary"}>{priority}</Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track all your projects
            </p>
          </div>
          <Button className="gap-2">
            <Plus size={18} />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search projects..."
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
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
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
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              >
                <option value="all">All Clients</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid size={18} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List size={18} />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {getPriorityBadge(project.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Client</span>
                        <span className="font-medium">{project.client}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">
                          {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors">
                      <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.client}
                          </p>
                        </div>
                        <div>{getStatusBadge(project.status)}</div>
                        <div>{getPriorityBadge(project.priority)}</div>
                        <div className="text-sm">
                          <div className="font-medium">{project.progress}%</div>
                          <div className="text-muted-foreground">
                            {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(project.endDate)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}


