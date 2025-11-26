import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { XMC } from "@sitecore-marketplace-sdk/xmc";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface MarketplaceClientState {
  client: ClientSDK | null;
  error: Error | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 750;

let cachedClient: ClientSDK | undefined;

async function initClient() {
  if (cachedClient) return cachedClient;
  cachedClient = await ClientSDK.init({
    target: window.parent,
    modules: [XMC],
  });
  return cachedClient;
}

export function useMarketplaceClient() {
  const [state, setState] = useState<MarketplaceClientState>({
    client: null,
    error: null,
    isLoading: false,
    isInitialized: false,
  });

  const isInitializingRef = useRef(false);

  const initialize = useCallback(
    async (attempt = 1): Promise<void> => {
      if (state.isInitialized || state.isLoading || isInitializingRef.current) return;
      isInitializingRef.current = true;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const client = await initClient();
        setState({ client, error: null, isLoading: false, isInitialized: true });
      } catch (err) {
        const nextAttempt = attempt + 1;
        if (nextAttempt <= DEFAULT_RETRY_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, DEFAULT_RETRY_DELAY));
          return initialize(nextAttempt);
        }
        setState({
          client: null,
          error: err instanceof Error ? err : new Error("Failed to initialize Marketplace client"),
          isLoading: false,
          isInitialized: false,
        });
      } finally {
        isInitializingRef.current = false;
      }
    },
    [state.isInitialized, state.isLoading]
  );

  useEffect(() => {
    initialize();
  }, [initialize]);

  return useMemo(
    () => ({
      ...state,
      initialize,
    }),
    [state, initialize]
  );
}
