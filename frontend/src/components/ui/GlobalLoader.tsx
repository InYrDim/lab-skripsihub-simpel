import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, minimum: 0.2, speed: 400 });

export function GlobalLoader() {
  const location = useLocation();

  useEffect(() => {
    // Start NProgress when location changes
    NProgress.start();

    // Finish it after a short delay to simulate the loading since the route transition is instant
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 400);

    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [location.pathname]);

  return null;
}
