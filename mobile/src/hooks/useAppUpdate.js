import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import logger from '../utils/logger';

export default function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      if (__DEV__ || !Updates.isEnabled) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          setUpdateAvailable(true);
        }
      } catch (err) {
        logger.warn('[Update] Check failed', err);
      }
    })();
  }, []);

  const applyUpdate = async () => {
    await Updates.reloadAsync();
  };

  return { updateAvailable, applyUpdate };
}
