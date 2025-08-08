import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const NEXT_PUBLIC_SITE_URL = Deno.env.get("NEXT_PUBLIC_SITE_URL");
const EDGE_FUNCTION_API_KEY = Deno.env.get("EDGE_FUNCTION_API_KEY");
const CLEANUP_ENDPOINT = "/api/utility/cleanup/strapi-orphans";

Deno.serve(async (req) => {
  try {
    const url = `${NEXT_PUBLIC_SITE_URL}${CLEANUP_ENDPOINT}`;
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: EDGE_FUNCTION_API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error(`Strapi responded with: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();
    console.log(response);
    return new Response(JSON.stringify(response), {
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
