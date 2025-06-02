import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RsvpButton from "./rsvp-button";
import { createClient } from "@/utils/supabase/browser";
import { toast } from "sonner";

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
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

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
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
    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");
    fireEvent.click(button);
    expect(button).toHaveTextContent("RSVPing...");
    expect(button).toBeDisabled();
  });

  it("calls Supabase to RSVP and updates the button state", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user123" } },
    });
    mockSupabaseClient.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("rsvps");
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        meeting_id: 123,
        user_id: "user123",
      });
      expect(screen.getByText("RSVPed")).toBeInTheDocument();
    });
  });

  it("handles errors gracefully when Supabase insert fails", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user123" } },
    });
    mockSupabaseClient.from.mockReturnValue({
      insert: jest
        .fn()
        .mockResolvedValue({ error: { message: "Insert failed" } }),
    });

    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("rsvps");
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith({
        meeting_id: 123,
        user_id: "user123",
      });
      expect(screen.getByText("RSVP")).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith("Failed to RSVP to meeting");
    });
  });

  it("does nothing if no user is returned from Supabase", async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } });

    render(<RsvpButton meetingId={123} hasRsvped={false} />);
    const button = screen.getByText("RSVP");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
      expect(screen.getByText("RSVP")).toBeInTheDocument();
    });
  });
});
