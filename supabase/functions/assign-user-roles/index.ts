import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface AssignRoleRequest {
  emails: string[];
  role_name: string;
}

interface AssignRoleResponse {
  success: boolean;
  message: string;
  results: {
    email: string;
    success: boolean;
    message: string;
    user_id?: string;
  }[];
}

Deno.serve(async (req) => {
  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse request body
    const body: AssignRoleRequest = await req.json();

    if (
      !body.emails ||
      !Array.isArray(body.emails) ||
      body.emails.length === 0
    ) {
      return new Response(
        JSON.stringify({
          error: "emails array is required and must not be empty",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!body.role_name || typeof body.role_name !== "string") {
      return new Response(JSON.stringify({ error: "role_name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // First, get the role ID for the specified role name
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", body.role_name)
      .single();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: `Role '${body.role_name}' not found` }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const roleId = roleData.id;
    const results: AssignRoleResponse["results"] = [];

    // Process each email
    for (const email of body.emails) {
      try {
        // Find user by email
        const { data: userData, error: userError } = await supabase
          .from("user_profiles")
          .select("id, email")
          .eq("email", email)
          .single();

        if (userError || !userData) {
          results.push({
            email,
            success: false,
            message: `User with email '${email}' not found`,
          });
          continue;
        }

        // Update user's role
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ role_id: roleId })
          .eq("id", userData.id);

        if (updateError) {
          results.push({
            email,
            success: false,
            message: `Failed to update role: ${updateError.message}`,
          });
        } else {
          results.push({
            email,
            success: true,
            message: `Successfully assigned role '${body.role_name}' to user`,
            user_id: userData.id,
          });
        }
      } catch (error) {
        results.push({
          email,
          success: false,
          message: `Error processing email '${email}': ${error.message}`,
        });
      }
    }

    // Calculate overall success
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;
    const allSuccessful = successCount === totalCount;

    const response: AssignRoleResponse = {
      success: allSuccessful,
      message: allSuccessful
        ? `Successfully assigned role '${body.role_name}' to all ${totalCount} users`
        : `Assigned role '${body.role_name}' to ${successCount} out of ${totalCount} users`,
      results,
    };

    console.log(response);
    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: allSuccessful ? 200 : 207, // 207 Multi-Status for partial success
    });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ message: err?.message ?? err }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
