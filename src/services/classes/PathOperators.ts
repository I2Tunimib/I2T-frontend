// export const moveTo = (x: number, y: number) => {
//   return `M${x},${y}`;
// };

// export const drawTo = (x: number, y: number) => {
//   return `${x},${y}`;
// };

// export const controlPoint = (x: number, y: number) => {
//   return `Q${x},${y}`;
// };

export const moveTo = (x: number, y: number) => {
  return `M${x},${y}`;
};

export const drawTo = (x: number, y: number) => {
  return `${x},${y}`;
};

export const controlPoint = (x: number, y: number) => {
  return `Q${x},${y}`;
};

export const bezierCurve = (x1: number, y1: number, x2: number, y2: number) => {
  return `C ${x1} ${y1}, ${x2} ${y2},`;
};
