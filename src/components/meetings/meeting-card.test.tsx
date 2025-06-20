import { render, screen } from "@testing-library/react";
import { MeetingCard, MeetingType } from "./meeting-card";
import { formatDate, formatTime } from "@/utils/datetime";

describe("MeetingCard", () => {
  const mockMeeting = {
    id: 1,
    title: "Team Sync",
    when: new Date().toISOString(),
    meeting_type: "group" as MeetingType,
    url: null,
    description: "Meeting description",
  };

  it("renders the meeting title", () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText(mockMeeting.title)).toBeInTheDocument();
  });

  it("renders the meeting description", () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText(mockMeeting.description)).toBeInTheDocument();
  });

  it("renders the formatted date and time", () => {
    render(<MeetingCard meeting={mockMeeting} />);
    const when = new Date(mockMeeting.when);
    expect(
      screen.getByText(`${formatDate(when)} - ${formatTime(when)}`)
    ).toBeInTheDocument();
  });

  it("renders the meeting type with the correct label and icons", () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText("Group Session")).toBeInTheDocument();

    const svgIcons = screen.getAllByTestId("meeting-stat-icon");
    expect(svgIcons.length).toEqual(2);
  });

  it("renders the RSVP button when showRsvp is true", () => {
    render(<MeetingCard meeting={mockMeeting} showRsvp={true} />);
    expect(screen.getByRole("button", { name: /rsvp/i })).toBeInTheDocument();
  });

  it("does not render the RSVP button when showRsvp is false", () => {
    render(<MeetingCard meeting={mockMeeting} showRsvp={false} />);
    expect(
      screen.queryByRole("button", { name: /rsvp/i })
    ).not.toBeInTheDocument();
  });

  it("renders the 'Join meeting' button when hasRsvped is true and meeting is highlighted", () => {
    render(<MeetingCard meeting={mockMeeting} hasRsvped={true} />);
    expect(
      screen.getByRole("button", { name: /join meeting/i })
    ).toBeInTheDocument();
  });

  it("does not render the 'Join meeting' button when hasRsvped is false", () => {
    render(<MeetingCard meeting={mockMeeting} hasRsvped={false} />);
    expect(
      screen.queryByRole("button", { name: /join meeting/i })
    ).not.toBeInTheDocument();
  });

  it("applies the highlighted style when the meeting is within the highlight interval", () => {
    render(<MeetingCard meeting={mockMeeting} />);
    const card = screen.getByTestId("meeting-card");
    expect(card).toHaveClass("bg-purple-50");
    expect(card).toHaveClass("border-l-primary");
  });

  it("does not apply the highlighted style when the meeting is outside the highlight interval", () => {
    const pastMeeting = {
      ...mockMeeting,
      when: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    };
    render(<MeetingCard meeting={pastMeeting} />);
    const card = screen.getByTestId("meeting-card");
    expect(card).not.toHaveClass("bg-lime-50");
    expect(card).not.toHaveClass("border-l-[#65A30D]");
  });

  it("renders custom className when provided", () => {
    render(<MeetingCard meeting={mockMeeting} className="custom-class" />);
    const card = screen.getByTestId("meeting-card");
    expect(card).toHaveClass("custom-class");
  });
});
