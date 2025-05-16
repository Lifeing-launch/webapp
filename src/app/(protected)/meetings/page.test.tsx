import { render, screen, waitFor } from "@/utils/tests";
import MeetingsPage from "./page";
import React from "react";
import { createClient } from "@/utils/supabase/browser";

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/components/meetings/skeleton", () => {
  const MockSkeleton = () => (
    <div data-testid="meetings-skeleton">Loading...</div>
  );
  MockSkeleton.displayName = "MockSkeleton";
  return MockSkeleton;
});

describe("Meetings Page", () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it("renders the loading skeleton while data is being fetched", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "USER_ID" } },
    });
    render(<MeetingsPage />);
    await waitFor(() => {
      expect(screen.getByTestId("meetings-skeleton")).toBeInTheDocument();
    });
  });

  it("renders loading state when there's no user session", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: undefined },
    });

    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("meetings-skeleton")).toBeInTheDocument();
      expect(
        screen.queryByText("There are no meetings to display.")
      ).not.toBeInTheDocument();
    });
  });

  it("renders no upcoming meetings message when there are no meetings", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });
    mockSupabase.order.mockResolvedValueOnce({ data: [] }); // Mock meetings
    mockSupabase.eq.mockResolvedValueOnce({ data: [] }); // Mock RSVPs

    render(<MeetingsPage />);

    await waitFor(() =>
      expect(
        screen.getByText("There are no meetings to display.")
      ).toBeInTheDocument()
    );
  });

  it("renders upcoming meetings when data is available", async () => {
    const mockMeetings = [
      {
        id: "1",
        title: "Meeting 1",
        when: "2028-04-01T10:00:00Z",
        meeting_type: "webinar",
      },
      {
        id: "2",
        title: "Meeting 2",
        when: "2028-10-02T14:00:00Z",
        meeting_type: "webinar",
      },
    ];
    const mockRsvpMeetingIds = ["1"];

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });

    mockSupabase.order.mockResolvedValueOnce({
      data: mockMeetings,
    }); // Mock meetings

    mockSupabase.eq.mockResolvedValueOnce({
      data: mockRsvpMeetingIds.map((meeting_id) => ({
        meeting_id,
      })),
    }); // Mock RSVPs

    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByText("April 1, 2028")).toBeInTheDocument();
      expect(screen.getByText("Meeting 1")).toBeInTheDocument();
      expect(screen.getByText("October 2, 2028")).toBeInTheDocument();
      expect(screen.getByText("Meeting 2")).toBeInTheDocument();
    });
  });

  // Test the number of rsvped vs rsvp buttons
  // Test when no tomorrow event is added
  // Test when tomorrow event is added
  // Test when no today event is added
  // Tes when today

  it("renders the correct number of RSVP and RSVPed buttons", async () => {
    const mockMeetings = [
      {
        id: "1",
        title: "Meeting 1",
        when: "2028-04-01T10:00:00Z",
        meeting_type: "webinar",
      },
      {
        id: "2",
        title: "Meeting 2",
        when: "2028-10-02T14:00:00Z",
        meeting_type: "webinar",
      },
    ];
    const mockRsvpMeetingIds = ["1"];

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });

    mockSupabase.order.mockResolvedValueOnce({
      data: mockMeetings,
    }); // Mock meetings

    mockSupabase.eq.mockResolvedValueOnce({
      data: mockRsvpMeetingIds.map((meeting_id) => ({
        meeting_id,
      })),
    }); // Mock RSVPs

    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Meeting 1")).toBeInTheDocument();
      expect(screen.getByText("RSVP")).toBeInTheDocument();
      expect(screen.getByText("Meeting 2")).toBeInTheDocument();
      expect(screen.getByText("RSVPed")).toBeInTheDocument();
    });
  });

  it("renders no today or tomorrow event message if not included", async () => {
    const mockMeetings = [
      {
        id: "1",
        title: "Meeting 1",
        when: "2028-04-01T10:00:00Z",
        meeting_type: "webinar",
      },
      {
        id: "2",
        title: "Meeting 2",
        when: "2028-10-02T14:00:00Z",
        meeting_type: "webinar",
      },
    ];

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });

    mockSupabase.order.mockResolvedValueOnce({
      data: mockMeetings,
    }); // Mock meetings

    mockSupabase.eq.mockResolvedValueOnce({
      data: [],
    }); // Mock RSVPs

    render(<MeetingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No meetings scheduled for today")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No meetings scheduled for tomorrow")
      ).toBeInTheDocument();
    });
  });

  it("renders today and tomorrow meetings if included", async () => {
    const today = new Date();

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const mockMeetings = [
      {
        id: "1",
        title: "Meeting 1",
        when: "2028-04-01T10:00:00Z",
        meeting_type: "webinar",
      },
      {
        id: "2",
        title: "Meeting 2",
        when: "2028-10-02T14:00:00Z",
        meeting_type: "webinar",
      },
      {
        id: "1",
        title: "Meeting 3",
        when: today.toISOString(),
        meeting_type: "webinar",
      },
      {
        id: "2",
        title: "Meeting 4",
        when: tomorrow.toISOString(),
        meeting_type: "webinar",
      },
    ];

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });
    mockSupabase.order.mockResolvedValueOnce({
      data: mockMeetings,
    }); // Mock meetings
    mockSupabase.eq.mockResolvedValueOnce({
      data: [],
    }); // Mock RSVPs

    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Meeting 1")).toBeInTheDocument();
      expect(screen.getByText("Meeting 2")).toBeInTheDocument();
      expect(screen.getByText("Meeting 3")).toBeInTheDocument();
      expect(screen.getByText("Meeting 4")).toBeInTheDocument();

      expect(
        screen.queryByText("No meetings scheduled for today")
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("No meetings scheduled for tomorrow")
      ).not.toBeInTheDocument();
    });
  });
});
