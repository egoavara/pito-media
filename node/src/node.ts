import { pito, plugin } from "pito"
import { base16, base32 } from 'rfc4648'
import { BinaryMediaType, Encoding, isBinaryMediaType, isTextMediaType, MediaType, TextMediaType } from "./common.js"
export interface BaseMedia {
    readonly mediaType: MediaType
    readonly content: string
    toEncodedText(): string
    toBuffer(): Promise<Buffer>
}
export class TextMedia implements BaseMedia {
    readonly mediaType: TextMediaType
    readonly content: string
    constructor(mediaType: TextMediaType, content: string) {
        this.mediaType = mediaType
        this.content = content
    }
    toEncodedText() {
        return this.content
    }
    async toBuffer() {
        return Buffer.from(this.content, 'utf-8')
    }
}
export class BinaryMedia implements BaseMedia {
    readonly mediaType: BinaryMediaType
    readonly content: string
    readonly encoding: Encoding
    constructor(mediaType: BinaryMediaType, content: string, encoding: Encoding) {
        this.mediaType = mediaType
        this.content = content
        this.encoding = encoding
    }
    toEncodedText() {
        return this.content
    }
    async toBuffer() {
        switch (this.encoding) {
            case 'base16':
                return Buffer.from(base16.parse(this.content))
            case 'base32':
                return Buffer.from(base32.parse(this.content))
            case 'base64':
                return Buffer.from(this.content, 'base64')
            case 'binary':
                return Buffer.from(this.content, 'binary')
            case '7bit':
            case '8bit':
            case 'quoted-printable':
            default:
                throw new Error(`unimplemented ${this.encoding} encoding`)
        }

    }
}
export function Media(mediaType: TextMediaType, contents: string): TextMedia
export function Media(mediaType: BinaryMediaType, contents: string, encoding: Encoding): BinaryMedia
export function Media(...args: any[]): BothMedia {
    const cmt = args[0]
    if (isBinaryMediaType(cmt)) {
        const cnt = args[1]
        const ce = args[2]
        return new BinaryMedia(cmt, cnt, ce)
    }
    if (isTextMediaType(cmt)) {
        const cnt = args[1]
        return new TextMedia(cmt, cnt)
    }
    throw new Error(`unexpected '${args[0]}' media type`)
}
export type BothMedia = TextMedia | BinaryMedia
// Media-Type
export type MediaTypeOption = {
    contentEncoding: Encoding
}
export type MediaTypeScheme<ContentMediaType extends MediaType> = {
    type: 'string'
    contentMediaType: ContentMediaType
}
export type PitoMediaType<ContentMediaType extends MediaType = MediaType> = pito<string, BothMedia, MediaTypeScheme<ContentMediaType>, MediaTypeOption>
export const PitoMediaType = <ContentMediaType extends MediaType = MediaType, ContentEncoding extends Encoding = 'base64'>(mediaType: ContentMediaType, options?: { encoding?: ContentEncoding }): PitoMediaType<ContentMediaType> => {
    return {
        type: 'string',
        contentMediaType: mediaType,
        contentEncoding: options?.encoding,
        $typeof: 'class',
        $constructor: (isTextMediaType(mediaType) ? TextMedia : BinaryMedia),
        $wrap(data) {
            return data.toEncodedText()
        },
        $unwrap(raw) {
            if (isBinaryMediaType(mediaType)) {
                if (options?.encoding === undefined) {
                    throw new Error(`unexpected encoding`)
                }
                return Media(mediaType as any, raw, options?.encoding)
            }
            if (isTextMediaType(mediaType)) {
                return Media(mediaType as any, raw)
            }
            throw new Error()
        },
        $strict(this) {
            return {
                type: 'string',
                contentMediaType: mediaType,
                contentEncoding: options?.encoding,
            }
        },
        $bypass(this) {
            return false
        },
    }
}

// ============================================================================================================================================
Object.defineProperty(plugin, 'Media', { value: PitoMediaType, configurable: false, writable: false })
declare module 'pito' {
    interface PitoPlugin {
        Media: typeof PitoMediaType
    }
    namespace pito {
        type Media<ContentMediaType extends MediaType = MediaType> = PitoMediaType<ContentMediaType>
    }
}
