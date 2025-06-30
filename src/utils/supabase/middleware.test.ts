import { updateSession } from "./middleware";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

jest.mock("@supabase/ssr");
jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({ cookies: { set: jest.fn() } })),
    redirect: jest.fn(),
  },
}));

describe("updateSession", () => {
  let mockSupabase: any;
  let mockRequest: any;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);

    mockRequest = {
      cookies: {
        getAll: jest.fn(() => []),
        set: jest.fn(),
      },
      nextUrl: {
        pathname: "",
        origin: "http://localhost",
      },
      url: "http://localhost",
    };

    jest.clearAllMocks();
  });

  it("should redirect to login if no user and accessing a protected path", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockRequest.nextUrl.pathname = "/protected";

    const response = await updateSession(mockRequest as unknown as NextRequest);

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      `${mockRequest.nextUrl.origin}/login`
    );
    expect(response).toEqual(NextResponse.redirect());
  });

  it("should redirect to dashboard if user is logged in and accessing an auth path", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "123" } },
    });
    mockRequest.nextUrl.pathname = "/login";

    const response = await updateSession(mockRequest as unknown as NextRequest);

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      `${mockRequest.nextUrl.origin}/dashboard`
    );
    expect(response).toBeUndefined();
  });

  it("should allow access to protected pages if user is logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "123" } },
    });
    mockSupabase.single.mockResolvedValueOnce({
      data: true,
    }); // mock subscription
    mockRequest.nextUrl.pathname = "/protected";

    const response = await updateSession(mockRequest as unknown as NextRequest);

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response).toEqual(expect.any(Object));
  });

  it("should allow access to auth pages if no user is logged in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockRequest.nextUrl.pathname = "/signup";

    const response = await updateSession(mockRequest as unknown as NextRequest);

    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(response).toEqual(expect.any(Object));
  });
});
