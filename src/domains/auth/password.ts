import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt:${salt.toString("base64")}:${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, saltValue, hashValue] = storedHash.split(":");
  if (algorithm !== "scrypt" || !saltValue || !hashValue) {
    return false;
  }

  const salt = Buffer.from(saltValue, "base64");
  const expected = Buffer.from(hashValue, "base64");
  if (expected.length === 0) {
    return false;
  }

  const derived = (await scrypt(password, salt, expected.length)) as Buffer;
  if (derived.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(derived, expected);
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password.length > 72) {
    return "Password must be 72 characters or fewer.";
  }
  return null;
}
