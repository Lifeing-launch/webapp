/* eslint-disable */
/**
 * @fileoverview Moderate a resource (post, comment, nickname, group_name, or group_description) using OpenAI.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL");

async function moderate(content) {
  if (!OPENAI_API_KEY) return "rejected";
  const systemPrompt = `
    You are a strict content moderator for the Lifeing Lounge, a family‑friendly, health‑coaching community forum.

    Classification policy:
    • rejected (ban): Content that is not allowed and should be removed.
    • pending (flagged for human review): Sensitive content that requires a human moderator (do not auto‑ban).
    • approved: Content is acceptable.

    Always choose exactly one of: "approved", "pending", or "rejected" (lower‑case, single word, no additional text).

    Banned — respond "rejected":
    • Hate speech, discrimination, or bullying: racial/ethnic/religious/gender slurs; homophobic, transphobic, sexist, ableist slurs; disrespectful misgendering; hate or hate‑group references; derogatory mental‑health terms used pejoratively (e.g., "retarded", "crazy" as insults)
    • Inappropriate sexual content: graphic sexual descriptions; unsolicited flirting or sexual advances; links or references to pornography
    • Promotion of dangerous or illegal behavior: selling or sourcing drugs or alcohol; promoting illegal activity (e.g., how to buy fake IDs); MLM or pyramid scheme promotion; promoting disordered eating; encouraging binge drinking or blacking out
    • Extremist propaganda
    • Profanity, vulgar, or obscene language
    • Graphic violence
    • Personal information (emails, phone numbers, physical addresses)

    Flagged for Review — respond "pending":
    • Harmful or triggering content where the user may need support rather than a ban: suicide/suicidal ideation (e.g., "kill myself", "want to die"), self‑harm/cutting/self‑injury, overdose/"OD"/"taking all my pills", pro‑ana/thinspo/starvation/fasting for weight loss, trauma dumping
      – Rationale: may trigger a crisis‑resource response instead of a hard ban
    • Spam and off‑topic advertising: URLs to unapproved sites, affiliate links, promotions not cleared by moderators
    • Politically charged content (see internal list): content likely to provoke conflict or derail the forum mission

    Notes:
    • When in doubt between "rejected" and "pending" for sensitive self‑harm content, choose "pending" to ensure a supportive, safety‑first workflow.
    • Do not provide explanations — reply with one lower‑case word only: approved | pending | rejected.
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
      max_tokens: 2,
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
  if (verdict === "approved") return "approved";
  if (verdict === "pending") return "pending"; // Flagged for human review
  return "rejected";
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

    if (
      ["nickname", "group_name", "group_description"].includes(resource_type)
    ) {
      // Para nickname e grupos, o conteúdo vem diretamente no request
      if (!content) {
        return new Response(
          JSON.stringify({
            error: `Missing content for ${resource_type} moderation`,
          }),
          {
            status: 400,
          }
        );
      }
      if (!user_id) {
        return new Response(
          JSON.stringify({
            error: `Missing user_id for ${resource_type} moderation`,
          }),
          {
            status: 400,
          }
        );
      }
      resourceContent = content;
      authorAnonId = null; // Para nicknames e grupos, ainda não temos anon_profile_id
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
    if (["post", "comment"].includes(resource_type)) {
      const table = resource_type === "comment" ? "comments" : "posts";

      await supabase
        .schema("forum")
        .from(table)
        .update({ status })
        .eq("id", resource_id)
        .throwOnError();
    }

    // Log de moderação - não salva para grupos, conforme solicitado
    if (!["group_name", "group_description"].includes(resource_type)) {
      const moderationLogData = {
        resource_type,
        resource_id: resource_type === "nickname" ? user_id : resource_id,
        action: status,
        reason:
          resource_type === "nickname"
            ? `Nickname "${resourceContent}" ${status} by AI moderator`
            : status === "rejected"
              ? `${resource_type} rejected by AI moderator`
              : status === "pending"
                ? `${resource_type} flagged for human review by AI moderator`
                : `${resource_type} approved by AI moderator`,
        ...(resource_type !== "nickname" && { reviewer_anon_id: authorAnonId }),
      };

      await supabase
        .schema("forum")
        .from("moderation_log")
        .insert(moderationLogData)
        .throwOnError();
    }

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
