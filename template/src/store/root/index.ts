import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import Purchases, {
  CustomerInfo,
  PurchasesEntitlementInfo,
} from 'react-native-purchases';
import { create } from 'zustand';
import { createComputed } from 'zustand-computed';

import {
  CurrencyCode,
  MAIN_CURRENCIES,
} from '@src/components/currency/CurrencySelector';

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

/** 当前用户订阅状态信息 */
export interface UserSubscriptionInfo {
  /** 是否是订阅用户 */
  isSubscribed: boolean;
  /** 订阅到期时间 */
  subscriptionExpiryDate: Date | null;
}

export interface RootStore {
  /** 加载用户订阅状态信息 */
  loadSubscriptionInfo(): Promise<UserSubscriptionInfo>;
  /** 当前用户订阅状态信息 */
  userSubscriptionInfo: UserSubscriptionInfo;
  /** 更新用户订阅状态 */
  updateSubscriptionInfo(
    customerInfo: CustomerInfo,
  ): Promise<UserSubscriptionInfo>;
  init(): Promise<void>;
  themeMode: ThemeMode;
  /** 切换主题模式 */
  changeThemeMode(themeMode: ThemeMode): void;
  /** 当前时薪 */
  currentHourlyRate?: number;
  /** 去设置时薪 */
  changeHourlyRate(hourlyRate: number): void;
  /** 是否开启 iCloud 同步 */
  iCloudSync: boolean;
  /** 当前货币代码 */
  currencyCode: CurrencyCode;
  /** 设置货币代码 */
  setCurrencyCode: (code: CurrencyCode) => void;
  /** 是否开启自动备份 */
  autoBackup: boolean;
  /** 设置是否开启自动备份 */
  setAutoBackup: (enable: boolean) => void;
  /** 检查用户是否达到了项目数量上限 */
  hasReachedProjectLimit(currentProjectCount: number): boolean;
}

const LOCAL_STORAGE_KEY = '__LOCAL_SETTINGS__KEY__';

const DEFAULT_SETTINGS: Pick<
  RootStore,
  'themeMode' | 'currencyCode' | 'iCloudSync' | 'autoBackup'
> = {
  themeMode: ThemeMode.System,
  currencyCode: 'USD',
  iCloudSync: false,
  autoBackup: false,
};

type ComputedRootValues = {
  currencySymbol: string;
  currencyName: string;
  canAccessProFeature: boolean;
};

const computedRootValues = createComputed(
  (state: RootStore): ComputedRootValues => {
    const { currencyCode, userSubscriptionInfo } = state;
    const currency = MAIN_CURRENCIES.find(c => c.code === currencyCode);
    return {
      currencySymbol: currency?.symbol ?? '$',
      currencyName: currency?.name ?? 'USD',
      canAccessProFeature: userSubscriptionInfo.isSubscribed,
    };
  },
);

export const useRootStore = create<RootStore>()(
  computedRootValues((set, get) => ({
    ...DEFAULT_SETTINGS,

    init: async () => {
      get()
        .loadSubscriptionInfo()
        .catch(error => {
          console.error('Failed to load subscription info', error);
        });

      const settings = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        set({ ...parsedSettings });
      }
    },
    changeThemeMode: (themeMode: ThemeMode) => {
      set({ themeMode });
      AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ themeMode }));
    },
    changeHourlyRate: (hourlyRate: number) => {
      set({ currentHourlyRate: hourlyRate });
      AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(get()));
    },
    setCurrencyCode: (code: CurrencyCode) => {
      const currency = MAIN_CURRENCIES.find(c => c.code === code);
      if (currency) {
        set({ currencyCode: code });
        AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(get()));
      }
    },
    userSubscriptionInfo: {
      isSubscribed: false,
      subscriptionExpiryDate: null,
    },
    updateSubscriptionInfo: async (customerInfo: CustomerInfo) => {
      let userSubscriptionInfo: UserSubscriptionInfo = {
        isSubscribed: false,
        subscriptionExpiryDate: null,
      };
      const entitlement: PurchasesEntitlementInfo | undefined =
        customerInfo.entitlements.active['opb.pro'];
      // 更新订阅状态
      if (entitlement) {
        const expiryDate = entitlement.expirationDate;
        userSubscriptionInfo = {
          isSubscribed: true,
          subscriptionExpiryDate: expiryDate
            ? dayjs(expiryDate).toDate()
            : null,
        };
      }
      set({ userSubscriptionInfo: userSubscriptionInfo });

      return userSubscriptionInfo;
    },
    async loadSubscriptionInfo() {
      console.log('loadSubscriptionInfo start');
      const info = await Purchases.getCustomerInfo();
      console.log('loadSubscriptionInfo result', info);
      get().updateSubscriptionInfo(info);

      return get().userSubscriptionInfo;
    },
    setAutoBackup: (enable: boolean) => {
      set({ autoBackup: enable });
      AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(get()));
    },
    hasReachedProjectLimit: (currentProjectCount: number) => {
      const { userSubscriptionInfo } = get();
      // 非会员限制3个项目
      const PROJECT_LIMIT = 3;
      return (
        !userSubscriptionInfo.isSubscribed &&
        currentProjectCount >= PROJECT_LIMIT
      );
    },
  })),
);
