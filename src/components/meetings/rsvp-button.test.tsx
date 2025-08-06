import { render, screen, fireEvent, waitFor, act } from "@/utils/tests";
import RsvpButton from "./rsvp-button";
import { createClient } from "@/utils/supabase/browser";
import { toast } from "sonner";
import { useUser } from "@/components/providers/user-provider";

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock the useUser hook
jest.mock("@/components/providers/user-provider", () => ({
  useUser: jest.fn(),
}));

describe("RsvpButton", () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
    })),
  };

  const mockUser = {
    id: "user123",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      profile: null,
      anonymousProfile: null,
      currentDisplayName: "",
      loading: false,
      error: null,
      refetchUser: jest.fn(),
      refetchProfile: jest.fn(),
      refetchAnonymousProfile: jest.fn(),
    });
  });

  it("renders the RSVP button when hasRsvped is false", () => {
    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    expect(screen.getByText("RSVP")).toBeInTheDocument();
  });

  it("renders the RSVPed button when hasRsvped is true", () => {
    render(<RsvpButton meetingId={123} hasRsvped={true} />);
    expect(screen.getByText("RSVPed")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables the button and shows 'RSVPing...' while loading", async () => {
    // Mock a delayed response to simulate loading state
    mockSupabaseClient.from.mockReturnValue({
      insert: jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ error: null }), 100)
            )
        ),
    });

    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");

    await act(async () => {
      fireEvent.click(button);
    });

    // Check that the button shows loading state immediately after click
    expect(button).toHaveTextContent("RSVPing...");
    expect(button).toBeDisabled();
  });

  it("calls Supabase to RSVP and updates the button state", async () => {
    mockSupabaseClient.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("rsvps");
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        meeting_id: 123,
        user_id: "user123",
      });
      expect(screen.getByText("RSVPed")).toBeInTheDocument();
    });
  });

  it("handles errors gracefully when Supabase insert fails", async () => {
    mockSupabaseClient.from.mockReturnValue({
      insert: jest
        .fn()
        .mockResolvedValue({ error: { message: "Insert failed" } }),
    });

    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("rsvps");
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        meeting_id: 123,
        user_id: "user123",
      });
      expect(screen.getByText("RSVP")).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Failed to RSVP to meeting");
    });
  });

  it("shows error when no user is logged in", async () => {
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

    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");

    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please log in to RSVP");
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });
  });
});
