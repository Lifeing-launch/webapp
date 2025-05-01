import { cookies } from "next/headers";
import {
  setSecureCookie,
  getSecureCookie,
  deleteSecureCookie,
} from "./cookies";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("Cookies Utility Functions", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    jest.clearAllMocks();
  });

  describe("setSecureCookie", () => {
    it("should set a secure cookie with the provided key, data, and options", async () => {
      const key = "testKey";
      const data = "testData";
      const options = { maxAge: 3600 };

      await setSecureCookie(key, data, options);

      expect(mockCookieStore.set).toHaveBeenCalledWith(key, data, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        ...options,
      });
    });

    it("should set a secure cookie with default options if none are provided", async () => {
      const key = "testKey";
      const data = "testData";

      await setSecureCookie(key, data);

      expect(mockCookieStore.set).toHaveBeenCalledWith(key, data, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
    });
  });

  describe("getSecureCookie", () => {
    it("should return the value of the cookie if it exists", async () => {
      const key = "testKey";
      const value = "testValue";

      mockCookieStore.get.mockReturnValue({ value });

      const result = await getSecureCookie(key);

      expect(mockCookieStore.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it("should return an empty string if the cookie does not exist", async () => {
      const key = "nonExistentKey";

      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getSecureCookie(key);

      expect(mockCookieStore.get).toHaveBeenCalledWith(key);
      expect(result).toBe("");
    });
  });

  describe("deleteSecureCookie", () => {
    it("should delete the cookie with the provided key", async () => {
      const key = "testKey";

      await deleteSecureCookie(key);

      expect(mockCookieStore.delete).toHaveBeenCalledWith(key);
    });
  });
});
