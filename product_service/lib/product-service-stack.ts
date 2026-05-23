import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as dotenv from "dotenv";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";

dotenv.config();

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = dynamodb.Table.fromTableName(
      this,
      "ProductsTable",
      "products",
    );
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      "StocksTable",
      "stocks",
    );

    const createProductTopic = new sns.Topic(this, "CreateProductTopic", {
      topicName: "createProductTopic",
    });

    const adminEmail = process.env.ADMIN_EMAIL || "example@example.com";

    createProductTopic.addSubscription(
      new subs.EmailSubscription(adminEmail, {
        filterPolicy: {
          price: sns.SubscriptionFilter.numericFilter({
            greaterThanOrEqualTo: 100,
          }),
        },
      }),
    );

    const catalogItemsQueue = new sqs.Queue(this, "CatalogItemsQueue", {
      queueName: "catalogItemsQueue",
    });

    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_24_X,
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stocksTable.tableName,
        SNS_ARN: createProductTopic.topicArn,
      },
    };

    const getProductsList = new NodejsFunction(this, "GetProductsList", {
      ...lambdaProps,
      entry: path.join(__dirname, "../src/handlers/getProductsList.ts"),
      handler: "handler",
    });

    const getProductsById = new NodejsFunction(this, "GetProductsById", {
      ...lambdaProps,
      entry: path.join(__dirname, "../src/handlers/getProductsById.ts"),
      handler: "handler",
    });

    const createProduct = new NodejsFunction(this, "CreateProduct", {
      ...lambdaProps,
      entry: path.join(__dirname, "../src/handlers/createProduct.ts"),
    });

    const catalogBatchProcess = new NodejsFunction(
      this,
      "CatalogBatchProcess",
      {
        ...lambdaProps,
        entry: path.join(__dirname, "../src/handlers/catalogBatchProcess.ts"),
        handler: "handler",
      },
    );

    productsTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(createProduct);

    productsTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsList);

    productsTable.grantReadData(getProductsById);
    stocksTable.grantReadData(getProductsById);

    productsTable.grantWriteData(catalogBatchProcess);
    stocksTable.grantWriteData(catalogBatchProcess);
    createProductTopic.grantPublish(catalogBatchProcess);

    catalogBatchProcess.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      }),
    );

    new cdk.CfnOutput(this, "CatalogItemsQueueUrl", {
      value: catalogItemsQueue.queueUrl,
      exportName: "CatalogItemsQueueUrl",
    });

    new cdk.CfnOutput(this, "CatalogItemsQueueArn", {
      value: catalogItemsQueue.queueArn,
      exportName: "CatalogItemsQueueArn",
    });

    const api = new apigateway.RestApi(this, "ProductsApi", {
      restApiName: "Product Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });

    const products = api.root.addResource("products");

    products.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsList),
    );

    const product = products.addResource("{productId}");

    product.addMethod("GET", new apigateway.LambdaIntegration(getProductsById));
    products.addMethod("POST", new apigateway.LambdaIntegration(createProduct));
  }
}
