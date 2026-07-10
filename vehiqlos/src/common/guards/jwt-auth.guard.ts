import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

function verifyJwt(token: string, secret: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  
  // Verify signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${headerB64}.${payloadB64}`);
  const expectedSignature = hmac.digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signatureB64 !== expectedSignature) {
    return null;
  }

  // Parse payload
  const payload = JSON.parse(base64urlDecode(payloadB64));
  
  // Check expiration (exp)
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return null;
  }

  return payload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Necesita iniciar sesión para realizar esta acción. Falta el token de autorización.');
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'SecretKeyForJWTAuthenticationWhichIsVeryLongAndSecureEnoughToSatisfyHMACSHA256';
    
    const payload = verifyJwt(token, secret);
    if (!payload) {
      throw new UnauthorizedException('Su sesión ha expirado o el token es inválido. Por favor, inicie sesión nuevamente.');
    }

    // Attach user payload to request
    request.user = payload;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check roles
    const userRoles = (payload.roles || []).map((r: string) => r.toUpperCase());
    
    const hasRole = requiredRoles.some((role) => {
      const formattedRole = `ROLE_${role.toUpperCase()}`;
      return userRoles.includes(formattedRole) || userRoles.includes(role.toUpperCase());
    });

    if (!hasRole) {
      throw new ForbiddenException('Usted no cuenta con los permisos o rol requerido para realizar esta acción.');
    }

    return true;
  }
}
