import { render, screen } from "@testing-library/react";
import Page from "./page";
import VerifyEmailForm from "@/components/auth/verify-email/form";
import { getSecureCookie, VERIFICATION_EMAIL_COOKIE } from "@/utils/cookies";
import { redirect } from "next/navigation";

jest.mock("@/components/auth/verify-email/form", () =>
  jest.fn(() => <div>Mocked VerifyEmailForm</div>)
);

jest.mock("@/utils/cookies", () => ({
  getSecureCookie: jest.fn(),
  VERIFICATION_EMAIL_COOKIE: "VER_EMAIL",
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("VerifyEmail Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to login if the verification email cookie is missing", async () => {
    (getSecureCookie as jest.Mock).mockResolvedValue("");

    // Render the page
    await Page({ searchParams: {} });

    expect(getSecureCookie).toHaveBeenCalledWith(VERIFICATION_EMAIL_COOKIE);
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("should render the VerifyEmailForm if the verification email cookie is present", async () => {
    const mockEmail = "test@example.com";
    (getSecureCookie as jest.Mock).mockResolvedValue(mockEmail);

    const searchParams = { token: "123456" };

    render(await Page({ searchParams }));

    expect(getSecureCookie).toHaveBeenCalledWith(VERIFICATION_EMAIL_COOKIE);
    expect(redirect).not.toHaveBeenCalled();
    expect(VerifyEmailForm).toHaveBeenCalledWith(
      { searchParams, email: mockEmail },
      undefined
    );
    expect(screen.getByText("Mocked VerifyEmailForm")).toBeInTheDocument();
  });
});
