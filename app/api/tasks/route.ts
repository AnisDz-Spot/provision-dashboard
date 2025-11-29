import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserDatabasePool } from "@/lib/database/user-connection";

/**
 * GET /api/tasks
 * Fetch all tasks for the authenticated user from their database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ tasks: [] }, { status: 401 });

    const pool = await getUserDatabasePool(user.id);

    if (!pool) {
      return NextResponse.json(
        { tasks: [], message: "Database not configured" },
        { status: 200 }
      );
    }

    try {
      const result = await pool.query(
        "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
        [user.id]
      );
      await pool.end();

      return NextResponse.json({ tasks: result.rows });
    } catch (err: any) {
      await pool.end();
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }
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
 * Create a new task in the user's database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const pool = await getUserDatabasePool(user.id);

    if (!pool) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, projectId } = body;

    if (!title) {
      await pool.end();
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    try {
      const result = await pool.query(
        `INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [user.id, projectId, title, description, status || "todo", priority || "medium", dueDate]
      );
      await pool.end();

      return NextResponse.json(
        { task: result.rows[0], message: "Task created successfully" },
        { status: 201 }
      );
    } catch (err: any) {
      await pool.end();
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Error in POST /api/tasks:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
