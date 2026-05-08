import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from "../utils/apiResponse";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Incoming request: getProductsById", event.pathParameters);
  try {
    const { productId } = event.pathParameters || {};

    if (!productId) {
      return formatJSONResponse(400, { message: "Product ID is missing" });
    }

    const [productResult, stockResult] = await Promise.all([
      docClient.send(
        new GetCommand({
          TableName: process.env.PRODUCTS_TABLE,
          Key: { id: productId },
        }),
      ),
      docClient.send(
        new GetCommand({
          TableName: process.env.STOCKS_TABLE,
          Key: { product_id: productId },
        }),
      ),
    ]);

    if (!productResult.Item) {
      return formatJSONResponse(404, { message: "Product not found" });
    }

    const product = {
      ...productResult.Item,
      count: stockResult.Item ? stockResult.Item.count : 0,
    };

    return formatJSONResponse(200, product);
  } catch (error) {
    console.error("Error in getProductsById:", error);
    return formatJSONResponse(500, { message: "Internal server error" });
  }
};
