"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import tasksData from "@/data/tasks.json";
import teamData from "@/data/team.json";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

type TaskStatus = "to-do" | "in-progress" | "in-review" | "completed";

const columns: { id: TaskStatus; title: string }[] = [
  { id: "to-do", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "completed", title: "Completed" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState(tasksData);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const getAssignee = (assigneeId: string) => {
    return teamData.find((m) => m.id === assigneeId);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <p className="text-muted-foreground">
            Drag and drop tasks to update their status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);

            return (
              <div
                key={column.id}
                className="flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{column.title}</span>
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[400px]">
                    {columnTasks.map((task) => {
                      const assignee = getAssignee(task.assigneeId);
                      const overdue =
                        isOverdue(task.dueDate) && task.status !== "completed";

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow cursor-move"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{task.title}</h4>
                            {overdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {assignee && (
                                <Avatar name={assignee.name} size="sm" />
                              )}
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
                                className="text-xs"
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Due: {formatDate(task.dueDate)}
                          </div>
                        </div>
                      );
                    })}
                    {columnTasks.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        No tasks
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}


