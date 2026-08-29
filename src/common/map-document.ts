export function mapDocument<T extends { _id: { toString(): string } }>(
  doc: T,
): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc as T & { _id: { toString(): string } };
  return {
    ...rest,
    id: _id.toString(),
  };
}
