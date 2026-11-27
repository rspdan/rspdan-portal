import { createHash } from 'node:crypto';
import { MAX_ASSET_BYTES, ProductionStudyError } from './productionStudySchema.js';

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const bad = () => { throw new ProductionStudyError('invalid or unsupported raster image'); };
function dimensions(width, height) {
  if (!width || !height || width > 16384 || height > 16384 || width * height > 64 * 1024 * 1024) bad();
}
// Validate bounded container structure and dimensions without re-encoding bytes.
// This is not a pixel decoder or a claim that the image was visually received.
export function rasterDescriptor(buffer) {
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > MAX_ASSET_BYTES) throw new ProductionStudyError('image exceeds the 8 MiB limit', 413);
  let mime;
  if (buffer.length >= 45 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    let at = 8, header = false, data = false, end = false;
    while (at + 12 <= buffer.length) {
      const length = buffer.readUInt32BE(at), type = buffer.toString('ascii', at + 4, at + 8);
      if (at + 12 + length > buffer.length) bad();
      if (!header) {
        if (type !== 'IHDR' || length !== 13) bad();
        dimensions(buffer.readUInt32BE(at + 8), buffer.readUInt32BE(at + 12));
        const depth = buffer[at + 16], color = buffer[at + 17];
        const depths = { 0: [1,2,4,8,16], 2: [8,16], 3: [1,2,4,8], 4: [8,16], 6: [8,16] };
        if (!depths[color]?.includes(depth) || buffer[at + 18] !== 0 || buffer[at + 19] !== 0 || buffer[at + 20] > 1) bad();
        header = true;
      } else if (type === 'IHDR') bad();
      if (type === 'IDAT' && length) data = true;
      at += 12 + length;
      if (type === 'IEND') { if (length || at !== buffer.length) bad(); end = true; break; }
    }
    if (!header || !data || !end) bad();
    mime = 'image/png';
  } else if (buffer.length >= 12 && buffer[0] === 255 && buffer[1] === 216 && buffer.at(-2) === 255 && buffer.at(-1) === 217) {
    let at = 2, frame = false, scan = false;
    while (at < buffer.length - 2) {
      if (buffer[at++] !== 255) bad();
      while (buffer[at] === 255) at++;
      const marker = buffer[at++];
      if (marker === 0 || marker === 216 || marker === 217) bad();
      if (at + 2 > buffer.length) bad();
      const length = buffer.readUInt16BE(at);
      if (length < 2 || at + length > buffer.length - 2) bad();
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
        if (length < 8) bad();
        dimensions(buffer.readUInt16BE(at + 5), buffer.readUInt16BE(at + 3)); frame = true;
      }
      if (marker === 218) { scan = true; break; }
      at += length;
    }
    if (!frame || !scan) bad();
    mime = 'image/jpeg';
  } else if (buffer.length >= 26 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    if (buffer.readUInt32LE(4) + 8 !== buffer.length) bad();
    let at = 12, image = false;
    while (at + 8 <= buffer.length) {
      const kind = buffer.toString('ascii', at, at + 4), length = buffer.readUInt32LE(at + 4), start = at + 8;
      if (start + length > buffer.length) bad();
      if (kind === 'VP8X') {
        if (length !== 10 || buffer[start] & 2) bad(); // Animated WebP is outside this still-image slice.
        dimensions(1 + buffer.readUIntLE(start + 4, 3), 1 + buffer.readUIntLE(start + 7, 3));
      } else if (kind === 'VP8L') {
        if (length < 5 || buffer[start] !== 47) bad();
        const bits = buffer.readUInt32LE(start + 1);
        dimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1); image = true;
      } else if (kind === 'VP8 ') {
        if (length < 10 || buffer[start + 3] !== 157 || buffer[start + 4] !== 1 || buffer[start + 5] !== 42) bad();
        dimensions(buffer.readUInt16LE(start + 6) & 0x3fff, buffer.readUInt16LE(start + 8) & 0x3fff); image = true;
      }
      at = start + length + (length % 2);
    }
    if (!image || at !== buffer.length) bad();
    mime = 'image/webp';
  } else bad();
  return { sha256: sha(buffer), mime, bytes: buffer.length };
}
export function decodeAssetDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string' || dataUrl.length > Math.ceil(MAX_ASSET_BYTES / 3) * 4 + 40) throw new ProductionStudyError('image exceeds the 8 MiB limit', 413);
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match || match[2].length % 4 !== 0) bad();
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.toString('base64') !== match[2]) bad();
  const asset = rasterDescriptor(buffer);
  if (asset.mime !== match[1]) bad();
  return { buffer, asset };
}
