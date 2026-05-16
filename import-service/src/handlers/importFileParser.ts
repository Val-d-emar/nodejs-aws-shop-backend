import { S3Event } from "aws-lambda";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import csv from "csv-parser";
import { Readable } from "stream";

const s3Client = new S3Client({});

export const handler = async (event: S3Event): Promise<void> => {
  console.log("Incoming S3 Event:", JSON.stringify(event));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing file: ${key} from bucket: ${bucket}`);

    try {
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const { Body } = await s3Client.send(getCommand);

      if (Body instanceof Readable) {
        await new Promise<void>((resolve, reject) => {
          Body.pipe(csv())
            .on("data", (data: any) => {
              console.log("Parsed record:", data);
            })
            .on("error", (error: Error) => {
              console.error("Error parsing CSV:", error);
              reject(error);
            })
            .on("end", () => {
              console.log("CSV parsing finished.");
              resolve();
            });
        });

        const parsedKey = key.replace("uploaded/", "parsed/");

        console.log(`Copying file to ${parsedKey}...`);
        await s3Client.send(
          new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${key}`,
            Key: parsedKey,
          }),
        );

        console.log(`Deleting file from ${key}...`);
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );

        console.log("File successfully moved!");
      }
    } catch (error) {
      console.error(
        `Error processing object ${key} from bucket ${bucket}:`,
        error,
      );
      throw error;
    }
  }
};
