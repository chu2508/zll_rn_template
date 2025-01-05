import { useNavigation } from '@react-navigation/native';
import RemixIcon, { RemixIconNames } from '@ui/icon/Remix';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Purchases, {
  PACKAGE_TYPE,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

import { showToast } from '@src/components/common/Toast';
import { useRootStore } from '@src/store/root';

const getPeriod = (packageType: string) => {
  return packageType === PACKAGE_TYPE.ANNUAL
    ? t('common.time.year')
    : t('common.time.month');
};

const FeatureItem = ({
  title,
  description,
  icon,
  highlight,
}: {
  title: string;
  description: string;
  icon: RemixIconNames;
  highlight?: boolean;
}) => (
  <View className="mb-4 flex-row items-center">
    <View
      className={`h-8 w-8 items-center justify-center rounded-lg ${
        highlight ? 'bg-blue-100' : 'bg-gray-50'
      }`}>
      <RemixIcon
        name={icon}
        size={20}
        color={highlight ? '#3B82F6' : '#6B7280'}
      />
    </View>
    <View className="ml-3 flex-1">
      <Text className="text-base font-medium">{title}</Text>
      <Text className="text-sm text-gray-500">{description}</Text>
    </View>
  </View>
);

// 添加包类型定义
type PackageType = 'lifetime' | 'annual' | 'monthly';

// 修改包分类函数的排序逻辑
const getPackageType = (pkg: PurchasesPackage): PackageType => {
  if (pkg.packageType === PACKAGE_TYPE.ANNUAL) return 'annual';
  if (pkg.packageType === PACKAGE_TYPE.MONTHLY) return 'monthly';
  return 'lifetime'; // LIFETIME 放在最后
};

const PackageCard = ({
  pkg,
  isSelected,
  onSelect,
  discount,
  isPopular,
}: {
  pkg: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  discount?: string;
  isPopular?: boolean;
}) => {
  const { t } = useTranslation();
  const type = getPackageType(pkg);

  const monthlyPrice =
    pkg.packageType === PACKAGE_TYPE.ANNUAL
      ? pkg.product.pricePerMonthString
      : undefined;

  return (
    <TouchableOpacity
      activeOpacity={1}
      className={`mr-4 w-[260px] rounded-2xl border-2 p-4 ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white/80'
      }`}
      onPress={onSelect}>
      <View className="flex-row items-center justify-between">
        <View>
          <View className="flex-row items-center">
            <Text className="text-lg font-bold">
              {t(`paywall.package.${type}`)}
            </Text>
            {isPopular && (
              <View className="ml-2 rounded-full bg-blue-500 px-2 py-0.5">
                <Text className="text-xs text-white">
                  {t('paywall.package.popular')}
                </Text>
              </View>
            )}
          </View>
          {discount && (
            <View className="mt-1 rounded-full bg-red-500 px-2 py-0.5">
              <Text className="text-xs text-white">{discount}</Text>
            </View>
          )}
        </View>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full border ${
            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
          }`}>
          {isSelected && <RemixIcon name="check-line" size={16} color="#FFF" />}
        </View>
      </View>
      <View className="mt-3 flex-row items-baseline">
        <Text className="text-2xl font-bold">{pkg.product.priceString}</Text>
        {type !== 'lifetime' && (
          <Text className="ml-1 text-gray-500">
            /{getPeriod(pkg.packageType)}
          </Text>
        )}
      </View>
      {monthlyPrice && (
        <Text className="mt-1 text-sm text-gray-500">
          ≈ {monthlyPrice}/{t('common.time.month')}
        </Text>
      )}
      {type !== 'lifetime' && (
        <Text className="mt-2 text-sm text-blue-500">
          {t('paywall.package.trial', { days: 7 })}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export function PaywallScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const updateSubscriptionInfo = useRootStore(s => s.updateSubscriptionInfo);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);

  useEffect(() => {
    loadOfferings();
    useRootStore.getState().loadSubscriptionInfo();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOffering(offerings.current);
        let selected = offerings.current.annual;
        if (!selected) {
          selected = offerings.current.availablePackages[0];
        }
        setSelectedPackage(selected);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const info = await updateSubscriptionInfo(customerInfo);
      // 更新状态
      if (info.isSubscribed) {
        showToast('订阅成功！');
        navigation.goBack();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('订阅失败', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      const info = await updateSubscriptionInfo(customerInfo);

      // 更新订阅状态
      if (info.isSubscribed) {
        showToast('恢复订阅成功！');
        navigation.goBack();
      } else {
        Alert.alert('提示', '未找到可恢复的订阅');
      }
    } catch (error: any) {
      Alert.alert('恢复失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 修改包的排序逻辑
  const sortedPackages = offering?.availablePackages.sort((a, b) => {
    const typeOrder = { annual: 0, monthly: 1, lifetime: 2 }; // 调整顺序权重
    return typeOrder[getPackageType(a)] - typeOrder[getPackageType(b)];
  });

  // 添加 ScrollView 引用
  const scrollViewRef = React.useRef<ScrollView>(null);
  // 获取屏幕宽度
  const screenWidth = Dimensions.get('window').width;

  // 处理包选择，包括滚动到中间
  const handlePackageSelect = (pkg: PurchasesPackage, index: number) => {
    setSelectedPackage(pkg);

    // 计算滚动位置
    const cardWidth = 260; // 卡片宽度
    const cardMargin = 16; // 卡片右边距
    const paddingLeft = 16; // 左侧内边距

    // 目标位置：让选中的卡片居中
    const targetPosition =
      index * (cardWidth + cardMargin) -
      (screenWidth - cardWidth) / 2 +
      paddingLeft;

    // 使用 scrollTo 平滑滚动到目标位置
    scrollViewRef.current?.scrollTo({
      x: Math.max(0, targetPosition),
      animated: true,
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View className="p-6">
          <Text className="text-center text-2xl font-bold">
            {t('paywall.title')}
          </Text>
          <Text className="mt-2 text-center text-base text-gray-500">
            {t('paywall.subtitle')}
          </Text>
        </View>

        {/* 订阅选项 - 添加 ref 和调整滚动行为 */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-6"
          decelerationRate="normal" // 移除 fast 使滚动更自然
          contentContainerStyle={{
            paddingRight: 20,
          }}>
          {sortedPackages?.map((pkg, index) => {
            const type = getPackageType(pkg);
            return (
              <PackageCard
                key={pkg.identifier}
                pkg={pkg}
                isSelected={selectedPackage?.identifier === pkg.identifier}
                onSelect={() => handlePackageSelect(pkg, index)}
                discount={
                  type === 'annual'
                    ? t('paywall.package.discount', { value: 66 })
                    : undefined
                }
                isPopular={type === 'annual'}
              />
            );
          })}
        </ScrollView>

        {/* 功能列表 */}
        <View className="mt-6 px-6">
          <Text className="mb-4 text-lg font-bold">
            {t('paywall.features.title')}
          </Text>
          <FeatureItem
            icon="infinity-line"
            title={t('paywall.features.unlimited.title')}
            description={t('paywall.features.unlimited.description')}
            highlight
          />
          <FeatureItem
            icon="line-chart-line"
            title={t('paywall.features.stats.title')}
            description={t('paywall.features.stats.description')}
            highlight
          />
          {/* <FeatureItem
            icon="calendar-todo-line"
            title={t('paywall.features.todo.title')}
            description={t('paywall.features.todo.description')}
            highlight
          />
          <FeatureItem
            icon="cloud-line"
            title={t('paywall.features.sync.title')}
            description={t('paywall.features.sync.description')}
            highlight
          /> */}
        </View>

        {/* 订阅须知 */}
        <View className="mt-6 px-6">
          <Text className="mb-2 text-xs text-gray-400">
            {t('paywall.terms.notice')}
          </Text>
          <Text className="text-xs leading-5 text-gray-400">
            {t('paywall.terms.details')}
          </Text>
        </View>

        {/* 底部链接 */}
        <View className="mt-4 flex-row justify-center gap-4 space-x-4 pb-32">
          <Text className="text-xs text-gray-400" onPress={() => {}}>
            {t('paywall.links.terms')}
          </Text>
          <Text className="text-xs text-gray-400" onPress={() => {}}>
            {t('paywall.links.privacy')}
          </Text>
          <Text className="text-xs text-gray-400" onPress={handleRestore}>
            {t('paywall.links.restore')}
          </Text>
        </View>
        <View className="h-10" />
      </ScrollView>

      {/* 底部购买按钮 */}
      <View className="absolute bottom-0 w-full bg-white p-4 pb-8 shadow-lg">
        <Text className="mb-2 text-center text-sm text-gray-500">
          {selectedPackage
            ? getPackageType(selectedPackage) === 'lifetime'
              ? t('paywall.cta.lifetime')
              : t('paywall.cta.trial', {
                  days: 7,
                  period: getPeriod(selectedPackage.packageType),
                })
            : t('paywall.cta.select')}
        </Text>
        <TouchableOpacity
          className={`rounded-xl p-4 ${
            selectedPackage ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          disabled={!selectedPackage}
          onPress={() => selectedPackage && handlePurchase(selectedPackage)}>
          <Text className="text-center font-medium text-white">
            {selectedPackage ? t('paywall.cta.start') : t('paywall.cta.choose')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
