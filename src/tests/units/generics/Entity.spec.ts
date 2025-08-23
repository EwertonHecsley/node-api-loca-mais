import { Entity } from '@src/core/generics/Entity';
import { Identity } from '@src/core/generics/Identity';

const { Identity: ActualIdentity } = jest.requireActual(
  '@src/core/generics/Identity',
);

jest.mock('@src/core/generics/Identity', () => ({
  Identity: jest
    .fn()
    .mockImplementation((id?: string) => new ActualIdentity(id)),
}));

interface TestProps {
  name: string;
}

class TestEntity extends Entity<TestProps> {
  constructor(props: TestProps, id?: Identity) {
    super(props, id);
  }
}

describe('Entity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve criar uma entidade com um novo ID se nenhum for fornecido', () => {
    const props = { name: 'Test' };
    const entity = new TestEntity(props);

    expect(Identity).toHaveBeenCalledTimes(1);
    // Verifica se o ID gerado tem o formato correto (UUID)
    expect(entity.identityId.id).toEqual(
      expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      ),
    );
  });

  it('Deve criar uma entidade com o ID fornecido', () => {
    const props = { name: 'Test' };
    const providedId = new ActualIdentity('provided-uuid');
    const entity = new TestEntity(props, providedId);

    expect(Identity).not.toHaveBeenCalled();
    expect(entity.identityId.id).toBe('provided-uuid');
  });

  it('Deve atribuir as propriedades corretamente', () => {
    const props = { name: 'Test' };
    const entity = new TestEntity(props);

    expect((entity as any).props.name).toBe('Test');
  });
});
