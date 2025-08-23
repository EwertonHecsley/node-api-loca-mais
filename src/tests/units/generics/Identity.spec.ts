import { Identity } from '@src/core/generics/Identity';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-1234-abcd-5678'),
}));

describe('Identity', () => {
  it('should create an Identity with a generated ID', () => {
    const identity = new Identity();

    expect(identity.id).toBe('mock-uuid-1234-abcd-5678');
    expect(uuidv4).toHaveBeenCalled();
  });

  it('should create an Identity with the provided ID', () => {
    const providedId = '1a2b3c4d-e5f6-7g8h-i9j0-k1l2m3n4o5p6';
    const identity = new Identity(providedId);

    expect(identity.id).toBe(providedId);
  });
});
