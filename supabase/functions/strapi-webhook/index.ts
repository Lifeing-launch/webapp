/**
 * Supabase Edge Function to handle Strapi webhook events.
 *
 * This function listens for incoming HTTP requests from a Strapi webhook and processes
 * specific events related to the deletion of entries in Strapi models. Depending on the
 * model and event type, it performs corresponding actions in the Supabase database.
 *
 * - Deletes RSVPs associated with a deleted "meeting".
 * - Deletes bookmarks associated with a deleted "resource".
 * - Logs an error if a "subscription-plan" is deleted (this is not expected behavior).
 *
 * @remarks
 * This function uses the Supabase client to interact with the database and expects
 * the `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables to be set.
 *
 * @param req - The incoming HTTP request object.
 * @returns A JSON response indicating success or failure.
 *
 * @throws Will return a 500 status response if an error occurs during processing.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
        },
      }
    );
    const body = await req.json();
    const { model, event, entry } = body;
    if (event === "entry.delete") {
      console.log(`Handling delete event for model:${model} id:${entry.id}`);
      if (model === "meeting") {
        await supabase
          .from("rsvps")
          .delete()
          .eq("meeting_id", entry.id)
          .throwOnError();
      } else if (model === "resource") {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("resource_id", entry.id)
          .throwOnError();
      } else if (model === "subscription-plan") {
        console.error(
          `Subscription plan: ${entry.id} was deleted. This should not happen.`
        );
      }
    }
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        message: err?.message ?? err,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
