import { createContext, useContext, useEffect, useRef, useState } from 'react';
import client from '../api/client';

const ServerStatusContext = createContext(null);

const OUTAGE_STATUSES = [502, 503, 504];
const AUTO_RETRY_MS = 5 * 60 * 1000;

function isOutage(error) {
  const res = error.response;
  if (!res) return true; // no response reached the browser at all (network error, CORS, timeout)
  if (OUTAGE_STATUSES.includes(res.status)) return true; // reverse-proxy gateway errors
  // Every real response from this API (success or error) is a JSON object — the errorHandler
  // middleware guarantees that. A non-JSON body (HTML/text error page from a dev proxy or
  // reverse proxy when the upstream is unreachable) means the request never reached the app.
  const isAppResponse = typeof res.data === 'object' && res.data !== null;
  return !isAppResponse;
}

export function ServerStatusProvider({ children }) {
  const [down, setDown] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    const id = client.interceptors.response.use(
      res => { setDown(false); return res; },
      err => { if (isOutage(err)) setDown(true); return Promise.reject(err); }
    );
    return () => client.interceptors.response.eject(id);
  }, []);

  async function checkNow() {
    if (checkingRef.current) return;
    checkingRef.current = true;
    try {
      await client.get('/health');
      setDown(false);
    } catch {
      setDown(true);
    } finally {
      checkingRef.current = false;
    }
  }

  // Check once on mount instead of waiting for the first real request to fail —
  // catches an outage immediately even on a page that makes no API call itself.
  useEffect(() => { checkNow(); }, []);

  useEffect(() => {
    if (!down) return;
    const interval = setInterval(checkNow, AUTO_RETRY_MS);
    return () => clearInterval(interval);
  }, [down]);

  return (
    <ServerStatusContext.Provider value={{ down, retry: checkNow }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  return useContext(ServerStatusContext);
}
