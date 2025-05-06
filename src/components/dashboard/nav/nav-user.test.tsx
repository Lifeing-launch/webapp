import React from "react";
import { render, screen, waitFor } from "@/utils/tests";
import { NavUser } from "./nav-user";
import { createClient } from "@/utils/supabase/browser";

// Mock supabase client
jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

describe("NavUser", () => {
  const mockGetUser = jest.fn();
  const mockFrom = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock supabase methods
    createClient.mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    });
  });

  it("renders without crashing", () => {
    mockGetUser.mockReturnValue({
      data: null,
      error: null,
    });

    const { container } = render(<NavUser />);
    expect(container).toBeInTheDocument();
  });

  it("handles errors when fetching auth user data", async () => {
    // Mock auth.getUser response with an error
    mockGetUser.mockResolvedValue({
      data: null,
      error: { message: "Auth error" },
    });

    render(<NavUser />);

    expect(screen.queryByTestId("nav-user")).not.toBeInTheDocument();
  });

  it("fetches and displays user profile data", async () => {
    const profileData = {
      first_name: "Jane",
      last_name: "Doe",
      email: "janedoe@outlook.com",
    };

    // Mock auth.getUser response
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    });

    // Mock from('user_profiles').select().eq().single() response
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: profileData,
        error: null,
      }),
    });

    render(<NavUser />);

    // Wait for the user profile to load
    await waitFor(() => {
      expect(screen.getByTestId("nav-user")).toBeInTheDocument();
      expect(screen.getByText(profileData.email)).toBeInTheDocument();
      expect(screen.getByText("JD")).toBeInTheDocument();
    });
  });

  it("handles errors when fetching user profile", async () => {
    // Mock auth.getUser response
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user123" } },
      error: null,
    });

    // Mock from('user_profiles').select().eq().single() response with an error
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Profile error" },
      }),
    });

    render(<NavUser />);

    expect(screen.queryByTestId("nav-user")).not.toBeInTheDocument();
  });
});
