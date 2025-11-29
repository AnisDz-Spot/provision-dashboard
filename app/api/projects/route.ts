import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserDatabasePool } from "@/lib/database/user-connection";

/**
 * GET /api/projects
 * Fetch all projects for the authenticated user from their database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ projects: [] }, { status: 401 });

    const pool = await getUserDatabasePool(user.id);

    if (!pool) {
      // Database not configured yet
      return NextResponse.json(
        { projects: [], message: "Database not configured" },
        { status: 200 }
      );
    }

    try {
      const result = await pool.query(
        "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC",
        [user.id]
      );
      await pool.end();

      return NextResponse.json({ projects: result.rows });
    } catch (err: any) {
      await pool.end();
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Error in GET /api/projects:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project in the user's database
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
    const { name, description, status, priority, budget, dueDate } = body;

    if (!name) {
      await pool.end();
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    try {
      const result = await pool.query(
        `INSERT INTO projects (user_id, name, description, status, priority, budget, due_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [user.id, name, description, status || "planning", priority || "medium", budget || 0, dueDate]
      );
      await pool.end();

      return NextResponse.json(
        { project: result.rows[0], message: "Project created successfully" },
        { status: 201 }
      );
    } catch (err: any) {
      await pool.end();
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Error in POST /api/projects:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
