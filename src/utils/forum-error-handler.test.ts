import {
  classifyForumError,
  isDuplicateNicknameError,
  isNicknameRejectedError,
  isRecoverableError,
  type ForumError,
} from "./forum-error-handler";

describe("Forum Error Handler", () => {
  describe("classifyForumError", () => {
    describe("NICKNAME_REJECTED errors", () => {
      it("should classify NicknameRejectedError by name", () => {
        const error = new Error("Some message");
        error.name = "NicknameRejectedError";

        const result = classifyForumError(error);

        expect(result.type).toBe("NICKNAME_REJECTED");
        expect(result.message).toBe(
          "This nickname contains inappropriate content. Please choose a different one."
        );
      });

      it("should classify error with NICKNAME_REJECTED message", () => {
        const error = new Error("NICKNAME_REJECTED");

        const result = classifyForumError(error);

        expect(result.type).toBe("NICKNAME_REJECTED");
        expect(result.message).toBe(
          "This nickname contains inappropriate content. Please choose a different one."
        );
      });

      it("should classify error containing NICKNAME_REJECTED in message", () => {
        const error = new Error("Validation failed: NICKNAME_REJECTED");

        const result = classifyForumError(error);

        expect(result.type).toBe("NICKNAME_REJECTED");
      });
    });

    describe("DUPLICATE_NICKNAME errors", () => {
      it("should classify DuplicateKeyError by name", () => {
        const error = new Error("Some duplicate error");
        error.name = "DuplicateKeyError";

        const result = classifyForumError(error);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
        expect(result.message).toBe(
          "This nickname is already in use. Try another one."
        );
      });

      it("should classify error with duplicate key in message", () => {
        const error = new Error(
          "duplicate key value violates unique constraint"
        );

        const result = classifyForumError(error);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify error with unique constraint in message", () => {
        const error = new Error("unique constraint violation");

        const result = classifyForumError(error);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify error with anonymous_profiles_nickname_key", () => {
        const error = new Error(
          "Key (nickname)=(test) already exists in anonymous_profiles_nickname_key"
        );

        const result = classifyForumError(error);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify error with PostgreSQL code 23505", () => {
        const error = new Error("Duplicate key constraint violation 23505");

        const result = classifyForumError(error);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify 409 Conflict errors", () => {
        const error = new Error("409 Conflict - Resource already exists");

        const result = classifyForumError(error);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify nickname exists errors", () => {
        const error = new Error("The nickname already exists");

        const result = classifyForumError(error);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });
    });

    describe("PostgreSQL error objects", () => {
      it("should classify PostgreSQL duplicate key error object", () => {
        const postgresError = {
          code: "23505",
          message: "duplicate key value violates unique constraint",
          details: "Key (nickname)=(test) already exists.",
        };

        const result = classifyForumError(postgresError);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify error object with status 409", () => {
        const errorObj = {
          status: 409,
          message: "Conflict",
        };

        const result = classifyForumError(errorObj);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify error object with details containing constraint name", () => {
        const errorObj = {
          details: "Key violates anonymous_profiles_nickname_key constraint",
          message: "Database error",
        };

        const result = classifyForumError(errorObj);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
      });

      it("should classify Supabase 409 error with exact format from user report", () => {
        const supabaseError = {
          code: "23505",
          details: null,
          hint: null,
          message:
            'duplicate key value violates unique constraint "anonymous_profiles_nickname_key"',
        };

        const result = classifyForumError(supabaseError);

        expect(result.type).toBe("DUPLICATE_NICKNAME");
        expect(result.message).toBe(
          "This nickname is already in use. Try another one."
        );
      });
    });

    describe("MODERATION_FAILED errors", () => {
      it("should classify moderation API failures", () => {
        const error = new Error("Failed to moderate content");

        const result = classifyForumError(error);

        expect(result.type).toBe("MODERATION_FAILED");
        expect(result.message).toBe(
          "Unable to validate nickname. Please try again."
        );
      });
    });

    describe("UNKNOWN errors", () => {
      it("should classify unknown Error instances", () => {
        const error = new Error("Some random error");

        const result = classifyForumError(error);

        expect(result.type).toBe("UNKNOWN");
        expect(result.message).toBe(
          "An unexpected error occurred. Please try again."
        );
      });

      it("should classify unknown error objects", () => {
        const errorObj = {
          someProperty: "someValue",
        };

        const result = classifyForumError(errorObj);

        expect(result.type).toBe("UNKNOWN");
      });

      it("should classify primitive error values", () => {
        const result1 = classifyForumError("string error");
        const result2 = classifyForumError(123);
        const result3 = classifyForumError(null);

        expect(result1.type).toBe("UNKNOWN");
        expect(result2.type).toBe("UNKNOWN");
        expect(result3.type).toBe("UNKNOWN");
      });
    });
  });

  describe("Helper functions", () => {
    describe("isDuplicateNicknameError", () => {
      it("should return true for DUPLICATE_NICKNAME errors", () => {
        const error: ForumError = {
          type: "DUPLICATE_NICKNAME",
          message: "Test message",
        };

        expect(isDuplicateNicknameError(error)).toBe(true);
      });

      it("should return false for other error types", () => {
        const error: ForumError = {
          type: "NICKNAME_REJECTED",
          message: "Test message",
        };

        expect(isDuplicateNicknameError(error)).toBe(false);
      });
    });

    describe("isNicknameRejectedError", () => {
      it("should return true for NICKNAME_REJECTED errors", () => {
        const error: ForumError = {
          type: "NICKNAME_REJECTED",
          message: "Test message",
        };

        expect(isNicknameRejectedError(error)).toBe(true);
      });

      it("should return false for other error types", () => {
        const error: ForumError = {
          type: "DUPLICATE_NICKNAME",
          message: "Test message",
        };

        expect(isNicknameRejectedError(error)).toBe(false);
      });
    });

    describe("isRecoverableError", () => {
      it("should return true for DUPLICATE_NICKNAME errors", () => {
        const error: ForumError = {
          type: "DUPLICATE_NICKNAME",
          message: "Test message",
        };

        expect(isRecoverableError(error)).toBe(true);
      });

      it("should return true for NICKNAME_REJECTED errors", () => {
        const error: ForumError = {
          type: "NICKNAME_REJECTED",
          message: "Test message",
        };

        expect(isRecoverableError(error)).toBe(true);
      });

      it("should return false for MODERATION_FAILED errors", () => {
        const error: ForumError = {
          type: "MODERATION_FAILED",
          message: "Test message",
        };

        expect(isRecoverableError(error)).toBe(false);
      });

      it("should return false for UNKNOWN errors", () => {
        const error: ForumError = {
          type: "UNKNOWN",
          message: "Test message",
        };

        expect(isRecoverableError(error)).toBe(false);
      });
    });
  });
});
