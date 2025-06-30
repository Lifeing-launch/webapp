/**
 * This endpoint is designed to clean up orphaned rows in specified Supabase tables
 * by cross-referencing their IDs with existing entries in a Strapi API. It ensures
 * data consistency by removing rows in Supabase that no longer have corresponding
 * entries in Strapi.
 */

import { strapiFetch } from "@/utils/fetch";
import { validateEdgeFunctionAuthentication } from "@/utils/supabase/auth";
import { createAdminClient } from "@/utils/supabase/server";
import { getStrapiBaseUrl } from "@/utils/urls";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

type Entity = {
  table: string;
  field: string;
  strapiPath: string;
};

type CleanerResult = { totalChecked: number; deleted: string[] };

const BATCH_SIZE = 50;
const ENTITIES_TO_CLEAN = [
  { table: "rsvps", field: "meeting_id", strapiPath: "/meetings" },
  { table: "bookmarks", field: "resource_id", strapiPath: "/resources" },
];

export async function POST(request: NextRequest) {
  try {
    await validateEdgeFunctionAuthentication(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const supabase = await createAdminClient();
    const results: Record<string, CleanerResult> = {};

    for (let i = 0; i < ENTITIES_TO_CLEAN.length; i++) {
      const entity = ENTITIES_TO_CLEAN[i];
      const data = await entityCleaner(supabase, entity);
      results[entity.table] = {
        totalChecked: data.totalChecked,
        deleted: data.deleted,
      };
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Error cleaning up strapi orphans:", err);
    return NextResponse.json(
      { error: "Error cleaning up strapi orphans" },
      { status: 500 }
    );
  }
}

async function entityCleaner(supabase: SupabaseClient, entity: Entity) {
  console.log("Cleaning entity:", entity);

  const deleted: string[] = [];
  const { table, field, strapiPath } = entity;

  //  Fetch all distinct non-null IDs from the specified field
  const { data: rows } = await supabase
    .from(table)
    .select(field)
    .throwOnError();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids: string[] = Array.from(new Set(rows.map((r: any) => r[field])));

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);

    // TODO: Type this correctly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const strapiQueryObj: any = {
      filters: {
        id: {
          $in: batch,
        },
      },
    };

    const strapiQuery = qs.stringify(strapiQueryObj, {
      encodeValuesOnly: true,
    });
    const strapiUrl = `${getStrapiBaseUrl()}${strapiPath}?${strapiQuery}`;

    const data = await strapiFetch(strapiUrl);
    const returnedIds = (data?.data || []).map((d: { id: string }) => d.id);
    const missing = batch.filter((id) => !returnedIds.includes(id));

    if (missing.length > 0) {
      // Delete orphaned rows
      await supabase.from(table).delete().in(field, missing).throwOnError();
      deleted.push(...missing);
    }
  }
  return { totalChecked: ids.length, deleted };
}
