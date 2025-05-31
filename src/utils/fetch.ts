export const strapiFetch = async (strapiUrl: URL) => {
  const strapiResp = await fetch(strapiUrl.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    },
  });

  const strapiData = await strapiResp.json();
  if (!strapiResp.ok) {
    throw new Error(strapiData?.error?.message);
  }
  return strapiData;
};
