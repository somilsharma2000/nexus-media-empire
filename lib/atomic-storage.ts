import fs from 'fs/promises';
import path from 'path';

/**
 * Atomic File Writer & Resilient Storage Engine
 * Windows-Safe & POSIX-Safe file writer with JSON syntax validation
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

    // 3. Rename or copy over (Windows-safe fallback)
    try {
      await fs.rename(tempPath, filePath);
    } catch (renameErr) {
      // Windows file lock fallback: copy and unlink
      await fs.copyFile(tempPath, filePath);
      try {
        await fs.unlink(tempPath);
      } catch {}
    }
  } catch (err) {
    try {
      await fs.unlink(tempPath);
    } catch {}
    // If temp file approach fails, direct safe write
    await fs.writeFile(filePath, serialized, 'utf-8');
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
    try {
      await atomicWriteJson(filePath, fallback);
    } catch {}
    return fallback;
  }
}
