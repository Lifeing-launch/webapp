import { render } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/browser";
import ClientAuthListener from "./client-auth-listener";

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

describe("ClientAuthListener", () => {
  it("subscribes to auth state changes on mount", () => {
    const mockInvalidateQueries = jest.fn();
    const mockUnsubscribe = jest.fn();
    const mockOnAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (createClient as jest.Mock).mockReturnValue({
      auth: { onAuthStateChange: mockOnAuthStateChange },
    });

    render(<ClientAuthListener />);

    expect(createClient).toHaveBeenCalled();
    expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls queryClient.invalidateQueries on SIGNED_IN or SIGNED_OUT events", () => {
    const mockInvalidateQueries = jest.fn();
    const mockOnAuthStateChange = jest.fn((callback) => {
      callback("SIGNED_IN");
      callback("SIGNED_OUT");
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (createClient as jest.Mock).mockReturnValue({
      auth: { onAuthStateChange: mockOnAuthStateChange },
    });

    render(<ClientAuthListener />);

    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes from auth state changes on unmount", () => {
    const mockUnsubscribe = jest.fn();
    const mockOnAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: jest.fn(),
    });
    (createClient as jest.Mock).mockReturnValue({
      auth: { onAuthStateChange: mockOnAuthStateChange },
    });

    const { unmount } = render(<ClientAuthListener />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
