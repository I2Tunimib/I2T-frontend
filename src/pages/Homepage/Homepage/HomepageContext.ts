import { createContext } from 'react';

interface HomepageContextProps {
  source: 'raw' | 'annotated';
}

const HomepageContext = createContext<Partial<HomepageContextProps>>({});

export default HomepageContext;
