import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

/**
 * Global filter translating Prisma errors into HTTP responses.
 * Never sends the stack trace or the query details to the client.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const httpException = this.toHttpException(exception);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(httpException.getStatus())
      .json(httpException.getResponse());
  }

  private toHttpException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        return new ConflictException('Cette ressource existe déjà');
      case 'P2025': // Record not found
        return new NotFoundException('Ressource introuvable');
      default:
        // Only the error code is logged, never the request data
        this.logger.error(`Unhandled Prisma error ${exception.code}`);
        return new InternalServerErrorException('Erreur interne du serveur');
    }
  }
}
