import { GenericError } from '../GenericError';

export class BadRequestError extends GenericError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}
