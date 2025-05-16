import { datetimeIsWithinInterval, formatDate, formatTime } from "./datetime";

describe("datetimeIsWithinInterval", () => {
  it("returns true when the dateTime is within the interval", () => {
    const now = new Date();
    const dateTime = new Date(now.getTime() - 5 * 60 * 1000).toISOString(); // 5 minutes ago
    expect(datetimeIsWithinInterval(dateTime, 10)).toBe(true);
  });

  it("returns false when the dateTime is outside the interval", () => {
    const now = new Date();
    const dateTime = new Date(now.getTime() - 15 * 60 * 1000).toISOString(); // 15 minutes ago
    expect(datetimeIsWithinInterval(dateTime, 10)).toBe(false);
  });

  it("handles future dates correctly", () => {
    const now = new Date();
    const dateTime = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 minutes in the future
    expect(datetimeIsWithinInterval(dateTime, 10)).toBe(true);
  });

  it("returns false for invalid dateTime input", () => {
    expect(datetimeIsWithinInterval("invalid-date", 10)).toBe(false);
  });

  it("returns true when the dateTime is exactly on the interval boundary", () => {
    const now = new Date();
    const dateTime = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // exactly 10 minutes ago
    expect(datetimeIsWithinInterval(dateTime, 10)).toBe(true);
  });
});

describe("formatDate", () => {
  it("formats a date correctly in 'Month Day, Year' format", () => {
    const date = new Date("2023-01-15T00:00:00Z");
    expect(formatDate(date)).toBe("January 15, 2023");
  });

  it("handles invalid date input gracefully", () => {
    const invalidDate = new Date("invalid-date");
    expect(formatDate(invalidDate)).toBe("Invalid Date");
  });
});

describe("formatTime", () => {
  it("formats a time correctly in 'Hour:Minute AM/PM' format", () => {
    const date = new Date("2023-01-15T13:45:00Z");
    expect(formatTime(date)).toBe("1:45 PM");
  });

  it("handles midnight correctly", () => {
    const date = new Date("2023-01-15T00:00:00Z");
    expect(formatTime(date)).toBe("12:00 AM");
  });

  it("handles invalid date input gracefully", () => {
    const invalidDate = new Date("invalid-date");
    expect(formatTime(invalidDate)).toBe("Invalid Date");
  });
});
