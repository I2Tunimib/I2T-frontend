export const floor = (n: number, decimals = 2) => {
  const pow = 10 ** decimals;
  return Math.floor(n * pow) / pow;
};
