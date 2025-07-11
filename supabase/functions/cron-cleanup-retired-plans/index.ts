import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const NEXT_PUBLIC_SITE_URL = Deno.env.get("NEXT_PUBLIC_SITE_URL");
const EDGE_FUNCTION_API_KEY = Deno.env.get("EDGE_FUNCTION_API_KEY");
const CLEANUP_ENDPOINT = "/api/utility/cleanup/retired-plans";

Deno.serve(async (req) => {
  try {
    const url = `${NEXT_PUBLIC_SITE_URL}${CLEANUP_ENDPOINT}`;
    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Authorization: EDGE_FUNCTION_API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error(`Strapi responded with: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log(err);
    return new Response(JSON.stringify({ message: err.message ?? err }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
