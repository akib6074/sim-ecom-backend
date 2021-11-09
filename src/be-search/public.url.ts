import { RequestMethod } from '@nestjs/common';

export const publicUrls = [
  { path: '/api/products/search', method: RequestMethod.GET },
  { path: '/api/shops/search', method: RequestMethod.GET },
  { path: '/api/shops/search/location', method: RequestMethod.GET },
  { path: '/api/products/search/location', method: RequestMethod.GET },
];
