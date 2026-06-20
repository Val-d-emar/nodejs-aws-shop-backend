import Fastify from "fastify";
import cors from "@fastify/cors";
import axios, { AxiosError } from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({
  logger: true,
});

const PORT = process.env.PORT || 3000;

let productsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
});

fastify.route({
  method: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  url: "/*",
  handler: async (request, reply) => {
    const url = request.url;

    const parts = url.split("/").filter(Boolean);
    const recipient = parts[0];

    if (!recipient) {
      return reply
        .status(400)
        .send("Bad Request: Missing recipient service name.");
    }

    const recipientUrl = process.env[recipient];

    if (!recipientUrl) {
      return reply
        .status(502)
        .send("Cannot process request: Recipient service not found.");
    }

    const remainingPath = "/" + parts.slice(1).join("/");
    const targetUrl = `${recipientUrl}${remainingPath}`;

    const isGetProductsList =
      request.method === "GET" &&
      recipient === "product" &&
      remainingPath === "/products";

    if (
      isGetProductsList &&
      productsCache &&
      Date.now() - productsCache.timestamp < CACHE_TTL
    ) {
      fastify.log.info("Returning getProductsList response from cache");
      return reply.status(200).send(productsCache.data);
    }

    const headers = { ...request.headers };
    delete headers.host;

    try {
      fastify.log.info(`Forwarding request to: ${targetUrl}`);

      const response = await axios({
        method: request.method,
        url: targetUrl,
        headers: headers as any,
        data: request.body,
      });

      if (isGetProductsList && response.status === 200) {
        fastify.log.info("Caching getProductsList response");
        productsCache = {
          data: response.data,
          timestamp: Date.now(),
        };
      }

      return reply.status(response.status).send(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        fastify.log.error(
          `Error from recipient service: ${axiosError.response.status}`,
        );
        return reply
          .status(axiosError.response.status)
          .send(axiosError.response.data);
      }

      fastify.log.error(axiosError, `Connection error to: ${targetUrl}`);
      return reply
        .status(500)
        .send({ message: "Internal server error", error: axiosError.message });
    }
  },
});

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: "0.0.0.0" });
    console.log(`BFF Service is running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err as Error);
    process.exit(1);
  }
};

start();
