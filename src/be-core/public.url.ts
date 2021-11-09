import { RequestMethod } from '@nestjs/common';

export const publicUrls = [
  { path: '/api/states/service-covered', method: RequestMethod.GET },
  { path: '/api/countries', method: RequestMethod.GET },
  { path: '/api/states', method: RequestMethod.GET },
  { path: '/api/districts', method: RequestMethod.GET },
  { path: '/api/thanas', method: RequestMethod.GET },
  { path: '/api/states/find/country/:id', method: RequestMethod.GET },
  { path: '/api/districts/find/state/:id', method: RequestMethod.GET },
  { path: '/api/thanas/find/district/:id', method: RequestMethod.GET },
  { path: '/api/residentialAreas/find/thana/:id', method: RequestMethod.GET },
];
