import { render, screen, waitFor } from "@testing-library/react";
import { useSearchParams, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/browser";
import Page from "./page";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  redirect: jest.fn(),
}));

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/utils/supabase/errors", () => ({
  getAuthErrorMessage: jest.fn((code) => `Error: ${code}`),
}));

jest.mock("@/components/loading-spinner", () => ({
  LoadingSpinner: () => <div>Loading...</div>,
}));

describe("Reset Password Verification Page", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        verifyOtp: jest.fn(),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    jest.clearAllMocks();
  });

  //   it("renders the loading spinner initially", async () => {
  //     (useSearchParams as jest.Mock).mockReturnValue({
  //       get: jest.fn(() => null),
  //     });

  //     render(<Page />);

  //     await waitFor(async () => {
  //       expect(screen.getByText("Loading...")).toBeInTheDocument();
  //     });
  //   });

  it("displays an error if token_hash is missing or type is invalid", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => (key === "type" ? "invalid" : null)),
    });

    render(<Page />);

    await waitFor(async () => {
      expect(
        screen.getByText("Invalid or expired reset link")
      ).toBeInTheDocument();
    });
  });

  it("displays an error if verifyOtp fails", async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => (key === "th" ? "valid_token" : "recovery")),
    });

    mockSupabase.auth.verifyOtp.mockResolvedValue({
      error: { code: "invalid_otp" },
    });

    render(<Page />);

    await waitFor(async () => {
      expect(screen.getByText("Error: invalid_otp")).toBeInTheDocument();
    });
  });

  it("redirects to /reset-password if verifyOtp succeeds", async () => {
    const mockRedirect = jest.fn();
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key) => (key === "th" ? "valid_token" : "recovery")),
    });

    mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });
    redirect.mockImplementation(mockRedirect);

    render(<Page />);

    await waitFor(async () => {
      expect(mockRedirect).toHaveBeenCalledWith("/reset-password");
    });
  });
});
