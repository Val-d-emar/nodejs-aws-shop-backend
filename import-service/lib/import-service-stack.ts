import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as path from "path";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucketName = "rs-shop-import-val-d-emar-2026";
    const importBucket = s3.Bucket.fromBucketName(
      this,
      "ImportBucket",
      bucketName,
    );

    const queueUrl = cdk.Fn.importValue("CatalogItemsQueueUrl");
    const queueArn = cdk.Fn.importValue("CatalogItemsQueueArn");

    const catalogQueue = sqs.Queue.fromQueueAttributes(
      this,
      "CatalogItemsQueue",
      {
        queueUrl,
        queueArn,
      },
    );

    const importProductsFile = new NodejsFunction(this, "ImportProductsFile", {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, "../src/handlers/importProductsFile.ts"),
      handler: "handler",
      environment: {
        UPLOAD_BUCKET: bucketName,
      },
    });

    importBucket.grantWrite(importProductsFile);

    const importFileParser = new NodejsFunction(this, "ImportFileParser", {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, "../src/handlers/importFileParser.ts"),
      handler: "handler",
      environment: {
        UPLOAD_BUCKET: bucketName,
        SQS_URL: queueUrl,
      },
    });

    importBucket.grantReadWrite(importFileParser);
    importBucket.grantDelete(importFileParser);
    catalogQueue.grantSendMessages(importFileParser);

    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParser),
      { prefix: "uploaded/" },
    );

    const authorizerArn = cdk.Fn.importValue("BasicAuthorizerArn");

    const basicAuthorizerLambda = lambda.Function.fromFunctionArn(
      this,
      "BasicAuthorizerLambda",
      authorizerArn,
    );

    const authorizer = new apigateway.TokenAuthorizer(this, "BasicAuthorizer", {
      handler: basicAuthorizerLambda,
      identitySource: apigateway.IdentitySource.header("Authorization"),
    });

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

    api.addGatewayResponse("GatewayResponseUnauthorized", {
      type: apigateway.ResponseType.UNAUTHORIZED,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
      },
    });
    api.addGatewayResponse("GatewayResponseAccessDenied", {
      type: apigateway.ResponseType.ACCESS_DENIED,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
      },
    });

    const importResource = api.root.addResource("import");
    importResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(importProductsFile),
      {
        requestParameters: {
          "method.request.querystring.name": true,
        },
        authorizer: authorizer,
      },
    );
  }
}
