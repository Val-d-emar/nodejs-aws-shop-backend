# Task 5 (Integration with S3)

## Links

- **API Endpoint:** [https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products](https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products)
- **Frontend App (CloudFront):** [https://dhoyc6sbijzzm.cloudfront.net](https://dhoyc6sbijzzm.cloudfront.net)
- **Frontend PR:** [https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/4](https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/4)
- **Swagger file:** [import-service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-5/import-service/doc/openapi.yaml)
- **Import Service API:** [https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import](https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import)

## What was done?

- [x] AWS CDK Stack contains configuration for `importProductsFile` function
- [x] The `importProductsFile` lambda function returns a correct response which can be used to upload a file into the S3 bucket
- [x] Frontend application is integrated with `importProductsFile` lambda
- [x] The `importFileParser` lambda function is implemented and AWS CDK. Stack contains configuration for the lambda
- [x] **+10** **(All languages)** - `importProductsFile` lambda is covered by _unit tests_.
- [x] **+10** **(All languages)** - `importFileParser` lambda is covered by _unit tests_.
- [x] **+10** **(All languages)** - At the end of the stream the lambda function should move the file from the `uploaded` folder into the `parsed` folder (`move the file` means that file should be copied into a new folder in the same bucket called `parsed`, and then deleted from `uploaded` folder)
