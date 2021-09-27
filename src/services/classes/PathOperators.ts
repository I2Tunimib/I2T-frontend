export const moveTo = (x: number, y: number) => {
  return `M${x},${y}`;
};

export const drawTo = (x: number, y: number) => {
  return `${x},${y}`;
};

export const controlPoint = (x: number, y: number) => {
  return `Q${x},${y}`;
};
