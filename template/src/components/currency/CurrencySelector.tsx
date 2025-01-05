import RemixIcon from '@ui/icon/Remix';
import { t } from 'i18next';
import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// 定义主要货币数据
export const MAIN_CURRENCIES = [
  { code: 'CNY', symbol: '¥', name: '人民币' },
  { code: 'USD', symbol: '$', name: '美元' },
  { code: 'EUR', symbol: '€', name: '欧元' },
  { code: 'GBP', symbol: '£', name: '英镑' },
  { code: 'JPY', symbol: '¥', name: '日元' },
  { code: 'KRW', symbol: '₩', name: '韩元' },
  { code: 'HKD', symbol: 'HK$', name: '港币' },
  { code: 'TWD', symbol: 'NT$', name: '新台币' },
  { code: 'SGD', symbol: 'S$', name: '新加坡元' },
  { code: 'AUD', symbol: 'A$', name: '澳元' },
  { code: 'CAD', symbol: 'C$', name: '加元' },
  { code: 'CHF', symbol: 'Fr', name: '瑞士法郎' },
] as const;

export type CurrencyCode = (typeof MAIN_CURRENCIES)[number]['code'];

type CurrencySelectorProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: (typeof MAIN_CURRENCIES)[number]) => void;
  selectedCode: CurrencyCode;
};

export function CurrencySelector({
  visible,
  onClose,
  onSelect,
  selectedCode,
}: CurrencySelectorProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-xl bg-white">
          {/* 头部 */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text className="text-base font-medium">
              {t('common.picker.currency')}
            </Text>
            <View className="w-8" />
          </View>

          {/* 货币列表 */}
          <ScrollView className="max-h-96">
            {MAIN_CURRENCIES.map(currency => (
              <TouchableOpacity
                key={currency.code}
                className="flex-row items-center justify-between border-b border-gray-100 p-4"
                onPress={() => {
                  onSelect(currency);
                  onClose();
                }}>
                <View className="flex-row items-center">
                  <Text className="mr-2 text-lg font-medium">
                    {currency.symbol}
                  </Text>
                  <View>
                    <Text className="text-base">{currency.code}</Text>
                  </View>
                </View>
                {selectedCode === currency.code && (
                  <RemixIcon name="check-line" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 底部安全区域 */}
          <View className="h-8" />
        </View>
      </View>
    </Modal>
  );
}
