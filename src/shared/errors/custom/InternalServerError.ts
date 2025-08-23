import { GenericError } from '../GenericError';

export class InternalServerError extends GenericError {
  constructor(message: string = 'Internal server error.') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}
