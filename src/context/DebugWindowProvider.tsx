import {createContext, useContext, useState} from 'react';

interface DebugWindowContextValue {
  isDebugWindowOpen: boolean;
  openDebugWindow: () => void;
  closeDebugWindow: () => void;
}

export const DebugWindowContext = createContext<DebugWindowContextValue>({
  isDebugWindowOpen: false,
  openDebugWindow: () => {},
  closeDebugWindow: () => {},
});

export const DebugWindowProvider = ({children}: {children: React.ReactNode}) => {
  const [isDebugWindowOpen, setIsDebugWindowOpen] = useState(false);

  const openDebugWindow = () => setIsDebugWindowOpen(true);
  const closeDebugWindow = () => setIsDebugWindowOpen(false);

  return (
    <DebugWindowContext.Provider value={{isDebugWindowOpen, openDebugWindow, closeDebugWindow}}>
      {children}
    </DebugWindowContext.Provider>
  );
};

export const useDebugWindow = () => useContext(DebugWindowContext);
