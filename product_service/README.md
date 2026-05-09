# Task 4: Integration with DynamoDB

## Links

- **API Endpoint:** [https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products](https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products)
- **Frontend App (CloudFront):** [https://dhoyc6sbijzzm.cloudfront.net](https://dhoyc6sbijzzm.cloudfront.net)
- **Frontend PR:** [https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/3](https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/3)
- **Swagger file:** [product_service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-4/product_service/doc/openapi.yaml)

## What was done?

- [x] The `products` and `stocks` tables have been created in DynamoDB.
- [x] Data filling script: `product_service/scripts/fill-tables.ts`.
- [x] Lambdas are integrated with the database (DocumentClient is used).
- [x] A POST request has been implemented to create a product.
- [x] **Additionally:** Input data validation (400 error).
- [x] **Additionally:** Transactional record in two tables.
- [x] **Additionally:** Logging of all requests.
- [x] **Additionally:** Handling unexpected errors (500 error).
- [x] **FE** was fixed.
- [X] **Swagger file:** was fixed.
