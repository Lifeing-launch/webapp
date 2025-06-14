import { cookies } from "next/headers";
import { getSiteUrl } from "./urls";

export const strapiFetch = async (strapiUrl: string) => {
  const strapiResp = await fetch(strapiUrl, {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  });

  let strapiData;
  try {
    strapiData = await strapiResp.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response from Strapi: ${error}`);
  }

  if (!strapiResp.ok) {
    const errorMsg = strapiData?.error?.message || "Unknown error occurred";
    throw new Error(errorMsg);
  }
  return strapiData;
};

export const serverFetch = async (
  url: string,
  options: RequestInit = {},
  isFullUrl = false
) => {
  const endpoint = isFullUrl ? url : `${getSiteUrl()}${url}`;
  const defaultHeaders = {
    cookie: (await cookies()).toString(),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    cache: "no-cache",
  });

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response from ${endpoint}: ${error}`);
  }

  if (!response.ok) {
    const errorMsg =
      data?.error?.message || `${response.status}-${response.statusText}`;
    throw new Error(
      `An error occurred during the request to ${endpoint}: ${errorMsg}`
    );
  }

  return data;
};
