import { handler } from '../../src/handlers/getProductsById';

describe('getProductsById handler', () => {
  it('should return 200 and product if found', async () => {
    const event = {
      pathParameters: { productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa' }
    };
    const result = await handler(event as any);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).title).toBe('Product One');
  });

  it('should return 404 if product not found', async () => {
    const event = {
      pathParameters: { productId: 'non-existent-id' }
    };
    const result = await handler(event as any);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).message).toBe('Product not found');
  });
});
