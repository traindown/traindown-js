export class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  toString() {
    return "[" + this.type + "] " + this.value;
  }
}
