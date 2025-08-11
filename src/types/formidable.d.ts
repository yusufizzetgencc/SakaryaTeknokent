declare module "formidable" {
  import type { IncomingMessage } from "http";

  export interface File {
    filepath: string;
    originalFilename?: string | null;
    mimetype?: string | null;
    size: number;
    [key: string]: unknown; // any yerine unknown
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }

  export interface IncomingFormOptions {
    uploadDir?: string;
    keepExtensions?: boolean;
    multiples?: boolean;
    maxFileSize?: number;
    // Diğer opsiyonları da burada opsiyonel olarak tanımlayabilirsin
  }

  export class IncomingForm {
    constructor(options?: IncomingFormOptions);
    parse(
      req: IncomingMessage,
      callback: (err: Error | null, fields: Fields, files: Files) => void
    ): void;
  }

  export function parse(
    req: IncomingMessage,
    callback: (err: Error | null, fields: Fields, files: Files) => void
  ): void;
}
