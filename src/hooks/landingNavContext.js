import { createContext, useContext } from 'react';

export const LandingNavContext = createContext({
  activeId: 'home',
  scrollToSection: () => {},
});

export function useLandingNav() {
  return useContext(LandingNavContext);
}
