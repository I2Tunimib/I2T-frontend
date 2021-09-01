import { createContext } from 'react';

interface ExpandableListContextProps {
  expanded: boolean;
}

const ExpandableListContext = createContext<Partial<ExpandableListContextProps>>({});

export default ExpandableListContext;
