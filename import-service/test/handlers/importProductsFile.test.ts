import { handler } from "../../src/handlers/importProductsFile";
import { S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Mock = mockClient(S3Client);

jest.mock("@aws-sdk/s3-request-presigner");

describe("importProductsFile handler", () => {
  beforeEach(() => {
    s3Mock.reset();
    (getSignedUrl as jest.Mock).mockResolvedValue(
      "https://mock-signed-url.com",
    );
    process.env.UPLOAD_BUCKET = "test-bucket";
  });

  it("should return 200 and signed URL", async () => {
    const event = {
      queryStringParameters: { name: "test.csv" },
    } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe("https://mock-signed-url.com");
  });

  it("should return 400 if name is missing", async () => {
    const event = { queryStringParameters: {} } as any;
    const result = await handler(event);
    expect(result.statusCode).toBe(400);
  });
});
