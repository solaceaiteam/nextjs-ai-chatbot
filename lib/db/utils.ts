import { generateId } from 'ai';
import { genSalt, hash } from 'bcrypt-ts';

export async function generateHashedPassword(password: string) {
  const salt = await genSalt(10);
  const hashed = await hash(password, salt);
  return hashed;
}

export function generateDummyPassword() {
  const password = generateId(12);
  const hashedPassword = generateHashedPassword(password);

  return hashedPassword;
}
