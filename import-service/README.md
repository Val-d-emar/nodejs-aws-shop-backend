# Product Service (Backend)

- **API URL:** [https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products](https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products)
- **Frontend URL:** [https://dhoyc6sbijzzm.cloudfront.net](https://dhoyc6sbijzzm.cloudfront.net)
- **Swagger Doc:** [product_service/doc/openapi.yaml](./product_service/doc/openapi.yaml)

# Task 5 (Integration with S3)

## Links

- **API Endpoint:** [https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products](https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products)
- **Frontend App (CloudFront):** [https://dhoyc6sbijzzm.cloudfront.net](https://dhoyc6sbijzzm.cloudfront.net)
- **Frontend PR:** []()
- **Swagger file:** [product_service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-5/product_service/doc/openapi.yaml)

## What was done?

- [ ] AWS CDK Stack contains configuration for `importProductsFile` function
- [ ] The `importProductsFile` lambda function returns a correct response which can be used to upload a file into the S3 bucket
- [ ] Frontend application is integrated with `importProductsFile` lambda
- [ ] The `importFileParser` lambda function is implemented and AWS CDK. Stack contains configuration for the lambda
- [ ] **+10** **(All languages)** -  `importProductsFile` lambda is covered by _unit tests_.  You should consider to mock S3 and other AWS SDK methods so not trigger actual AWS services while unit testing.
- [ ] **+10** **(All languages)** -  `importFileParser` lambda is covered by _unit tests_.
- [ ] **+10** **(All languages)** - At the end of the stream the lambda function should move the file from the `uploaded` folder into the `parsed` folder (`move the file` means that file should be copied into a new folder in the same bucket called `parsed`, and then deleted from `uploaded` folder)
