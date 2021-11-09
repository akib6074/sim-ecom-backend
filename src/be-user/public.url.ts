import { RequestMethod } from '@nestjs/common';

export const publicUrls = [
  { path: '/api/auth/login', method: RequestMethod.POST },
  { path: '/api/auth/forget-password', method: RequestMethod.POST },
  { path: '/api/auth/change-password', method: RequestMethod.POST },
  { path: '/api/users/registration', method: RequestMethod.POST },
  { path: '/api/users/verify-otp/:id', method: RequestMethod.POST },
  { path: '/api/users/resend-otp/:id', method: RequestMethod.POST },
  { path: '/api/users/send-sms', method: RequestMethod.POST },
  { path: '/api/mail/gmail', method: RequestMethod.POST },
  { path: '/api/mail/sms', method: RequestMethod.POST },
  { path: '/api/addresses', method: RequestMethod.POST },
  { path: '/api/users/inactive/:id', method: RequestMethod.GET },
];
