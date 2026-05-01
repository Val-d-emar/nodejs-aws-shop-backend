import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { products } from '../mocks/products';
import { formatJSONResponse } from '../utils/apiResponse';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Incoming request for getProductsList:', event.path);
    return formatJSONResponse(200, products);
  } catch (error) {
    console.error('Error in getProductsList:', error);
    return formatJSONResponse(500, { message: 'Internal server error' });
  }
};
