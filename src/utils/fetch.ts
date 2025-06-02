export const strapiFetch = async (strapiUrl: string) => {
  const strapiResp = await fetch(strapiUrl, {
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
