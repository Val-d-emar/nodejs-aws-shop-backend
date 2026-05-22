# Task 6 (SQS & SNS, Async Microservices Communication)

## Links

- **API Endpoint:** [https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products](https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products)
- **Frontend App (CloudFront):** [https://dhoyc6sbijzzm.cloudfront.net](https://dhoyc6sbijzzm.cloudfront.net)
- **Frontend PR:** [https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/4](https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/4)
- **Swagger file:** [import-service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-5/import-service/doc/openapi.yaml)
- **Import Service API:** [https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import](https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import)

## Tasks

---

### Task 6.1

1. Create a lambda function called `catalogBatchProcess` under the Product Service which will be triggered by an SQS event.
2. Create an SQS queue called `catalogItemsQueue`, in the AWS CDK Stack.
3. Configure the SQS to trigger lambda `catalogBatchProcess` with _5 messages_ at once via `batchSize` property.
4. The lambda function should iterate over all SQS messages and create corresponding products in the products table.

### Task 6.2

1. Update the `importFileParser` lambda function in the Import Service to send each CSV record into SQS.
2. It should no longer log entries from the _readable stream_ to CloudWatch.

### Task 6.3

1. Create an SNS topic `createProductTopic` and email subscription in the AWS CDK Stack of the Product Service.
2. Create a subscription for this SNS topic with an `email` endpoint type with your own email in there.
3. Update the `catalogBatchProcess` lambda function in the Product Service to send an event to the SNS topic once it creates products.

### Task 6.4

1. Commit all your work to separate branch (e.g. `task-6` from the latest `master`) in your own repository.
2. Create a pull request to the `master` branch.
3. Submit link to the pull request to Crosscheck page in [RS App](https://app.rs.school).

## Evaluation criteria (70 points for covering all criteria)

---

Reviewers should verify the lambda functions, SQS and SNS topic and subscription in PR.

- AWS CDK Stack contains configuration for `catalogBatchProcess` function
- AWS CDK Stack contains policies to allow lambda `catalogBatchProcess` function to interact with SNS and SQS
- AWS CDK Stack contains configuration for SQS `catalogItemsQueue`
- AWS CDK Stack contains configuration for SNS Topic `createProductTopic` and email subscription

## Additional (optional) tasks

---

- **+15** **(All languages)** - `catalogBatchProcess` lambda is covered by **unit** tests
- **+15** **(All languages)** - set a Filter Policy for SNS `createProductTopic` in AWS CDK Stack and create an additional email subscription to distribute messages to different emails depending on the filter for any product attribute
