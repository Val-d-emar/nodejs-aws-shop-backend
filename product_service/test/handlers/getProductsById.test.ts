import { handler } from "../../src/handlers/getProductsById";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("getProductsById handler", () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  })
  it("should return 200 and product if found", async () => {
    ddbMock.on(GetCommand).resolves({
      Item: {
        id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
        title: "Product One",
        price: 24,
        count: 4,
      },
    });
    const event = {
      pathParameters: { productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa" },
    };
    const result = await handler(event as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).title).toBe("Product One");
  });

  it("should return 404 if product not found", async () => {
    ddbMock.on(GetCommand).resolves({
      Item: undefined,
    });
    const event = {
      pathParameters: { productId: "non-existent-id" },
    };
    const result = await handler(event as any);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe("Product not found");
  });
});
