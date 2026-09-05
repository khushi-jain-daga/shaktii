import { createCipheriv, createHash, randomBytes } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function ensureUploadDirs() {
  await mkdir(path.resolve('server/storage/uploads'), { recursive: true });
  await mkdir(path.resolve('server/storage/encrypted'), { recursive: true });
}

export async function sha256File(filePath: string) {
  return new Promise<string>((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

function getEncryptionKey() {
  const source = process.env.ENCRYPTION_KEY || 'development-only-encryption-key-change-me';
  return createHash('sha256').update(source).digest();
}

export async function encryptFile(inputPath: string, outputPath: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const data = await readFile(inputPath);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  await mkdir(path.dirname(outputPath), { recursive: true });
  const out = createWriteStream(outputPath);
  out.write(encrypted);
  out.end();
  await new Promise<void>((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
  });

  return { iv: iv.toString('hex'), authTag: authTag.toString('hex') };
}
