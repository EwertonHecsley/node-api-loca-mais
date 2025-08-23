import { GenericError } from '../GenericError';

export class InvalidEmailError extends GenericError {
  constructor() {
    super('Invalid email format', 400);
    this.name = 'InvalidEmailError';
  }
}
