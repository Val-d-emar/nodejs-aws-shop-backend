import { handler } from "../../src/handlers/catalogBatchProcess";
import {
  DynamoDBClient,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { mockClient } from "aws-sdk-client-mock";
import { SQSEvent, SQSRecord } from "aws-lambda";

const dynamoMock = mockClient(DynamoDBClient);
const snsMock = mockClient(SNSClient);

describe("catalogBatchProcess handler", () => {
  beforeEach(() => {
    dynamoMock.reset();
    snsMock.reset();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should process SQS records, save to DB and send SNS", async () => {
    dynamoMock.on(TransactWriteItemsCommand).resolves({});
    snsMock.on(PublishCommand).resolves({});

    const productData = {
      title: "Test Product",
      description: "Test Desc",
      price: 150,
      count: 10,
    };

    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(productData),
          messageId: "1",
          receiptHandle: "receipt1",
          attributes: {} as any,
          messageAttributes: {},
          md5OfBody: "",
          eventSource: "aws:sqs",
          eventSourceARN: "",
          awsRegion: "eu-north-1",
        } as SQSRecord,
      ],
    };

    await handler(event);

    expect(dynamoMock.calls()).toHaveLength(1);

    expect(snsMock.calls()).toHaveLength(1);

    const snsArgs = snsMock.call(0).args[0].input as any;
    expect(snsArgs.MessageAttributes.price.StringValue).toBe("150");
  });

  it("should skip invalid records", async () => {
    const invalidProductData = {
      title: "",
      price: "invalid",
    };

    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify(invalidProductData),
        } as SQSRecord,
      ],
    };

    await handler(event);

    expect(dynamoMock.calls()).toHaveLength(0);
    expect(snsMock.calls()).toHaveLength(0);
  });
});
