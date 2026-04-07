/**
 * Asynchronous encryption function
 *
 * @param data - The string to encrypt
 * @param key - The password/key for encryption
 *
 * @returns Encrypted Base64 string
 */
export async function encrypt(data: string, key: string): Promise<string> {
  key = key.padEnd(16, "0");
  const dataBuffer = new TextEncoder().encode(data);
  const keyBuffer = new TextEncoder().encode(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    dataBuffer
  );

  const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
  combinedData.set(iv);
  combinedData.set(new Uint8Array(encryptedData), iv.length);

  return uint8ToBase64(combinedData);
}

function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    result += base64Chars.charAt((bitmap >> 18) & 63);
    result += base64Chars.charAt((bitmap >> 12) & 63);
    result += i + 1 < bytes.length ? base64Chars.charAt((bitmap >> 6) & 63) : "=";
    result += i + 2 < bytes.length ? base64Chars.charAt(bitmap & 63) : "=";
  }
  return result;
}
