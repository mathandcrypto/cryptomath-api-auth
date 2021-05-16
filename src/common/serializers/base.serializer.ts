export abstract class BaseSerializerService<E, T> {
  abstract serialize(value: E): Promise<T>;

  serializeCollection(values: E[]): Promise<T[]> {
    return Promise.all<T>(values.map((value) => this.serialize(value)));
  }
}
