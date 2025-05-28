import { strapiFetch } from "./fetch";

describe("strapiFetch", () => {
  const dummyToken = "dummy_token";

  beforeEach(() => {
    process.env.STRAPI_API_TOKEN = dummyToken;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns data when response is ok", async () => {
    const dummyUrl = new URL("https://example.com/api");
    const dummyData = { id: 1, name: "Test" };
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: dummyData }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await strapiFetch(dummyUrl);

    expect(global.fetch).toHaveBeenCalledWith(dummyUrl.toString(), {
      headers: { Authorization: `Bearer ${dummyToken}` },
    });
    expect(result).toEqual(dummyData);
  });

  it("throws an error when response is not ok", async () => {
    const dummyUrl = new URL("https://example.com/api");
    const errorMessage = "An error occurred";
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({ error: { message: errorMessage } }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(strapiFetch(dummyUrl)).rejects.toThrow(errorMessage);
    expect(global.fetch).toHaveBeenCalledWith(dummyUrl.toString(), {
      headers: { Authorization: `Bearer ${dummyToken}` },
    });
  });
});
