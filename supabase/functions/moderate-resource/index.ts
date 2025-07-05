import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: {
    persistSession: false
  }
});
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
function validateInput(data) {
  if (!data || typeof data !== "object") throw new Error("Invalid request body");
  const { resource_id, resource_type } = data;
  if (!resource_id || typeof resource_id !== "string") throw new Error("resource_id is required and must be a string");
  if (![
    "post",
    "comment"
  ].includes(resource_type)) throw new Error("resource_type must be 'post' or 'comment'");
  return {
    resource_id,
    resource_type
  };
}
async function getContent(resource_id, resource_type) {
  if (resource_type === "post") {
    const { data, error } = await supabase.from("forum.posts").select("content, status").eq("id", resource_id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      content: data.content,
      status: data.status
    };
  }
  if (resource_type === "comment") {
    const { data, error } = await supabase.from("forum.comments").select("content, status").eq("id", resource_id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      content: data.content,
      status: data.status
    };
  }
  return null;
}
async function moderate(content) {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) return "rejected";
  const systemPrompt = `
    You are a strict content moderator for a family-friendly community forum.

    Reject any text that contains (but is not limited to):
    • Profanity, vulgar or obscene language
    • Racial, ethnic, religious or gender slurs
    • Hate speech, harassment or threats
    • Extremist propaganda
    • Sexual content, innuendo or double entendre
    • Graphic violence or detailed self‑harm descriptions
    • Spam or promotional content
    • Personal information (emails, phone numbers, addresses)

    If the content violates any rule, respond with the single word: \`rejected\`.
    If the content does NOT violate any rule, respond with the single word: \`approved\`.
    Respond with **only** one of these two lower‑case words — no additional text.
  `;
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini",
      temperature: 0,
      max_tokens: 1,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content
        }
      ]
    })
  });
  if (!resp.ok) return "rejected";
  const json = await resp.json();
  const verdict = json.choices?.[0]?.message?.content?.trim()?.toLowerCase();
  return verdict === "approved" ? "approved" : "rejected";
}
async function updateStatus(resource_id, resource_type, status) {
  let update;
  if (resource_type === "post") {
    update = await supabase.from("forum.posts").update({
      status
    }).eq("id", resource_id);
  } else {
    update = await supabase.from("forum.comments").update({
      status
    }).eq("id", resource_id);
  }
  return !update.error;
}
serve(async (req)=>{
  if (req.method === "OPTIONS") return new Response(null, {
    headers: corsHeaders
  });
  if (req.method !== "POST") return new Response(JSON.stringify({
    error: "Method not allowed"
  }), {
    status: 405,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
  try {
    const requestBody = await req.json();
    const { resource_id, resource_type } = validateInput(requestBody);
    const row = await getContent(resource_id, resource_type);
    if (!row) {
      return new Response(JSON.stringify({
        error: "Resource not found"
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    if (row.status !== "pending") {
      return new Response(JSON.stringify({
        success: true,
        resource_id,
        resource_type,
        status: row.status,
        message: "Already moderated"
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const status = await moderate(row.content);
    const updated = await updateStatus(resource_id, resource_type, status);
    return new Response(JSON.stringify({
      success: updated,
      resource_id,
      resource_type,
      status
    }), {
      status: updated ? 200 : 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Internal server error"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
