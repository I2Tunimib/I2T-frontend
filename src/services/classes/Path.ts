// import { moveTo } from './PathOperators';

// interface PathClass {
//   pipe: (...args: string[]) => void;
//   clearPath: () => void;
// }
// interface Point {
//   x: number;
//   y: number;
// }

// class Path implements PathClass {
//   private _path = string[];

//   constructor({ x, y }: Point) {
//     this._path = moveTo(x, y);
//   }

//   get d() {
//     return this._path;
//   }

//   public pipe(initialArg: string, ...rest: string[]) {
//     const input = `${this._path} ${initialArg}`;
//     this._path = rest.reduce((prevValue, value) => [...prevValue, value], [input]);
//     // this._path = rest.reduce((prevValue, value) => [...prevValue, value], [input]).join(' ');
//   }

//   public clearPath() {
//     this._path = '';
//   }
// }

// export default Path;

import { moveTo } from './PathOperators';

interface PathClass {
  pipe: (...args: string[]) => void;
  clearPath: () => void;
}
interface Point {
  x: number;
  y: number;
}

class Path implements PathClass {
  private _path: string[] = [];

  constructor({ x, y }: Point) {
    this._path = [moveTo(x, y)];
  }

  get d() {
    return this._path;
  }

  public pipe(...operators: string[]) {
    this._path = operators.reduce((prevValue, value) => [...prevValue, value], this._path);
    // this._path = rest.reduce((prevValue, value) => [...prevValue, value], [input]).join(' ');
  }

  public add(operator: string, index: number) {
    const [start, end] = this._path;
    this._path = [...[start, operator, end]];
  }

  public draw() {
    return this._path.join(' ');
  }

  // public pipe(initialArg: string, ...rest: string[]) {
  //   const input = `${this._path} ${initialArg}`;
  //   this._path = rest.reduce((prevValue, value) => [...prevValue, value], [input]);
  //   // this._path = rest.reduce((prevValue, value) => [...prevValue, value], [input]).join(' ');
  // }

  public clearPath() {
    this._path = [];
  }
}

export default Path;
