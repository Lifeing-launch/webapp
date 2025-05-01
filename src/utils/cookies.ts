import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const VERIFICATION_EMAIL_COOKIE = "VER_EMAIL";
export const VERIFICATION_EMAIL_COOKIE_AGE = 1440; // 24 hours

export const setSecureCookie = async (
  key: string,
  data: string,
  options: Partial<ResponseCookie> = {}
) => {
  const cookieStore = await cookies();
  cookieStore.set(key, data, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    ...options,
  });
};

export const getSecureCookie = async (key: string): Promise<string> => {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value || "";
};

export const deleteSecureCookie = async (key: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(key);
};
