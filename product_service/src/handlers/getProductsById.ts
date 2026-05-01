import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from '../mocks/products';
import { formatJSONResponse } from '../utils/apiResponse';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Incoming request for getProductsById:', event.pathParameters);

    // Get productId from http://.../products/{productId}
    const productId = event.pathParameters?.productId;

    if (!productId) {
      return formatJSONResponse(400, { message: 'Product ID is missing' });
    }

    const product = products.find((p) => p.id === productId);

    if (!product) {
      return formatJSONResponse(404, { message: 'Product not found' });
    }

    return formatJSONResponse(200, product);
  } catch (error) {
    console.error('Error in getProductsById:', error);
    return formatJSONResponse(500, { message: 'Internal server error' });
  }
};
