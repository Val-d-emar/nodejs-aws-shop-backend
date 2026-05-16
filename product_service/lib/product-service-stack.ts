import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

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

    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stocksTable.tableName,
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

    productsTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(createProduct);

    productsTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsList);

    productsTable.grantReadData(getProductsById);
    stocksTable.grantReadData(getProductsById);

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
