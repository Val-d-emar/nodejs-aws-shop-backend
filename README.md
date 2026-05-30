## Task 7 (Authorization)

### What was done:

- [x] authorization-service is added to the repo, has correct basicAuthorizer lambda and correct AWS CDK Stack
- [x] Import Service AWS CDK Stack has authorizer configuration for the importProductsFile lambda. Request to the importProductsFile lambda should work only with correct authorization_token being decoded and checked by basicAuthorizer lambda. Response should be in 403 HTTP status if access is denied for this user (invalid authorization_token) and in 401 HTTP status if Authorization header is not provided.
- [x] Client application is updated to send "Authorization: Basic authorization_token" header on import. Client should get authorization_token value from browser localStorage

### Additional scope (Optional tasks):

- [x] +30 - Client application should display alerts for the responses in 401 and 403 HTTP statuses. This behavior should be added to the nodejs-aws-fe-main/src/index.tsx file.

## Links:

- **Frontend App (CloudFront):** [https://dhoyc6sbijzzm.cloudfront.net](https://dhoyc6sbijzzm.cloudfront.net)
- **FE PR:** [https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/6](https://github.com/Val-d-emar/nodejs-aws-shop-react/pull/6)
- **Test Credentials for Reviewers:**
  - Login: `Val-d-emar`
  - Password: `TEST_PASSWORD`
  - Token string to put in localStorage: `VmFsLWQtZW1hcjpURVNUX1BBU1NXT1JE`

- **API Products Endpoint:** [https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products](https://jco1jj7ev7.execute-api.eu-north-1.amazonaws.com/prod/products)
- **Swagger file products:** [product_service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-7/product_service/doc/openapi.yaml)
- **API Import Service:** [https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import](https://pko6smj112.execute-api.eu-north-1.amazonaws.com/prod/import)
- **Swagger file import:** [import-service/doc/openapi.yaml](https://github.com/Val-d-emar/nodejs-aws-shop-backend/blob/task-7/import-service/doc/openapi.yaml)