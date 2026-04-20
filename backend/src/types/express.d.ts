import { JwtUser } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
      validated?: unknown;
    }
  }
}

export {};
