import { useEffect, useState } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    window.frameworkReady?.();
    // Set framework as ready after calling the ready function
    setIsReady(true);
  }, []);

  return isReady;
}
