import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const testCredentials = process.env.TEST_CREDENTIALS || '{}';

    const basicAuthorizer = new NodejsFunction(this, 'BasicAuthorizer', {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, '../src/handlers/basicAuthorizer.ts'),
      handler: 'handler',
      environment: {
        TEST_CREDENTIALS: testCredentials,
      },
    });

    new cdk.CfnOutput(this, 'BasicAuthorizerArn', {
      value: basicAuthorizer.functionArn,
      exportName: 'BasicAuthorizerArn',
    });
  }

}
