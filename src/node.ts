import { plugin } from 'pito'
import { base16, base32, base64 } from 'rfc4648'
import { BaseMedia, BinaryMediaInterface, BinaryMediaType, Encoding, isBinaryMediaType, isTextMediaType, MediaType, PitoMediaType, TextMediaInterface, TextMediaType } from "./common.js"
export class NodeTextMedia implements TextMediaInterface {
    readonly mediaType: TextMediaType
    readonly content: string
    constructor(mediaType: TextMediaType, content: string) {
        this.mediaType = mediaType
        this.content = content
    }
    toEncodedText(): string {
        return this.content
    }
    async toBuffer() {
        return new TextEncoder().encode(this.content)
    }
}
export class NodeBinaryMedia implements BinaryMediaInterface {
    readonly mediaType: BinaryMediaType
    readonly content: string
    readonly encoding: Encoding
    constructor(mediaType: BinaryMediaType, content: string, encoding: Encoding) {
        this.mediaType = mediaType
        this.content = content
        this.encoding = encoding
    }
    toEncodedText(): string {
        return this.content
    }
    async toBuffer(): Promise<Uint8Array> {
        switch (this.encoding) {
            case 'base16':
                return base16.parse(this.content)
            case 'base32':
                return base32.parse(this.content)
            case 'base64':
                return base64.parse(this.content)
            case 'binary':
            case '7bit':
            case '8bit':
            case 'quoted-printable':
            default:
                throw new Error(`unimplemented ${this.encoding} encoding`)
        }
    }
}
// ============================================================================================================================================
export const NodePitoMediaType = <ContentMediaType extends MediaType = MediaType, ContentEncoding extends Encoding = 'base64'>(mediaType: ContentMediaType, options?: { encoding?: ContentEncoding }): PitoMediaType<ContentMediaType> => {
    return {
        type: 'string',
        contentMediaType: mediaType,
        contentEncoding: options?.encoding,
        $typeof: 'class',
        $constructor: (isTextMediaType(mediaType) ? NodeTextMedia : NodeBinaryMedia),
        $wrap(data: BaseMedia) {
            return data.toEncodedText()
        },
        $unwrap(raw: string) {
            if (isBinaryMediaType(mediaType)) {
                if (options?.encoding === undefined) {
                    throw new Error(`unexpected encoding`)
                }
                return new NodeBinaryMedia(mediaType as any, raw, options?.encoding)
            }
            if (isTextMediaType(mediaType)) {
                return new NodeTextMedia(mediaType as any, raw)
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
    } as any
}
// ============================================================================================================================================
Object.defineProperty(plugin, 'Media', { value: NodePitoMediaType, configurable: false, writable: false })
export * from "./common.js"
