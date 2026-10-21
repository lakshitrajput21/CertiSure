export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CS-${year}-${randomNum}`;
}

export function generateFingerprint(input: string): string {
  // Deterministic-looking simulated SHA-256 hash
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Math.abs(hash * 31).toString(16).padStart(8, '0');
  const part3 = Math.abs(hash * 17).toString(16).padStart(8, '0');
  const part4 = Math.abs(hash * 53).toString(16).padStart(8, '0');
  return `sha256:${hex}${part2}${part3}${part4}`;
}
