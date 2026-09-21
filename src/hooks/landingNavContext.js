import { createContext, useContext } from 'react';

export const LandingNavContext = createContext({
  activeId: 'home',
  titleGen: 0,
  scrollToSection: () => {},
});

export function useLandingNav() {
  return useContext(LandingNavContext);
}
