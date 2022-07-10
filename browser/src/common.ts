
export const TextMediaType = [
    'application/json'
    , 'application/ld+json'
    , 'application/xml'
    , 'text/plain'
    , 'text/css'
    , 'text/csv'
    , 'text/html'
    , 'text/javascript'
] as const
export const BinaryMediaType = [
    'audio/aac'
    , 'audio/midi'
    , 'audio/mpeg'
    , 'audio/ogg'
    , 'audio/opus'
    , 'audio/wav'
    , 'audio/webm'
    , 'image/avif'
    , 'image/bmp'
    , 'image/gif'
    , 'image/jpeg'
    , 'image/png'
    , 'image/tiff'
    , 'image/webp'
    , 'image/svg+xml'
    , 'video/x-msvideo'
    , 'video/mp4'
    , 'video/mpeg'
    , 'video/ogg'
    , 'video/webm'
    , 'application/gzip'
    , 'application/octet-stream'
    , 'application/pdf'
    , 'application/zip'
    , 'font/otf'
    , 'font/otf'
    , 'font/woff'
    , 'font/woff2'
] as const
export const MediaType = [
    ...TextMediaType,
    ...BinaryMediaType,
] as const
export const Encoding = [
    '7bit'
    , '8bit'
    , 'binary'
    , 'quoted-printable'
    , 'base16'
    , 'base32'
    , 'base64'
] as const


export type TextMediaType = (typeof TextMediaType)[number]
export type BinaryMediaType = (typeof BinaryMediaType)[number]
export type MediaType = (typeof MediaType)[number]
export type Encoding = (typeof Encoding)[number]

export function isMediaType(media: string): media is MediaType { return MediaType.includes(media as any) }
export function isTextMediaType(media: string): media is TextMediaType { return TextMediaType.includes(media as any) }
export function isBinaryMediaType(media: string): media is BinaryMediaType { return BinaryMediaType.includes(media as any) }
export function isEncoding(encoding: string): encoding is Encoding { return Encoding.includes(encoding as any) }

