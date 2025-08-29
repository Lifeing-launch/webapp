import { render, screen, waitFor } from "@/utils/tests";
import { MeetingsTab } from "./meetings-tab";
import React from "react";
import { toast } from "sonner";
import { DateRange } from "@/components/ui/custom/date-range-picker";

global.fetch = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("@/components/meetings/skeleton", () => {
  const MockSkeleton = () => (
    <div data-testid="meetings-skeleton">Loading...</div>
  );
  MockSkeleton.displayName = "MockSkeleton";
  return MockSkeleton;
});

jest.mock("@/components/meetings/meeting-card", () => {
  const MockMeetingCard = ({ meeting, hasRsvped }: any) => (
    <div data-testid="meeting-card">
      <div>{meeting.title}</div>
      <div>{hasRsvped ? "RSVPed" : "RSVP"}</div>
    </div>
  );
  MockMeetingCard.displayName = "MockMeetingCard";
  return { MeetingCard: MockMeetingCard };
});

jest.mock("@/components/ui/custom/date-range-picker", () => ({
  DateRangePicker: ({ onUpdate, initialDateFrom, initialDateTo }: any) => (
    <button
      onClick={() =>
        onUpdate?.({ range: { from: initialDateFrom, to: initialDateTo } })
      }
    >
      Date Picker
    </button>
  ),
  DateRange: {} as any,
}));

describe.skip("MeetingsTab", () => {
  let mockMeetings: any = [];

  const defaultDateRange: DateRange = {
    from: new Date("2025-01-01T00:00:00Z"),
    to: new Date("2025-01-31T23:59:59Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Override the fetch mock to return meeting data
    (global.fetch as jest.Mock).mockImplementation((url: RequestInfo) => {
      const urlStr = url.toString();
      if (urlStr.includes("/api/meetings")) {
        return Promise.resolve(getMockFetchResponse({ data: mockMeetings }));
      }

      return Promise.resolve(getMockFetchResponse({}));
    });
  });

  it("renders the loading skeleton while data is being fetched", async () => {
    render(<MeetingsTab initialDateRange={defaultDateRange} />);
    await waitFor(() => {
      expect(screen.getByTestId("meetings-skeleton")).toBeInTheDocument();
    });
  });

  it("renders no upcoming meetings message when there are no meetings", async () => {
    render(<MeetingsTab initialDateRange={defaultDateRange} />);

    await waitFor(() =>
      expect(
        screen.getByText("There are no meetings to display.")
      ).toBeInTheDocument()
    );
  });

  it("renders upcoming meetings when data is available", async () => {
    mockMeetings = [
      {
        id: 1,
        title: "Meeting 1",
        when: "2025-01-15T10:00:00Z",
        meeting_type: "webinar",
        hasRsvped: false,
      },
      {
        id: 2,
        title: "Meeting 2",
        when: "2025-01-20T14:00:00Z",
        meeting_type: "webinar",
        hasRsvped: true,
      },
    ];

    render(<MeetingsTab initialDateRange={defaultDateRange} />);

    await waitFor(() => {
      expect(screen.getByText("January 15, 2025")).toBeInTheDocument();
      expect(screen.getByText("Meeting 1")).toBeInTheDocument();
      expect(screen.getByText("January 20, 2025")).toBeInTheDocument();
      expect(screen.getByText("Meeting 2")).toBeInTheDocument();
    });
  });

  it("renders today and tomorrow sections when dates fall within range", async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateRangeIncludingToday: DateRange = {
      from: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1
      ),
      to: new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate() + 1
      ),
    };

    render(<MeetingsTab initialDateRange={dateRangeIncludingToday} />);

    await waitFor(() => {
      // Look for the today and tomorrow sections by their message text
      expect(
        screen.getByText("No meetings scheduled for today")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No meetings scheduled for tomorrow")
      ).toBeInTheDocument();
    });
  });

  it("does not render today and tomorrow sections when dates fall outside range", async () => {
    const futureDateRange: DateRange = {
      from: new Date("2025-06-01T00:00:00Z"),
      to: new Date("2025-06-30T23:59:59Z"),
    };

    render(<MeetingsTab initialDateRange={futureDateRange} />);

    await waitFor(() => {
      expect(screen.queryByText(/Today -/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Tomorrow -/)).not.toBeInTheDocument();
      expect(
        screen.queryByText("No meetings scheduled for today")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("No meetings scheduled for tomorrow")
      ).not.toBeInTheDocument();
    });
  });

  it("renders today and tomorrow meetings when they exist and fall within range", async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dateRangeIncludingToday: DateRange = {
      from: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 1
      ),
      to: new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate() + 1
      ),
    };

    mockMeetings = [
      {
        id: 1,
        title: "Today Meeting",
        when: today.toISOString(),
        meeting_type: "webinar",
        hasRsvped: false,
      },
      {
        id: 2,
        title: "Tomorrow Meeting",
        when: tomorrow.toISOString(),
        meeting_type: "webinar",
        hasRsvped: true,
      },
    ];

    render(<MeetingsTab initialDateRange={dateRangeIncludingToday} />);

    await waitFor(() => {
      expect(screen.getByText("Today Meeting")).toBeInTheDocument();
      expect(screen.getByText("Tomorrow Meeting")).toBeInTheDocument();
      expect(
        screen.queryByText("No meetings scheduled for today")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("No meetings scheduled for tomorrow")
      ).not.toBeInTheDocument();
    });
  });

  it("shows date picker when showDatePicker prop is true", async () => {
    render(
      <MeetingsTab initialDateRange={defaultDateRange} showDatePicker={true} />
    );

    await waitFor(() => {
      // The date picker should be visible
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  it("does not show date picker when showDatePicker prop is false", async () => {
    render(
      <MeetingsTab initialDateRange={defaultDateRange} showDatePicker={false} />
    );

    await waitFor(() => {
      // Should not have any buttons (date picker buttons)
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  it("renders toast if error occurs while fetching meeting data", async () => {
    const meetingsError = "Error fetching meetings";

    (global.fetch as jest.Mock).mockImplementation((url: RequestInfo) => {
      const urlStr = url.toString();
      if (urlStr.includes("/api/meetings")) {
        return Promise.resolve(getMockFetchResponse({ error: meetingsError }));
      }
      return Promise.resolve(getMockFetchResponse({ error: "Unknown error" }));
    });

    render(<MeetingsTab initialDateRange={defaultDateRange} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error fetching meetings");
      expect(
        screen.getByText("There are no meetings to display.")
      ).toBeInTheDocument();
    });
  });

  it("handles meetings with RSVP status correctly", async () => {
    mockMeetings = [
      {
        id: 1,
        title: "Meeting with RSVP",
        when: "2025-01-15T10:00:00Z",
        meeting_type: "webinar",
        hasRsvped: true,
      },
      {
        id: 2,
        title: "Meeting without RSVP",
        when: "2025-01-20T14:00:00Z",
        meeting_type: "webinar",
        hasRsvped: false,
      },
    ];

    render(<MeetingsTab initialDateRange={defaultDateRange} />);

    await waitFor(() => {
      expect(screen.getByText("Meeting with RSVP")).toBeInTheDocument();
      expect(screen.getByText("Meeting without RSVP")).toBeInTheDocument();
      expect(screen.getByText("RSVPed")).toBeInTheDocument();
      expect(screen.getByText("RSVP")).toBeInTheDocument();
    });
  });
});

function getMockFetchResponse(response: any) {
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-type": "application/json" },
  });
}
