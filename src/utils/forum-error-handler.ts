export type ForumErrorType =
  | "NICKNAME_REJECTED"
  | "DUPLICATE_NICKNAME"
  | "MODERATION_FAILED"
  | "UNKNOWN";

export interface ForumError {
  type: ForumErrorType;
  message: string;
}

/**
 * Classifies forum-related errors and returns user-friendly messages
 */
export const classifyForumError = (err: unknown): ForumError => {
  // Handle Error instances
  if (err instanceof Error) {
    // Nickname rejected by moderation
    if (
      err.name === "NicknameRejectedError" ||
      err.message === "NICKNAME_REJECTED" ||
      err.message.includes("NICKNAME_REJECTED")
    ) {
      return {
        type: "NICKNAME_REJECTED",
        message:
          "This nickname contains inappropriate content. Please choose a different one.",
      };
    }

    // Duplicate nickname errors
    if (
      err.name === "DuplicateKeyError" ||
      err.message.includes("duplicate key") ||
      err.message.includes("unique constraint") ||
      err.message.includes("anonymous_profiles_nickname_key") ||
      err.message.includes("23505") ||
      err.message.includes("Duplicate key constraint") ||
      (err.message.includes("409") && err.message.includes("Conflict")) ||
      (err.message.toLowerCase().includes("nickname") &&
        err.message.toLowerCase().includes("exists"))
    ) {
      return {
        type: "DUPLICATE_NICKNAME",
        message: "This nickname is already in use. Try another one.",
      };
    }

    // Moderation API failures
    if (err.message.includes("Failed to moderate")) {
      return {
        type: "MODERATION_FAILED",
        message: "Unable to validate nickname. Please try again.",
      };
    }
  }

  // Handle non-Error objects (e.g., PostgreSQL errors, fetch response errors)
  if (typeof err === "object" && err !== null) {
    const errorObj = err as Record<string, unknown>;

    // PostgreSQL duplicate key error (Supabase format)
    if (
      errorObj.code === "23505" ||
      errorObj.status === 409 ||
      (errorObj.details &&
        String(errorObj.details).includes("anonymous_profiles_nickname_key")) ||
      (errorObj.message &&
        (String(errorObj.message).includes("duplicate key") ||
          String(errorObj.message).includes(
            "anonymous_profiles_nickname_key"
          ) ||
          String(errorObj.message).includes("unique constraint")))
    ) {
      return {
        type: "DUPLICATE_NICKNAME",
        message: "This nickname is already in use. Try another one.",
      };
    }

    // Check nested error property (some Supabase errors have this structure)
    if (errorObj.error && typeof errorObj.error === "object") {
      const nestedError = errorObj.error as Record<string, unknown>;
      if (
        nestedError.code === "23505" ||
        (nestedError.message &&
          String(nestedError.message).includes(
            "anonymous_profiles_nickname_key"
          ))
      ) {
        return {
          type: "DUPLICATE_NICKNAME",
          message: "This nickname is already in use. Try another one.",
        };
      }
    }
  }

  // Default case
  return {
    type: "UNKNOWN",
    message: "An unexpected error occurred. Please try again.",
  };
};

/**
 * Checks if an error is a duplicate nickname error
 */
export const isDuplicateNicknameError = (error: ForumError): boolean => {
  return error.type === "DUPLICATE_NICKNAME";
};

/**
 * Checks if an error is a moderation rejection
 */
export const isNicknameRejectedError = (error: ForumError): boolean => {
  return error.type === "NICKNAME_REJECTED";
};

/**
 * Checks if an error is recoverable (user can retry with different input)
 */
export const isRecoverableError = (error: ForumError): boolean => {
  return (
    error.type === "DUPLICATE_NICKNAME" || error.type === "NICKNAME_REJECTED"
  );
};
