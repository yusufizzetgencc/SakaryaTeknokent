declare module "pdf-lib" {
  export class PDFDocument {
    static load(bytes: Uint8Array | ArrayBuffer): Promise<PDFDocument>;
    registerFontkit(fontkit: unknown): void;
    getPages(): PDFPage[];
    embedFont(fontBytes: Uint8Array | ArrayBuffer): Promise<PDFFont>;
    save(): Promise<Uint8Array>;
  }

  export interface PDFPage {
    drawText(text: string, options?: TextOptions): void;
  }

  export type PDFFont = object;

  export interface TextOptions {
    x?: number;
    y?: number;
    size?: number;
    font?: PDFFont;
    color?: RGB;
  }

  export interface RGB {
    red: number;
    green: number;
    blue: number;
  }

  export function rgb(r: number, g: number, b: number): RGB;
}

declare module "@pdf-lib/fontkit" {
  const fontkit: unknown;
  export default fontkit;
}
