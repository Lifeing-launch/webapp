import { render, screen, waitFor } from "@/utils/tests";
import { NavUser } from "./nav-user";
import { useUser } from "@/components/providers/user-provider";

// Mock Supabase actions
jest.mock("@/utils/supabase/actions", () => ({
  signOutAction: jest.fn(),
}));

// Mock the useUser hook
jest.mock("@/components/providers/user-provider", () => ({
  useUser: jest.fn(),
}));

describe("NavUser", () => {
  const mockUser = {
    id: "user123",
    email: "test@example.com",
  };

  const mockProfile = {
    id: "profile123",
    user_id: "user123",
    first_name: "John",
    last_name: "Doe",
    avatar_url: "https://example.com/avatar.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      anonymousProfile: null,
      currentDisplayName: "John Doe",
      loading: false,
      error: null,
      refetchUser: jest.fn(),
      refetchProfile: jest.fn(),
      refetchAnonymousProfile: jest.fn(),
    });
  });

  it("renders without crashing", () => {
    render(<NavUser />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows log out button when no profile is available", () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      profile: null,
      anonymousProfile: null,
      currentDisplayName: "",
      loading: false,
      error: null,
      refetchUser: jest.fn(),
      refetchProfile: jest.fn(),
      refetchAnonymousProfile: jest.fn(),
    });

    render(<NavUser />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
    expect(screen.getByTestId("nav-user-partial")).toBeInTheDocument();
  });

  it("shows log out button when loading", () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      profile: null,
      anonymousProfile: null,
      currentDisplayName: "",
      loading: true,
      error: null,
      refetchUser: jest.fn(),
      refetchProfile: jest.fn(),
      refetchAnonymousProfile: jest.fn(),
    });

    render(<NavUser />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
    expect(screen.getByTestId("nav-user-partial")).toBeInTheDocument();
  });

  it("fetches and displays user profile data", async () => {
    render(<NavUser />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });
});
