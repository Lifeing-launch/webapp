import { render } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/browser";
import ClientAuthListener from "./client-auth-listener";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/utils/supabase/browser", () => ({
  createClient: jest.fn(),
}));

describe("ClientAuthListener", () => {
  it("subscribes to auth state changes on mount", () => {
    const mockRefresh = jest.fn();
    const mockUnsubscribe = jest.fn();
    const mockOnAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));

    (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
    (createClient as jest.Mock).mockReturnValue({
      auth: { onAuthStateChange: mockOnAuthStateChange },
    });

    render(<ClientAuthListener />);

    expect(createClient).toHaveBeenCalled();
    expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls router.refresh on SIGNED_IN or SIGNED_OUT events", () => {
    const mockRefresh = jest.fn();
    const mockOnAuthStateChange = jest.fn((callback) => {
      callback("SIGNED_IN");
      callback("SIGNED_OUT");
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
    (createClient as jest.Mock).mockReturnValue({
      auth: { onAuthStateChange: mockOnAuthStateChange },
    });

    render(<ClientAuthListener />);

    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes from auth state changes on unmount", () => {
    const mockUnsubscribe = jest.fn();
    const mockOnAuthStateChange = jest.fn(() => ({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    }));

    (useRouter as jest.Mock).mockReturnValue({ refresh: jest.fn() });
    (createClient as jest.Mock).mockReturnValue({
      auth: { onAuthStateChange: mockOnAuthStateChange },
    });

    const { unmount } = render(<ClientAuthListener />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
