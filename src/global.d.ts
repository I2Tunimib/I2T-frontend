interface Config {
  APP: AppConfig;
}

interface AppConfig {
  DEMO: boolean;
  MODE: 'standard' | 'challenge';
}

declare module '*.yaml' {
  const content: Config;
  export default content;
}
