import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSupabaseClient } from "@/lib/supabase/user-client";

/**
 * GET /api/tasks
 * Fetch all tasks for the authenticated user from their Supabase instance
 */
export async function GET(request: NextRequest) {
  try {
    const userClient = await getUserSupabaseClient();

    if (!userClient) {
      return NextResponse.json(
        { tasks: [], message: "Supabase not configured" },
        { status: 200 }
      );
    }

    // Fetch from user's Supabase (adjust table name as needed)
    const { data: tasks, error } = await userClient
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tasks: tasks || [] });
  } catch (err: any) {
    console.error("Error in GET /api/tasks:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task in the user's Supabase instance
 */
export async function POST(request: NextRequest) {
  try {
    const userClient = await getUserSupabaseClient();

    if (!userClient) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, projectId } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Create in user's Supabase
    const { data: task, error } = await userClient
      .from("tasks")
      .insert([
        {
          title,
          description,
          status: status || "todo",
          priority: priority || "medium",
          due_date: dueDate,
          project_id: projectId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { task, message: "Task created successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error in POST /api/tasks:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
