export function encodeCursor(order: number, id: string) {
  return Buffer.from(`${order}:${id}`, 'utf8').toString('base64url');
}

export function decodeCursor(cursor?: string | null) {
  if (!cursor) return null;
  const [order, id] = Buffer.from(cursor, 'base64url').toString('utf8').split(':');
  const parsedOrder = Number(order);
  if (!Number.isInteger(parsedOrder) || !id) return null;
  return { order: parsedOrder, id };
}
