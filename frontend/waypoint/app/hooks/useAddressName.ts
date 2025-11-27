import { useState, useEffect } from 'react';
import { BlockchainNetwork } from '../contexts/NetworkContext';
import { resolveAddressToName } from '../components/RouteCreationWizard/addressUtils';

export interface AddressNameData {
  name: string | null;
  loading: boolean;
  error: string | null;
}

export function useAddressName(address: string | null, network: BlockchainNetwork | null): AddressNameData {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      if (!address || !network) {
        setName(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const resolvedName = await resolveAddressToName(address, network);
        setName(resolvedName);
      } catch (err) {
        console.error(`Failed to resolve name for address ${address} on ${network}:`, err);
        setError('Failed to resolve name');
        setName(null);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchName, 300); // Debounce to avoid excessive API calls
    return () => clearTimeout(timeoutId);
  }, [address, network]);

  return { name, loading, error };
}

