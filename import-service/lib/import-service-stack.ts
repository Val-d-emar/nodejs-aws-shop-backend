import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketName = "rs-shop-import-val-d-emar-2026";
    const importBucket = s3.Bucket.fromBucketName(
      this,
      "ImportBucket",
      bucketName,
    );

    const importProductsFile = new NodejsFunction(this, "ImportProductsFile", {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, "../src/handlers/importProductsFile.ts"),
      handler: "handler",
      environment: {
        UPLOAD_BUCKET: bucketName,
      },
    });

    const importFileParser = new NodejsFunction(this, "ImportFileParser", {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, "../src/handlers/importFileParser.ts"),
      handler: "handler",
      environment: {
        UPLOAD_BUCKET: bucketName,
      },
    });

    importBucket.grantWrite(importProductsFile);
    importBucket.grantReadWrite(importFileParser);
    importBucket.grantDelete(importFileParser);    

    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: "uploaded/" },
    );

    const api = new apigateway.RestApi(this, "ImportApi", {
      restApiName: "Import Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
      },
      binaryMediaTypes: ["multipart/form-data"],
    });

    const importResource = api.root.addResource("import");
    importResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(importProductsFile),
      {
        requestParameters: {
          "method.request.querystring.name": true,
        },
      },
    );
  }
}
