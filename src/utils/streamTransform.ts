import { Transform } from 'stream';

export class StreamTransform extends Transform {
  private level: string;

  constructor({ level }: { level: string } = { level: 'info' }) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    });
    this.level = level;
  }

  _transform(chunk: any, _encoding: string, callback: any) {
    this.push({
      level: this.level,
      message: chunk,
    });

    callback();
  }
}
