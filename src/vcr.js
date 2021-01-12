import {TokenType} from "./token_type.js";

class Tape {
  constructor(chr, next) {
    this.chr = chr;
    this.next = next || null;
  }
}


export class VCR {
  constructor(start) {
    this.start = start || null
  }

  push(chr) {
    next = new Tape(chr);
    
    if (this.start == null) {
      this.start = next;
    } else {
      next.next = this.start;
      this.start = next;
    }
  }

  pop() {
    if (this.start == null) {
      return TokenType.EOF;
    }

    next = this.start;
    this.start = next.next;

    return next.chr;
  }

  clear() {
    this.start = null;
  }
}
