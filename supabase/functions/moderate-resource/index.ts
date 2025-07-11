/**
 * @fileoverview Moderate a resource (post, comment, or nickname) using OpenAI.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL");

async function moderate(content) {
  if (!OPENAI_API_KEY) return "rejected";
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
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      max_tokens: 1,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content,
        },
      ],
    }),
  });
  if (!resp.ok) return "rejected";
  const json = await resp.json();
  const verdict = json.choices?.[0]?.message?.content?.trim()?.toLowerCase();
  return verdict === "approved" ? "approved" : "rejected";
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "", {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization"),
        },
      },
    });

    const { resource_id, resource_type, content, user_id } = await req.json();

    if (!resource_type) {
      return new Response(JSON.stringify({ error: "Missing resource_type" }), {
        status: 400,
      });
    }

    let resourceContent;
    let authorAnonId;

    if (resource_type === "nickname") {
      // Para nickname, o conteúdo vem diretamente no request
      if (!content) {
        return new Response(
          JSON.stringify({ error: "Missing content for nickname moderation" }),
          {
            status: 400,
          }
        );
      }
      if (!user_id) {
        return new Response(
          JSON.stringify({
            error: "Missing user_id for nickname moderation",
          }),
          {
            status: 400,
          }
        );
      }
      resourceContent = content;
      authorAnonId = null; // Para nicknames, ainda não temos anon_profile_id
    } else {
      // Para posts e comments, busca na tabela
      if (!resource_id) {
        return new Response(JSON.stringify({ error: "Missing resource_id" }), {
          status: 400,
        });
      }

      const table = resource_type === "comment" ? "comments" : "posts";

      const { data: resource } = await supabase
        .schema("forum")
        .from(table)
        .select("*")
        .eq("id", resource_id)
        .single();

      if (!resource) {
        return new Response(JSON.stringify({ error: "Resource not found" }), {
          status: 404,
        });
      }

      resourceContent = resource.content;
      authorAnonId = resource.author_anon_id;
    }

    const status = await moderate(resourceContent);

    // Atualiza o status apenas para posts e comments
    if (resource_type !== "nickname") {
      const table = resource_type === "comment" ? "comments" : "posts";

      await supabase
        .schema("forum")
        .from(table)
        .update({ status })
        .eq("id", resource_id)
        .throwOnError();
    }

    // Log de moderação - tratamento diferente para nicknames
    const moderationLogData = {
      resource_type,
      resource_id: resource_type === "nickname" ? user_id : resource_id,
      action: status,
      reason:
        resource_type === "nickname"
          ? `Nickname "${resourceContent}" ${status} by AI moderator`
          : status === "rejected"
            ? `${resource_type} rejected by AI moderator`
            : `${resource_type} approved by AI moderator`,
      ...(resource_type !== "nickname" && { reviewer_anon_id: authorAnonId }),
    };

    await supabase
      .schema("forum")
      .from("moderation_log")
      .insert(moderationLogData)
      .throwOnError();

    return new Response(
      JSON.stringify({
        success: true,
        status,
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
