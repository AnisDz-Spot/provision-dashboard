import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSupabaseClient } from "@/lib/supabase/user-client";

/**
 * GET /api/projects
 * Fetch all projects for the authenticated user from their Supabase instance
 * Falls back to empty array if Supabase not configured
 */
export async function GET(request: NextRequest) {
  try {
    const userClient = await getUserSupabaseClient();

    if (!userClient) {
      // User hasn't configured their Supabase project yet
      return NextResponse.json({ projects: [], message: "Supabase not configured" }, { status: 200 });
    }

    // Fetch from user's Supabase (adjust table name as needed)
    const { data: projects, error } = await userClient
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Failed to fetch projects" },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects: projects || [] });
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
 * Create a new project in the user's Supabase instance
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
    const { name, description, status, priority, budget, dueDate } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create in user's Supabase
    const { data: project, error } = await userClient
      .from("projects")
      .insert([
        {
          name,
          description,
          status: status || "planning",
          priority: priority || "medium",
          budget: budget || 0,
          spent: 0,
          due_date: dueDate,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { project, message: "Project created successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error in POST /api/projects:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
