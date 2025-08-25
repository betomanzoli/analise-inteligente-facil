
import { useState, useCallback } from 'react';

export const useFileHash = () => {
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateHash = useCallback(async (file: File): Promise<string> => {
    setIsCalculating(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return {
    calculateHash,
    isCalculating
  };
};
