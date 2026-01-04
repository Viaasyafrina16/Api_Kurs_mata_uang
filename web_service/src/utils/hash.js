import bcrypt from "bcrypt";

export async function hashValue(value) {
  return bcrypt.hash(value, 10);
}

export async function compareHash(value, hashed) {
  return bcrypt.compare(value, hashed);
}
