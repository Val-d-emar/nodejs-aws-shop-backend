import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { formatJSONResponse } from "../utils/apiResponse";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log(`Incoming request: ${event.httpMethod} ${event.path}`);

  try {
    const { productId } = event.pathParameters || {};

    if (!productId) {
      return formatJSONResponse(400, { message: "Product ID is missing" });
    }

    const transaction = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Delete: {
            TableName: process.env.PRODUCTS_TABLE,
            Key: { id: { S: productId } },
          },
        },
        {
          Delete: {
            TableName: process.env.STOCKS_TABLE,
            Key: { product_id: { S: productId } },
          },
        },
      ],
    });

    await docClient.send(transaction);
    console.log(`Product ${productId} successfully deleted.`);

    return formatJSONResponse(200, {
      message: `Product ${productId} deleted.`,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return formatJSONResponse(500, { message: "Internal server error" });
  }
};
