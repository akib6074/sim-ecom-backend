import { RequestMethod } from '@nestjs/common';

export const publicUrls = [
  { path: 'api/categories/trees', method: RequestMethod.GET },
  { path: 'api/categories/:id', method: RequestMethod.GET },
  { path: 'api/shop-types', method: RequestMethod.GET },
  { path: 'api/shop-types/shops/home', method: RequestMethod.GET },
  { path: 'api/shops/find/:name', method: RequestMethod.GET },
  { path: 'api/shops/popular', method: RequestMethod.GET },
  { path: 'api/shops/trending', method: RequestMethod.GET },
  { path: 'api/products/find/category', method: RequestMethod.GET },
  { path: 'api/products/find/shop', method: RequestMethod.GET },
  { path: 'api/products/:id', method: RequestMethod.GET },
  { path: 'api/products/popular', method: RequestMethod.GET },
  { path: 'api/products/trending', method: RequestMethod.GET },
  { path: 'api/promotions/latest-promotions', method: RequestMethod.GET },
  { path: 'api/product-review/:id', method: RequestMethod.GET },
  { path: 'api/shop-review/shop/:id', method: RequestMethod.GET },
  { path: 'api/shop-types/:id', method: RequestMethod.GET },
];
