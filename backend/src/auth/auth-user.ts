import type { Role } from '../generated/prisma/client.js';

/** Content of the signed JWT. */
export interface JwtPayload {
  sub: string;
  role: Role;
  teamId: string;
}

/** Authenticated user attached to the request by JwtAuthGuard. */
export interface AuthUser {
  userId: string;
  role: Role;
  teamId: string;
}
