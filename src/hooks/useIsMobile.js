import { useEffect, useState } from 'react';

/** Phone layout breakpoint. Keep in sync with the 640px media queries in *.mobile.css. */
export const MOBILE_QUERY = '(max-width: 640px)';

function matches() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

export default function useIsMobile() {
  const [mobile, setMobile] = useState(matches);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return mobile;
}
