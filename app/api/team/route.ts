import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserDatabasePool } from "@/lib/database/user-connection";

/**
 * GET /api/team
 * Fetch all team members for the authenticated user from their database
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ team: [] }, { status: 401 });

    const pool = await getUserDatabasePool(user.id);

    if (!pool) {
      return NextResponse.json(
        { team: [], message: "Database not configured" },
        { status: 200 }
      );
    }

    try {
      const result = await pool.query(
        "SELECT * FROM team_members WHERE user_id = $1 ORDER BY created_at DESC",
        [user.id]
      );
      await pool.end();

      return NextResponse.json({ team: result.rows });
    } catch (err: any) {
      await pool.end();
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Failed to fetch team" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Error in GET /api/team:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/team
 * Add a new team member to the user's database
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
    const { name, role, email, workload, status } = body;

    if (!name || !email) {
      await pool.end();
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    try {
      const result = await pool.query(
        `INSERT INTO team_members (user_id, name, role, email, workload, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [user.id, name, role || "Developer", email, workload || 0, status || "available"]
      );
      await pool.end();

      return NextResponse.json(
        { member: result.rows[0], message: "Team member added successfully" },
        { status: 201 }
      );
    } catch (err: any) {
      await pool.end();
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Failed to add team member" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Error in POST /api/team:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
