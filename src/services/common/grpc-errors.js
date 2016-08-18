import { status } from 'grpc';

/**
 * An extendable error class for errors that want to provide a Grpc status code.
 */
class GrpcError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
    this.message = message;
    this.code = statusCode;
  }
}

/**
 * An argument provided in a request was invalid.
 */
export class InvalidArgumentError extends GrpcError {
  constructor(message) {
    super(message, status.INVALID_ARGUMENT);
  }
};

/**
 * Something we're trying to create already exists.
 */
export class AlreadyExistsError extends GrpcError {
  constructor(message) {
    super(message, status.ALREADY_EXISTS);
  }
};

/**
 * Something requested was not found.
 */
export class NotFoundError extends GrpcError {
  constructor(message) {
    super(message, status.NOT_FOUND);
  }
};

/**
 * The authentication provided is not valid for something you're trying to do.
 */
export class UnauthenticatedError extends GrpcError {
  constructor(message) {
    super(message, status.UNAUTHENTICATED);
  }
};

/**
 * The service doesn't support some operation.
 */
export class NotImplementedError extends GrpcError {
  constructor(message) {
    super(message, status.UNIMPLEMENTED);
  }
};