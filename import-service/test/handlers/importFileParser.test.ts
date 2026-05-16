import { handler } from "../../src/handlers/importFileParser";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";
import { Readable } from "stream";

const s3Mock = mockClient(S3Client);

describe("importFileParser handler", () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  it("should parse S3 object and move it", async () => {
    const csvContent = "title,description,price,count\nTest,Desc,100,5";
    const stream = new Readable();
    stream.push(csvContent);
    stream.push(null);
    const sdkStream = sdkStreamMixin(stream);

    s3Mock.on(GetObjectCommand).resolves({
      Body: sdkStream,
    });
    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    const event = {
      Records: [
        {
          s3: {
            bucket: { name: "test-bucket" },
            object: { key: "uploaded/test.csv" },
          },
        },
      ],
    } as any;

    await handler(event);

    expect(s3Mock.calls()).toHaveLength(3); // Get, Copy, Delete
    expect(s3Mock.call(1).args[0].input).toMatchObject({
      Key: "parsed/test.csv",
    });
  });
});
