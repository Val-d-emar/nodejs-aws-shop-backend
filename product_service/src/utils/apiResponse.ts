export const formatJSONResponse = (statusCode: number, response: Record<string, unknown> | Array<unknown> | string) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*", // for CORS
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Credentials": true,
      "Content-Type": "application/json",
    },
    body: typeof response === "string" ? response : JSON.stringify(response),
  };
};
