import { RequestMethod } from '@nestjs/common';

export const publicUrls = [
  { path: '/api/ssl-commerze/prepare', method: RequestMethod.POST },
  { path: '/api/ssl-commerze/success/:id', method: RequestMethod.POST },
  { path: '/api/ssl-commerze/fail', method: RequestMethod.POST },
  { path: '/api/ssl-commerze/cancel', method: RequestMethod.POST },
];
