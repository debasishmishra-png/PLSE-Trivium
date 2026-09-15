/**
 * Trivium Document Vault Encryption / Decryption Utilities
 * Uses Web Crypto API for high-security client-side AES-256-GCM encryption & PBKDF2 key derivation.
 */

export interface EncryptedPayload {
  version: '1.0';
  algorithm: 'AES-256-GCM';
  salt: string; // Base64
  iv: string; // Base64
  tagLength: number;
  ciphertext: string; // Base64
  meta: {
    name: string;
    type: string;
    category: string;
    encryptedAt: string;
    checksum?: string;
  };
}

// Convert string to Uint8Array
function strToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to string
function bufferToStr(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

// Convert ArrayBuffer / Uint8Array to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM CryptoKey from user passphrase and salt via PBKDF2 (100,000 iterations)
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwordBuffer = strToBuffer(password);
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts document text with AES-256-GCM and a user passphrase.
 */
export async function encryptDocument(
  content: string,
  passphrase: string,
  meta: { name: string; type: string; category: string }
): Promise<EncryptedPayload> {
  if (!passphrase || passphrase.trim().length === 0) {
    throw new Error('Passphrase is required for encryption');
  }

  // Generate 16-byte random salt and 12-byte random IV
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(passphrase, salt);
  const dataBuffer = strToBuffer(content);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
      tagLength: 128,
    },
    key,
    dataBuffer as any
  );

  return {
    version: '1.0',
    algorithm: 'AES-256-GCM',
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    tagLength: 128,
    ciphertext: bufferToBase64(cipherBuffer),
    meta: {
      ...meta,
      encryptedAt: new Date().toISOString(),
    },
  };
}

/**
 * Decrypts an EncryptedPayload back into plaintext using the supplied passphrase.
 */
export async function decryptDocument(
  payload: EncryptedPayload,
  passphrase: string
): Promise<{ text: string; meta: EncryptedPayload['meta'] }> {
  if (!passphrase) {
    throw new Error('Passphrase is required for decryption');
  }

  try {
    const salt = base64ToBuffer(payload.salt);
    const iv = base64ToBuffer(payload.iv);
    const cipherBytes = base64ToBuffer(payload.ciphertext);

    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any,
        tagLength: payload.tagLength || 128,
      },
      key,
      cipherBytes as any
    );

    const text = bufferToStr(decryptedBuffer);
    return {
      text,
      meta: payload.meta,
    };
  } catch (err: any) {
    throw new Error('Decryption failed: Incorrect passphrase or corrupted encrypted file.');
  }
}

/**
 * Downloads plaintext content as a file in the browser.
 */
export function downloadPlaintextFile(filename: string, content: string, mimeType: string = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads EncryptedPayload as a .trivium.enc JSON file.
 */
export function downloadEncryptedFile(filename: string, payload: EncryptedPayload) {
  const json = JSON.stringify(payload, null, 2);
  const encFilename = filename.endsWith('.enc') || filename.endsWith('.trivium.enc') ? filename : `${filename}.trivium.enc`;
  downloadPlaintextFile(encFilename, json, 'application/json;charset=utf-8');
}
