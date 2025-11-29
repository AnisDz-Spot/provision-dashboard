import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSupabaseClient } from "@/lib/supabase/user-client";

/**
 * GET /api/team
 * Fetch all team members for the authenticated user from their Supabase instance
 */
export async function GET(request: NextRequest) {
  try {
    const userClient = await getUserSupabaseClient();

    if (!userClient) {
      return NextResponse.json(
        { team: [], message: "Supabase not configured" },
        { status: 200 }
      );
    }

    // Fetch from user's Supabase (adjust table name as needed)
    const { data: team, error } = await userClient
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching team:", error);
      return NextResponse.json(
        { error: "Failed to fetch team" },
        { status: 500 }
      );
    }

    return NextResponse.json({ team: team || [] });
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
 * Add a new team member to the user's Supabase instance
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
    const { name, role, email, workload, status } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Create in user's Supabase
    const { data: member, error } = await userClient
      .from("team_members")
      .insert([
        {
          name,
          role: role || "Developer",
          email,
          workload: workload || 0,
          status: status || "available",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating team member:", error);
      return NextResponse.json(
        { error: "Failed to add team member" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { member, message: "Team member added successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error in POST /api/team:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
