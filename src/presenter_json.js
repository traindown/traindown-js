import {TokenType} from "./token_type";

export class PresenterJSON {
  constructor(tokensArr) {
    this.done = false;
    // TODO: Validator class
    this.errors = [];
    this.tokens = tokensArr;
    this.output = {
      date: null,
      metadata: {},
      movements: [],
      notes: []
    }

    this._process();
  }

  _process() {
    let currentMetaKey = null;
    let movementIndex = 0;

    sessionLoop:
      for (let i = 0; i < this.tokens.length; ++i) {
        let token = this.tokens[i];

        switch(token.type) {
          case TokenType.DateTimeToken:
            this.output.date = token.value;
            break;
          case TokenType.MetaKeyToken:
            this.output.metadata[token.value] = null;
            currentMetaKey = token.value;
            break;
          case TokenType.MetaValueToken:
            this.output.metadata[currentMetaKey] = token.value;
            break;
          case TokenType.NoteToken:
            this.output.notes.push(token.value);
            break;
          default:
            movementIndex = i;
            break sessionLoop;
        }
      }

    if (movementIndex == this.tokens.length - 1) {
      this.done = true;
      return;
    }

    let buffer = [this.tokens[0]];
    let inMovements = false;

    for (let i = 1; i < this.tokens.length; ++i) {
      let token = this.tokens[i];

      if (token.type == TokenType.MovementToken || token.type == TokenType.SupersetMovementToken) {
        this._marshalMovement(buffer);
        buffer = [token];
      } else {
        buffer.push(token);
      }
    }

    if (buffer.length > 0) {
      this._marshalMovement(buffer);
    }

    this.done = true;
    return;
  }

  _marshalMovement(movementTokens) {
    let movement = {
      metadata: {},
      name: "Unknown Movement",
      notes: [],
      performances: [],
      sequence: this.output.movements.length,
      superset: false,
    };

    let currentMetaKey = null;
    let performanceIndex = 0;

    movementLoop:
      for (let i = 0; i < movementTokens.length; ++i) {
        let token = movementTokens[i];

        switch(token.type) {
          case TokenType.SupersetMovementToken:
            movement.superset = true;
            movement.name = token.value;
            break;
          case TokenType.MovementToken:
            movement.name = token.value;
            break;
          case TokenType.MetaKeyToken:
            movement.metadata[token.value] = null;
            currentMetaKey = token.value;
            break;
          case TokenType.MetaValueToken:
            movement.metadata[currentMetaKey] = token.value;
            break;
          case TokenType.NoteToken:
            movement.notes.push(token.value);
            break;
          default:
            performanceIndex = i;
            break movementLoop;
        }
      }

    movement.performances = this._marshalPerformance(movementTokens.slice(performanceIndex))

    this.output.movements.push(movement);
    return;
  }

  _marshalPerformance(performanceTokens) {
    let performances = [];
    let newPerformance = () => {
      return {
        fails: 0,
        load: 0,
        metadata: {},
        reps: 0,
        notes: [],
        sets: 1,
        touched: false,
      }
    };

    let currentMetaKey = null;
    let inLoad = false;
    let performance = newPerformance();

    for (let i = 0; i < performanceTokens.length; ++i) {
      let token = performanceTokens[i];

      if (token.type == TokenType.LoadToken) {
        if (performance.touched) {
          performances.push(performance);
          performance = newPerformance();
        } 

        performance.load = token.value;
      } else {
        switch(token.type) {
          case TokenType.FailToken:
            performance.fails = token.value;
          case TokenType.MetaKeyToken:
            performance.metadata[token.value] = null;
            currentMetaKey = token.value;
          case TokenType.MetaValueToken:
            performance.metadata[currentMetaKey] = token.value;
          case TokenType.NoteToken:
            performance.notes.push(token.value);
          case TokenType.RepToken:
            performance.reps = token.value;
          case TokenType.SetToken:
            performance.sets = token.value;
        }
      }
    }

    return performances;
  }
}
