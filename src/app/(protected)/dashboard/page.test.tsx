import { render, screen, waitFor } from "@/utils/tests";
import DashboardPage from "./page";
import React from "react";
import { toast } from "sonner";

global.fetch = jest.fn();

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("@/components/dashboard/skeleton", () => {
  const MockSkeleton = () => (
    <div data-testid="dashboard-skeleton">Loading...</div>
  );
  MockSkeleton.displayName = "MockSkeleton";
  return MockSkeleton;
});

describe("Dashboard Page", () => {
  let mockMeetings: any = [],
    mockAnnouncements: any = [];

  beforeEach(() => {
    jest.clearAllMocks();

    // Override the fetch mock to return meeting and announcement data
    (global.fetch as jest.Mock).mockImplementation((url: RequestInfo) => {
      const urlStr = url.toString();
      if (urlStr.includes("/api/user/meetings")) {
        return Promise.resolve(getMockFetchResponse({ data: mockMeetings }));
      }
      if (urlStr.includes("/api/user/announcements")) {
        return Promise.resolve(
          getMockFetchResponse({ data: mockAnnouncements })
        );
      }
      return Promise.resolve(getMockFetchResponse({}));
    });
  });

  it("renders the loading skeleton while data is being fetched", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });
  });

  it("renders no upcoming meetings message when there are no meetings", async () => {
    render(<DashboardPage />);

    await waitFor(() =>
      expect(
        screen.getByText("You have no upcoming meetings.")
      ).toBeInTheDocument()
    );
  });

  it("renders no new announcements message when there are no announcements", async () => {
    render(<DashboardPage />);

    await waitFor(() =>
      expect(
        screen.getByText("There are no new announcements")
      ).toBeInTheDocument()
    );
  });

  it("renders upcoming meetings when data is available", async () => {
    mockMeetings = [
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

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Meeting 1")).toBeInTheDocument();
      expect(screen.getByText("Meeting 2")).toBeInTheDocument();
    });
  });

  it("renders announcements when data is available", async () => {
    mockAnnouncements = [
      { id: "1", title: "Announcement 1", created_at: "2023-10-01T10:00:00Z" },
      { id: "2", title: "Announcement 2", created_at: "2023-10-02T14:00:00Z" },
    ];

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Announcement 1")).toBeInTheDocument();
      expect(screen.getByText("Announcement 2")).toBeInTheDocument();
    });
  });

  it("renders toast if error occurs while fetching data", async () => {
    const meetingsError = "Error fetching meetings";
    const announcementsError = "Error fetching announcements";

    (global.fetch as jest.Mock).mockImplementation((url: RequestInfo) => {
      const urlStr = url.toString();
      if (urlStr.includes("/api/user/meetings")) {
        return Promise.resolve(getMockFetchResponse({ error: meetingsError }));
      }
      if (urlStr.includes("/api/user/announcements")) {
        return Promise.resolve(
          getMockFetchResponse({ error: announcementsError })
        );
      }
      return Promise.resolve(getMockFetchResponse({ error: "Unknown error" }));
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(2);
      expect(toast.error).toHaveBeenCalledWith(meetingsError);
      expect(toast.error).toHaveBeenCalledWith(announcementsError);

      expect(
        screen.getByText("You have no upcoming meetings.")
      ).toBeInTheDocument();

      expect(
        screen.getByText("There are no new announcements")
      ).toBeInTheDocument();
    });
  });
});

function getMockFetchResponse(response: any) {
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-type": "application/json" },
  });
}
