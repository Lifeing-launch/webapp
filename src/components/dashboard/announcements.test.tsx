import React from "react";
import { render, screen } from "@testing-library/react";
import { AnnouncementsCard, Announcement } from "./announcements";
import { formatDate } from "@/utils/datetime";

describe("AnnouncementsCard", () => {
  const announcementsWithPrompt: Announcement[] = [
    {
      id: 1,
      title: "Announcement 1",
      description: "Description for announcement 1",
      prompt: "Read more",
      prompt_url: "/read-more",
      createdAt: "2023-01-01T00:00:00Z",
    },
  ];

  const announcementsWithoutPrompt: Announcement[] = [
    {
      id: 2,
      title: "Announcement 2",
      description: "Description for announcement 2",
      prompt: "Unused prompt",
      prompt_url: null,
      createdAt: "2023-01-02T12:00:00Z",
    },
  ];

  it("renders all announcement details (title, formatted date, and description) for announcements with prompt", () => {
    render(<AnnouncementsCard announcements={announcementsWithPrompt} />);
    const announcement = announcementsWithPrompt[0];

    // Check title
    expect(screen.getByText(announcement.title)).toBeInTheDocument();

    // Check formatted date
    const formattedDate = formatDate(new Date(announcement.createdAt));
    expect(screen.getByText(formattedDate)).toBeInTheDocument();

    // Check description
    expect(screen.getByText(announcement.description)).toBeInTheDocument();

    // Check prompt link
    const promptLink = screen.getByRole("link", { name: announcement.prompt! });
    expect(promptLink).toBeInTheDocument();
    expect(promptLink).toHaveAttribute("href", announcement.prompt_url);
  });

  it("renders announcement details without prompt link when prompt or prompt_url is missing", () => {
    render(<AnnouncementsCard announcements={announcementsWithoutPrompt} />);
    const announcement = announcementsWithoutPrompt[0];

    // Check title, date and description
    expect(screen.getByText(announcement.title)).toBeInTheDocument();
    const formattedDate = formatDate(new Date(announcement.createdAt));
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText(announcement.description)).toBeInTheDocument();

    // Ensure prompt link is not rendered
    expect(
      screen.queryByRole("link", { name: /unused prompt/i })
    ).not.toBeInTheDocument();
  });
});
