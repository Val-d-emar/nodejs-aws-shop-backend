import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { formatJSONResponse } from "../utils/apiResponse";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Incoming request: createProduct");
  console.log(`Incoming method + path: ${event.httpMethod} ${event.path}`);
  console.log("Request body:", event.body);
  console.log("Full event:", JSON.stringify(event));
  
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { title, description, price, count, image } = body || {};

    if (
      !title ||
      !description ||
      typeof price !== "number" ||
      typeof count !== "number"
    ) {
      return formatJSONResponse(400, {
        message:
          "Invalid product data. title, description, price (number) and count (number) are required.",
      });
    }
    const finalImage =
      image ||
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop";

    const id = body.id || randomUUID();

    const transaction = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.PRODUCTS_TABLE,
            Item: {
              id: { S: id },
              title: { S: title },
              description: { S: description },
              price: { N: price.toString() },
              image: { S: finalImage },
            },
          },
        },
        {
          Put: {
            TableName: process.env.STOCKS_TABLE,
            Item: {
              product_id: { S: id },
              count: { N: count.toString() },
            },
          },
        },
      ],
    });

    await docClient.send(transaction);

    return formatJSONResponse(201, {
      id,
      title,
      description,
      price,
      count,
      image: finalImage,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    return formatJSONResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
