import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from "../utils/apiResponse";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Incoming request: getProductsList");
  console.log(`Incoming method + path: ${event.httpMethod} ${event.path}`);
  console.log("Full event:", JSON.stringify(event)); 

  try {
    const [productsResult, stocksResult] = await Promise.all([
      docClient.send(
        new ScanCommand({ TableName: process.env.PRODUCTS_TABLE }),
      ),
      docClient.send(new ScanCommand({ TableName: process.env.STOCKS_TABLE })),
    ]);

    const products = productsResult.Items || [];
    const stocks = stocksResult.Items || [];

    const joinedProducts = products.map((product) => {
      const stock = stocks.find((s) => s.product_id === product.id);
      return {
        ...product,
        count: stock ? stock.count : 0,
      };
    });

    return formatJSONResponse(200, joinedProducts);
  } catch (error) {
    console.error("Error in getProductsList:", error);
    return formatJSONResponse(500, {
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
