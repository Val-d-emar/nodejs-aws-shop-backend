import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const products = [
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    title: "Product One",
    description: "Description of Product One",
    price: 24,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80ab",
    title: "Product Two",
    description: "Description of Product Two",
    price: 15,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80ac",
    title: "Product Three",
    description: "Description of Product Three",
    price: 23,
  },
];

const stocks = [
  { product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa", count: 4 },
  { product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80ab", count: 6 },
  { product_id: "7567ec4b-b10c-48c5-9345-fc73c48a80ac", count: 7 },
];

const fill = async () => {
  try {
    console.log("Filling out the table products...");
    for (const product of products) {
      await docClient.send(new PutCommand({ TableName: "products", Item: product }));
    }

    console.log("Filling out the table stocks...");
    for (const stock of stocks) {
      await docClient.send(new PutCommand({ TableName: "stocks", Item: stock }));
    }
    console.log("Successfully completed!");
  } catch (err) {
    console.error("Error during filling:", err);
  }
};

fill();

