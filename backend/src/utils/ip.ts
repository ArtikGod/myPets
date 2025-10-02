import { Request } from 'express';
import { IP_VALIDATION } from '../constants';

export function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  
  if (forwarded) {
    const forwardedIPs = (forwarded as string).split(',');
    return forwardedIPs[0].trim();
  }
  
  return req.socket.remoteAddress ||
         IP_VALIDATION.DEFAULT_IP;
}

export function isValidIP(ip: string): boolean {
  return IP_VALIDATION.IPV4_REGEX.test(ip) || IP_VALIDATION.IPV6_REGEX.test(ip);
}