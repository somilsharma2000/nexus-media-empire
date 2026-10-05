import fs from 'fs/promises';
import path from 'path';

/**
 * Atomic File Writer & Resilient Storage Engine
 * Prevents JSON file corruption during concurrent reads/writes by writing
 * to a temporary file first, validating JSON syntax, and performing an atomic rename.
 */
export async function atomicWriteJson<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  const serialized = JSON.stringify(data, null, 2);
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 7)}`;

  try {
    // 1. Write to temporary staging file
    await fs.writeFile(tempPath, serialized, 'utf-8');

    // 2. Validate JSON parse before committing
    const verifyRaw = await fs.readFile(tempPath, 'utf-8');
    JSON.parse(verifyRaw);

    // 3. Atomic rename (Windows & POSIX safe)
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // Cleanup temporary file if something goes wrong
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw err;
  }
}

/**
 * Resilient JSON Reader with fallback and auto-repair
 */
export async function resilientReadJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    if (!raw.trim()) {
      await atomicWriteJson(filePath, fallback);
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    // If file missing or corrupted, restore fallback safely
    try {
      await atomicWriteJson(filePath, fallback);
    } catch {}
    return fallback;
  }
}
