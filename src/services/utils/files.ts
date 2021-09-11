export const readFile = async (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result as string);
    };
    fr.onerror = reject;
    fr.readAsText(file);
  });
};
