import { createAdminClient } from "@/utils/supabase/server";

interface WebhookEventContext {
  eventName: string;
  eventSuffix: string;
  startTime: number;
}

const supabaseAdmin = createAdminClient();

/**
 * Converts a Unix timestamp to ISO string format
 */
export function unixTimestampToISO(timestamp: number | null): string | null {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

/**
 * Creates a webhook event context for logging and tracking
 */
export function createEventContext(
  eventName: string,
  suffix: string
): WebhookEventContext {
  return {
    eventName,
    eventSuffix: suffix,
    startTime: Date.now(),
  };
}

/**
 * Logs webhook event start and completion with timing
 */
export function logWebhookEvent(
  context: WebhookEventContext,
  isStart = true
): void {
  const { eventName, eventSuffix, startTime } = context;

  if (isStart) {
    console.log(`Started ${eventName} for ${eventSuffix}`);
  } else {
    const duration = Date.now() - startTime;
    console.log(`Completed ${eventName} for ${eventSuffix} (${duration}ms)`);
  }
}

/**
 * Wraps Supabase queries with error handling and logging
 */
export async function executeSupabaseQuery<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  context: WebhookEventContext,
  operation = ""
): Promise<T | null> {
  try {
    const { data } = await query.throwOnError();
    return data;
  } catch (error) {
    const errorMsg = `Supabase error: ${context.eventName}-${operation}`;
    console.error(errorMsg, error);
    throw new Error(errorMsg);
  }
}

/**
 * Gets the Supabase admin client
 */
export function getSupabaseAdmin() {
  return supabaseAdmin;
}
