export class Storage {
  private storage: { [key: string]: any } = {};

  set(key: string, value: any) {
    this.storage[key] = value;
  }

  get(key: string) {
    if (typeof this.storage[key] === 'undefined') {
      throw new Error(`Storage: key ${key} does not exists`);
    }

    return this.storage[key];
  }
}
