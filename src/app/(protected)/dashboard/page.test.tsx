import { render, screen, waitFor } from "@/utils/tests";
import DashboardPage from "./page";
import React from "react";
import { createClient } from "@/utils/supabase/browser";

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/components/dashboard/skeleton", () => {
  const MockSkeleton = () => (
    <div data-testid="dashboard-skeleton">Loading...</div>
  );
  MockSkeleton.displayName = "MockSkeleton";
  return MockSkeleton;
});

describe("Dashboard Page", () => {
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
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });
  });

  it("renders loading state when there's no user session", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: undefined },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
      expect(
        screen.queryByText("You have no upcoming meetings.")
      ).not.toBeInTheDocument();
    });
  });

  it("renders no upcoming meetings message when there are no meetings", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });
    mockSupabase.gt.mockResolvedValueOnce({ data: [] }); // Mock RSVPs
    mockSupabase.limit.mockResolvedValueOnce({ data: [] }); // Mock Announcements

    render(<DashboardPage />);

    await waitFor(() =>
      expect(
        screen.getByText("You have no upcoming meetings.")
      ).toBeInTheDocument()
    );
  });

  it("renders upcoming meetings when data is available", async () => {
    const mockMeetings = [
      {
        id: "1",
        title: "Meeting 1",
        when: "2023-10-01T10:00:00Z",
        meeting_type: "webinar",
      },
      {
        id: "2",
        title: "Meeting 2",
        when: "2023-10-02T14:00:00Z",
        meeting_type: "webinar",
      },
    ];

    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });
    mockSupabase.gt.mockResolvedValueOnce({
      data: mockMeetings.map((meeting) => ({ meeting })),
    }); // Mock RSVPs
    mockSupabase.limit.mockResolvedValueOnce({ data: [] }); // Mock Announcements

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Meeting 1")).toBeInTheDocument();
      expect(screen.getByText("Meeting 2")).toBeInTheDocument();
    });
  });

  it("renders announcements when data is available", async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "USER_ID" } },
    });
    const mockAnnouncements = [
      { id: "1", title: "Announcement 1", created_at: "2023-10-01T10:00:00Z" },
      { id: "2", title: "Announcement 2", created_at: "2023-10-02T14:00:00Z" },
    ];

    mockSupabase.gt.mockResolvedValueOnce({ data: [] }); // Mock RSVPs
    mockSupabase.limit.mockResolvedValueOnce({ data: mockAnnouncements }); // Mock Announcements

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Announcement 1")).toBeInTheDocument();
      expect(screen.getByText("Announcement 2")).toBeInTheDocument();
    });
  });
});
