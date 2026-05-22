import { SQSEvent } from 'aws-lambda';
import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { randomUUID } from 'crypto';

const dynamoClient = new DynamoDBClient({});
const snsClient = new SNSClient({});

export const handler = async (event: SQSEvent): Promise<void> => {
  console.log('Incoming SQS Event:', JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const productData = JSON.parse(record.body);
      const { title, description, price, count } = productData;

      const parsedPrice = Number(price);
      const parsedCount = Number(count);

      if (!title || !description || isNaN(parsedPrice) || isNaN(parsedCount)) {
        console.error(`Invalid product data skipped: ${record.body}`);
        continue;
      }

      const id = randomUUID();

      const transaction = new TransactWriteItemsCommand({
        TransactItems: [
          {
            Put: {
              TableName: process.env.PRODUCTS_TABLE,
              Item: {
                id: { S: id },
                title: { S: title },
                description: { S: description },
                price: { N: parsedPrice.toString() },
              },
            },
          },
          {
            Put: {
              TableName: process.env.STOCKS_TABLE,
              Item: {
                product_id: { S: id },
                count: { N: parsedCount.toString() },
              },
            },
          },
        ],
      });

      await dynamoClient.send(transaction);
      console.log(`Product created successfully: ${id} (${title})`);

      const publishCommand = new PublishCommand({
        Subject: 'New Product Added to Catalog',
        Message: `A new product "${title}" was successfully added to the database.\nDescription: ${description}\nPrice: $${parsedPrice}\nStock: ${parsedCount}`,
        TopicArn: process.env.SNS_ARN,
        MessageAttributes: {
          price: {
            DataType: 'Number',
            StringValue: parsedPrice.toString(),
          }
        }
      });

      await snsClient.send(publishCommand);
      console.log(`SNS message sent for product: ${title}`);

    } catch (error) {
      console.error('Error processing SQS record:', error);
    }
  }
};
