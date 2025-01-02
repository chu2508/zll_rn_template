import { useEffect } from 'react';
import Purchases from 'react-native-purchases';

import { useRootStore } from '@src/store/root';

export const useInitApp = () => {
  useEffect(() => {
    async function init() {
      await Purchases.setLogLevel(Purchases.LOG_LEVEL.INFO);
      await Purchases.setProxyURL('https://api.rc-backup.com/');
      await Purchases.configure({
        apiKey: 'appl_cseeSrnAnrlwUnhCuhrjyoWNYDJ',
      });
      Purchases.getOfferings().then(offerings => {
        console.log('offerings', offerings);
      });
      await useRootStore.getInitialState().init();
    }

    init();
  }, []);
};
