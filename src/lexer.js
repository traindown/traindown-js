import {VCR} from "./vcr";
import {Token} from "./token";
import {TokenType} from "./token_type";

export class Lexer {

  constructor(srcString, initState) {
    this.done = false;
    this.errorHandler = ((error) => { throw error; });
    this.position = 0;
    this.src = srcString;
    this.start = 0;
    this.state = initState || (() => {});
    this.tokens = [];
    this.vcr = new VCR();

    this._output = {};
  }

  current() {
    return this.src.slice(this.start, this.position);
  }

  emit(tokenType) {
    let token = new Token(tokenType, this.current());

    this.tokens.push(token)
    this.start = this.position;
    this.vcr.clear();
  }

  error(msg) {
    this.errorHandler(msg);
  }

  ignore() {
    this.vcr.clear();
    this.start = this.position;
  }

  next() {
    let chr = TokenType.EOF
    let str = this.src.slice(this.position, this.src.length);

    if (str.length != 0) {
      chr = str[0];
    }

    this.position += 1;
    this.vcr.push(chr);

    return chr;
  }

  nextToken() {
    return this.tokens.pop();
  }

  peek() {
    let chr = this.next();
    this.rewind();

    return chr;
  }

  rewind() {
    let chr = this.vcr.pop()

    if (chr != TokenType.EOF) {
      this.position -= 1;

      if (this.position < this.start) {
        this.position = this.start;
      }
    }
  }

  run(pCtx) {
    while (this.state != null) {
      this.state = this.state.call(pCtx, this);
    }

    this.done = true;
  }

  take(chrArray) {
    let chr = this.next();

    while(chrArray.includes(chr)) {
      chr = this.next();
    }

    this.rewind();
  }
}
