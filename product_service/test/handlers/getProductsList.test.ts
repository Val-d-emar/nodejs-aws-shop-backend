import { handler } from "../../src/handlers/getProductsList";
import { products } from "../../src/mocks/products";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const ddbMock = mockClient(DynamoDBDocumentClient);

describe("getProductsList handler", () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  })
  it("should return 200 and all products", async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: products,
    });

    const result = await handler({} as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(products);
  });
});
