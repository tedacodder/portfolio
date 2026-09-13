import argon2 from "argon2";

// argon2id is the OWASP-recommended default: resistant to both GPU-cracking
// (like bcrypt) and side-channel/tradeoff attacks (unlike argon2i alone).
export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plainPassword: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    // argon2.verify throws on a malformed hash rather than returning false.
    // Treat that the same as "did not match" instead of leaking the error.
    return false;
  }
}
