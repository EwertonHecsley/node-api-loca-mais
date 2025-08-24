import { GenericError } from '../GenericError';

export class NotFoundError extends GenericError {
  constructor(message: string = 'Not Found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
