/**
 * Supabase Edge Function: Cleanup Cron
 *
 * This function is designed to clean up orphaned rows in specified Supabase tables
 * by cross-referencing their IDs with existing entries in a Strapi API. It ensures
 * data consistency by removing rows in Supabase that no longer have corresponding
 * entries in Strapi.
 *
 * ## Environment Variables:
 * - `SUPABASE_URL`: The URL of the Supabase instance.
 * - `SUPABASE_SERVICE_ROLE_KEY`: The service role key for Supabase authentication.
 * - `STRAPI_BASE_URL`: The base URL of the Strapi API.
 * - `STRAPI_API_TOKEN`: The API token for authenticating with Strapi.

 * ## HTTP Response:
 * - On success: Returns a JSON object with the cleanup results for each entity.
 * - On failure: Returns a JSON object with an error message and a 500 status code.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Entity = {
  table: string;
  field: string;
  strapiPath: string;
};

type CleanerResult = { totalChecked: number; deleted: string[] };

const ENTITIES_TO_CLEAN = [
  { table: "rsvps", field: "meeting_id", strapiPath: "/meetings" },
  { table: "bookmarks", field: "resource_id", strapiPath: "/resources" },
];

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results: Record<string, CleanerResult> = {};

    for (let i = 0; i < ENTITIES_TO_CLEAN.length; i++) {
      const entity = ENTITIES_TO_CLEAN[i];
      const data = await entityCleaner(supabase, entity);
      results[entity.table] = {
        totalChecked: data.totalChecked,
        deleted: data.deleted,
      };
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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

async function entityCleaner(supabase: any, entity: Entity) {
  const { table, field, strapiPath } = entity;

  //  Fetch all distinct non-null IDs from the specified field
  const { data: rows, error: selectError } = await supabase
    .from(table)
    .select(field)
    .throwOnError();

  if (selectError) throw selectError;

  const ids: string[] = Array.from(new Set(rows.map((r: any) => r[field])));

  // Chunk into batches of 50
  const chunkSize = 50;
  const deleted: string[] = [];

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);

    //  Query Strapi API for existing entries
    const url = new URL(`${Deno.env.get("STRAPI_BASE_URL")}/api${strapiPath}`);
    // Append filter parameter: filters[id][$in]=id1,id2,...
    url.searchParams.set("filters[id][$in]", chunk.join(","));

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("STRAPI_API_TOKEN")}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Strapi responded with ${res.status}`);
    }

    const json = await res.json();
    const returnedIds = (json.data || []).map((d: any) => d.id);

    // Determine missing IDs
    const missing = chunk.filter((id) => !returnedIds.includes(id));
    if (missing.length > 0) {
      // Delete orphaned rows
      await supabase.from(table).delete().in(field, missing).throwOnError();
      deleted.push(...missing);
    }
  }
  return { totalChecked: ids.length, deleted };
}
