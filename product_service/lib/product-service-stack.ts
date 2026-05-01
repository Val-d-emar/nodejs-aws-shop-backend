import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsList = new NodejsFunction(this, "GetProductsList", {
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        PRODUCT_AWS_REGION: cdk.Stack.of(this).region,
      },
      entry: path.join(__dirname, "../src/handlers/getProductsList.ts"),
      handler: "handler",
    });

    const getProductsById = new NodejsFunction(this, "GetProductsById", {
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        PRODUCT_AWS_REGION: cdk.Stack.of(this).region,
      },
      entry: path.join(__dirname, "../src/handlers/getProductsById.ts"),
      handler: "handler",
    });

    const api = new apigateway.RestApi(this, "ProductsApi", {
      restApiName: "Product Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const products = api.root.addResource("products");

    products.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsList),
    );

    const product = products.addResource("{productId}");

    product.addMethod("GET", new apigateway.LambdaIntegration(getProductsById));
  }
}
