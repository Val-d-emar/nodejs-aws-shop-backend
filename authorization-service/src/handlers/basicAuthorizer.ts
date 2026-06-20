import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
  StatementEffect,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
): Promise<APIGatewayAuthorizerResult> => {
  console.log("Event:", JSON.stringify(event));

  if (event.type !== "TOKEN" || !event.authorizationToken) {
    throw new Error("Unauthorized");
  }

  try {
    const encodedCreds = event.authorizationToken.split(" ")[1];
    if (!encodedCreds) {
      throw new Error("Unauthorized");
    }

    const plainCreds = Buffer.from(encodedCreds, "base64").toString("utf-8");
    const [username, password] = plainCreds.split(":");

    console.log(`Username decoded: ${username}`);

    const storedCredentialsString = process.env.TEST_CREDENTIALS;
    if (!storedCredentialsString) {
      console.error("Environment variable TEST_CREDENTIALS is not set.");
      throw new Error("Unauthorized");
    }

    let storedCredentials: Record<string, string> = {};
    try {
      storedCredentials = JSON.parse(storedCredentialsString);
    } catch (parseError) {
      console.error("Failed to parse TEST_CREDENTIALS JSON:", parseError);
      throw new Error("Unauthorized");
    }

    const storedUserPassword = storedCredentials[username];

    const effect: StatementEffect =
      storedUserPassword && storedUserPassword === password ? "Allow" : "Deny";

    return generatePolicy(encodedCreds, effect, event.methodArn);
  } catch (error) {
    console.error("Error in authorizer:", error);
    throw new Error("Unauthorized");
  }
};

const generatePolicy = (
  principalId: string,
  effect: StatementEffect,
  resource: string,
): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
