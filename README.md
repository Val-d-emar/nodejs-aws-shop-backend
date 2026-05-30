## Task 6: SQS & SNS, Async Microservices Communication

### What was done:
- [x] Created an SQS queue `catalogItemsQueue` in the Product Service stack.
- [x] Implemented the `catalogBatchProcess` lambda function triggered by SQS events (configured with `batchSize: 5`).
- [x] Updated the `importFileParser` lambda in the Import Service to send parsed CSV records directly to the SQS queue instead of logging them.
- [x] Implemented transaction-based product creation (writing to `products` and `stocks` DynamoDB tables simultaneously).
- [x] Created an SNS Topic `createProductTopic` with an Email subscription.
- [x] The `catalogBatchProcess` lambda successfully publishes an event to the SNS topic upon product creation.
- [x] Implemented Cross-Stack references (Exports/Imports) for SQS URL and ARN to maintain dynamic and secure infrastructure.

### Additional scope (Optional tasks):
- [x] **+15** - `catalogBatchProcess` lambda is fully covered by unit tests (using AWS SDK mocks). Test output is kept clean.
- [x] **+15** - Configured a **Filter Policy** for the SNS `createProductTopic`. Email notifications are distributed only if the product price is >= 100 (implemented via `MessageAttributes`).

## Links:

- **API Endpoint:** [https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products](https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products)
- **Frontend App (CloudFront):** [https://dhoyc6sbijzzm.cloudfront.net](https://dhoyc6sbijzzm.cloudfront.net)
- **FE PR:** [https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/5](https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/5)
- **Swagger file 1:** [product_service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-6/product_service/doc/openapi.yaml)
- **Swagger file 2:** [import-service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-6/import-service/doc/openapi.yaml)
- **Import Service API:** [https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import](https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import)
