import {Lexer} from "./lexer";
import {TokenType} from "./token_type";

class Parser {

  constructor(srcString) {
    this.lexer = new Lexer(srcString, this.idleState);
  }

  parse() {
    this.lexer.run(this);
    return this.lexer.tokens;
  }

  idleState(lexer) {
    chr = lexer.peek();

    if (chr == TokenType.EOF) {
      return null;
    }

    if (this._isWhitespace(chr)) {
      return this.whitespaceState(lexer);
    }

    switch(chr) {
      case "@":
        return this.dateTimeState(lexer);
      case "#":
        return this.metaKeyState(lexer);
      case "*":
        return this.noteState(lexer);
      default:
        return this.valueState(lexer);
    }
  }

  dateTimeState(lexer) {
    lexer.take(["@", " "]);
    lexer.ignore();

    chr = lexer.next();

    while(!this._isLineTerminator(chr)) {
      chr = lexer.next();
    }

    lexer.rewind();
    lexer.emit(TokenType.DateTimeToken);

    return this.idleState;
  }

  metaKeyState(lexer) {
    lexer.take(["#", " "]);
    lexer.ignore();

    chr = lexer.next();

    while(chr != ":") {
      chr = lexer.next();
    }

    lexer.rewind();
    lexer.emit(TokenType.MetaKeyToken);

    return this.metaValueState;
  }

  metaValueState(lexer) {
    lexer.take([":", " "]);
    lexer.ignore();

    chr = lexer.next();

    while(!this._isLineTerminator(chr)) {
      chr = lexer.next();
    }

    lexer.rewind();
    lexer.emit(TokenType.MetaValueToken);

    return this.idleState;
  }

  movementState(lexer) {
    superset = false;

    chr = lexer.next();

    if (chr == "+") {
      superset = true
      lexer.take([" "]);
      lexer.ignore();
      chr = lexer.next();
    }

    if (chr == "'") {
      lexer.ignore();
      chr = lexer.next();
    }

    while(chr != ":") {
      chr = lexer.next();
    }

    lexer.rewind();

    if (superset) {
      lexer.emit(TokenType.SupersetMovementToken);
    } else {
      lexer.emit(TokenType.MovementToken);
    }

    lexer.take(":");
    lexer.ignore();

    return this.idleState;
  }

  noteState(lexer) {
    lexer.take(["*", " "]);
    lexer.ignore();

    chr = lexer.next();

    while(!this._isLineTerminator(chr)) {
      chr = lexer.next();
    }

    lexer.rewind();
    lexer.emit(TokenType.NoteToken);

    return this.idleState;
  }

  numberState(lexer) {
    lexer.take(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."]);

    switch(lexer.peek()) {
      case "f": case "F":
        lexer.emit(TokenType.FailToken);
        break;
      case "r": case "R":
        lexer.emit(TokenType.RepToken);
        break;
      case "s": case "S":
        lexer.emit(TokenType.SetToken);
        break;
      default:
        lexer.emit(TokenType.LoadToken);
    }

    lexer.take(["f", "F", "r", "R", "s", "S"]);
    lexer.ignore();

    return this.idleState;
  }

  valueState(lexer) {
    chr = lexer.next();

    if (chr == "+" || chr == "'") {
      lexer.rewind();
      return this.movementState(lexer);
    }

    if (isNaN(chr)) {
      if (chr != "b" && chr != "B") {
        lexer.rewind();
        return this.movementState(lexer);
      }

      p = lexer.peek();

      if (p != "w" && p != "W") {
        lexer.rewind();
        return this.movementState(lexer);
      }

      while(!this._isWhitespace(chr)) {
        chr = lexer.next();
      }

      lexer.rewind();
      lexer.emit(TokenType.LoadToken);

      return this.idleState;
    }

    return this.numberState(lexer);
  }

  whitespaceState(lexer) {
    chr = lexer.next();

    if (chr == TokenType.EOF) {
      return null;
    }

    if (!this._isWhitespace(chr)) {
      lexer.error("Unexpected token " + chr);
      return null;
    }

    while(this._isWhitespace(chr)) {
      chr = lexer.next();
    }

    lexer.rewind();
    lexer.ignore();

    return this.idleState;
  }

  _isLineTerminator(chr) {
    if (chr == TokenType.EOF || chr == ";" || chr == "\n" || chr == "\r") {
      return true;
    }

    return false;
  }

  _isWhitespace(chr) {
    if (/\s/.test(chr)) {
      return true;
    }

    return false;
  }
}

export default Parser;