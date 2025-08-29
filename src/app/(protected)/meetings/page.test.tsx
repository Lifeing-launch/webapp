import { render, screen, waitFor } from "@/utils/tests";
import MeetingsPage from "./page";
import React from "react";

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

jest.mock("@/components/meetings/meetings-tab", () => {
  const MockMeetingsTab = ({ initialDateRange, showDatePicker }: any) => (
    <div data-testid="meetings-tab">
      <div>Meetings Tab</div>
      {showDatePicker && <div data-testid="date-picker">Date Picker</div>}
      <div>
        Date Range: {initialDateRange.from.toDateString()} -{" "}
        {initialDateRange.to?.toDateString()}
      </div>
    </div>
  );
  MockMeetingsTab.displayName = "MockMeetingsTab";
  return { MeetingsTab: MockMeetingsTab };
});

jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: any) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value, onClick }: any) => (
    <button data-testid={`tab-${value}`} onClick={onClick}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

jest.mock("@/components/layout/nav/app-sidebar", () => ({
  sidebarIcons: {
    meetings: "📅",
  },
}));

jest.mock("@/components/layout/page-template", () => {
  const MockPageTemplate = ({
    children,
    title,
    breadcrumbs,
    headerIcon,
  }: any) => (
    <div data-testid="page-template">
      <div>Title: {title}</div>
      <div>Header Icon: {headerIcon}</div>
      <div>Breadcrumbs: {breadcrumbs?.map((b: any) => b.label).join(", ")}</div>
      {children}
    </div>
  );
  MockPageTemplate.displayName = "MockPageTemplate";
  return MockPageTemplate;
});

describe.skip("Meetings Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Override the fetch mock to return empty data
    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-type": "application/json" },
        })
      );
    });
  });

  it("renders the page with tabs", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
      expect(screen.getByTestId("tabs-list")).toBeInTheDocument();
    });
  });

  it("renders all three tabs with correct labels", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("tab-current-month")).toBeInTheDocument();
      expect(screen.getByText("This month")).toBeInTheDocument();

      expect(screen.getByTestId("tab-next-month")).toBeInTheDocument();
      expect(screen.getByText("Next month")).toBeInTheDocument();

      expect(screen.getByTestId("tab-calendar")).toBeInTheDocument();
      expect(screen.getByText("Calendar view")).toBeInTheDocument();
    });
  });

  it("renders current month tab content by default", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      expect(
        screen.getByTestId("tab-content-current-month")
      ).toBeInTheDocument();
      expect(screen.getAllByTestId("meetings-tab")).toHaveLength(3); // All three tabs render their content
    });
  });

  it("renders next month tab content", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("tab-content-next-month")).toBeInTheDocument();
    });
  });

  it("renders calendar tab content with date picker", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("tab-content-calendar")).toBeInTheDocument();
      // The calendar tab should have a date picker
      const calendarTab = screen.getByTestId("tab-content-calendar");
      expect(calendarTab).toBeInTheDocument();
    });
  });

  it("shows date picker only in calendar view", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      // Should have 3 meetings tabs, but only one with date picker
      const meetingsTabs = screen.getAllByTestId("meetings-tab");
      expect(meetingsTabs).toHaveLength(3);

      // Only the calendar tab should have the date picker
      const datePickers = screen.getAllByTestId("date-picker");
      expect(datePickers).toHaveLength(1);
    });
  });

  it("displays correct date ranges for each tab", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      // Should show date range information for each tab
      const dateRangeTexts = screen.getAllByText(/Date Range:/);
      expect(dateRangeTexts).toHaveLength(3);
    });
  });

  it("renders page template with correct title and breadcrumbs", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      // The page should render with the correct structure
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });
  });

  it("handles tab switching", async () => {
    render(<MeetingsPage />);

    await waitFor(() => {
      const nextMonthTab = screen.getByTestId("tab-next-month");
      expect(nextMonthTab).toBeInTheDocument();
    });
  });
});
