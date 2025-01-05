import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import RemixIcon, { RemixIconNames } from '@ui/icon/Remix';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  ScrollView,
  Share,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Mailer from 'react-native-mail';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import packageJson from '../../../package.json';

import { showToast } from '@src/components/common/Toast';
import { CurrencySelector } from '@src/components/currency/CurrencySelector';
import { getLanguage } from '@src/i18n/language';
import { RootRouterParams } from '@src/navigation/types';
import { useRootStore } from '@src/store/root';

const LanguageList = {
  'zh-Hans': '简体中文',
  'zh-Hant': '繁体中文',
  en: 'English',
  ja: '日本語',
};

// 定义设置项类型
type SettingItem = {
  icon: RemixIconNames;
  title: string;
  value?: string | boolean;
  onPress?: () => void;
  type?: 'switch' | 'arrow' | 'value';
};

// 定义设置分组类型
type SettingGroup = {
  title: string;
  items: SettingItem[];
};

type Props = StackScreenProps<RootRouterParams>;

const SubscriptionCard = () => {
  const cardWidth = useWindowDimensions().width - 32;
  const cardHeight = 100;
  const navigation = useNavigation<Props['navigation']>();
  const userSubscriptionInfo = useRootStore(s => s.userSubscriptionInfo);
  const { t } = useTranslation();

  return (
    <View className="mx-4 mt-4 overflow-hidden rounded-lg">
      {/* 渐变背景 */}
      <Svg
        style={{ position: 'absolute' }}
        width={cardWidth}
        height={cardHeight}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor={
                userSubscriptionInfo.isSubscribed ? '#10B981' : '#3B82F6'
              }
              stopOpacity="1"
            />
            <Stop
              offset="100%"
              stopColor={
                userSubscriptionInfo.isSubscribed ? '#059669' : '#8B5CF6'
              }
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={cardWidth}
          height={cardHeight}
          fill="url(#gradient)"
          rx={8}
          ry={8}
        />
      </Svg>

      {/* 卡片内容 */}
      <View className="p-4" style={{ height: cardHeight }}>
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center">
              <Text className="text-lg font-medium text-white">
                {userSubscriptionInfo.isSubscribed
                  ? t('profile.subscription.pro')
                  : t('profile.subscription.free')}
              </Text>
              {userSubscriptionInfo.isSubscribed && (
                <View className="ml-2 rounded-full bg-white/20 px-2 py-0.5">
                  <Text className="text-xs text-white">
                    {t('profile.subscription.subscribed')}
                  </Text>
                </View>
              )}
            </View>
            <Text className="mt-1 text-sm text-white/80">
              {userSubscriptionInfo.isSubscribed
                ? userSubscriptionInfo.subscriptionExpiryDate
                  ? t('profile.subscription.validUntil', {
                      date: dayjs(
                        userSubscriptionInfo.subscriptionExpiryDate,
                      ).format(t('timeFormat.date')),
                    })
                  : t('profile.subscription.permanent')
                : t('profile.subscription.upgradeHint')}
            </Text>
          </View>
          {!userSubscriptionInfo.isSubscribed && (
            <TouchableOpacity
              className="rounded-full bg-white/20 px-4 py-2"
              onPress={() => {
                navigation.navigate('Paywall');
              }}>
              <Text className="font-medium text-white">立即升级</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export function ProfileScreen() {
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const currencySymbol = useRootStore(s => s.currencySymbol);
  const currencyCode = useRootStore(s => s.currencyCode);
  const setCurrencyCode = useRootStore(s => s.setCurrencyCode);
  const autoBackup = useRootStore(s => s.autoBackup);
  const setAutoBackup = useRootStore(s => s.setAutoBackup);
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  // 设置分组数据
  const settingGroups: SettingGroup[] = [
    {
      title: t('profile.groups.preferences'),
      items: [
        {
          icon: 'translate-2',
          title: t('profile.items.language'),
          value: LanguageList[getLanguage() as keyof typeof LanguageList],
          type: 'arrow',
          onPress: () => {
            // 打开语言选择
            // iOS 系统设置的 URL
            const url = 'App-Prefs:com.lurenotes.opb.app&path=LANGUAGE';

            Linking.openURL(url).catch(err => {
              console.error('无法打开系统语言设置:', err); // 捕获并打印错误
            });
          },
        },
        // {
        //   icon: 'contrast-2-line',
        //   title: '外观',
        //   value:
        //     themeMode === ThemeMode.System
        //       ? '跟随系统'
        //       : themeMode === ThemeMode.Dark
        //         ? '深色'
        //         : '浅色',
        //   type: 'arrow',
        //   onPress: () => {
        //     // 打开主题选择
        //   },
        // },
        {
          icon: 'money-cny-circle-line',
          title: t('profile.items.currency'),
          value: currencySymbol,
          type: 'arrow',
          onPress: () => {
            setCurrencyModalVisible(true);
          },
        },
        // {
        //   icon: 'time-line',
        //   title: '时薪设置',
        //   value: `${currencySymbol}${hourlyRate}/时`,
        //   type: 'arrow',
        //   onPress: () => {
        //     // 打开时薪设置
        //   },
        // },
      ],
    },
    {
      title: t('profile.groups.dataManagement'),
      items: [
        {
          icon: 'export-line',
          title: t('profile.items.dataExport'),
          type: 'arrow',
          onPress() {
            navigation.navigate('DataExport');
          },
        },
        // {
        //   icon: 'cloud-line',
        //   title: 'iCloud 自动备份',
        //   type: 'switch',
        //   value: autoBackup,
        //   onPress: () => setAutoBackup(!autoBackup),
        // },
        // {
        //   icon: 'refresh-line',
        //   title: '手动同步数据',
        //   type: 'arrow',
        //   onPress: () => {
        //     navigation.navigate('DataSync');
        //   },
        // },
        // {
        //   icon: 'notification-4-line',
        //   title: '通知提醒',
        //   type: 'switch',
        //   value: notifications,
        //   onPress: () => setNotifications(!notifications),
        // },
      ],
    },
    {
      title: t('profile.groups.support'),
      items: [
        {
          icon: 'star-line',
          title: t('profile.items.rateApp'),
          type: 'arrow',
          onPress: () => {
            // 打开应用商店评分
            Linking.openURL('https://apps.apple.com/app/id6739137602');
          },
        },
        {
          icon: 'share-line',
          title: t('profile.items.shareApp.title'),
          type: 'arrow',
          onPress: async () => {
            try {
              const result = await Share.share({
                message:
                  'OnePersonBusiness 是一款帮助个人创业者管理财务和业务的应用。',
                url: 'https://apps.apple.com/app/id6739137602',
                title: 'OnePersonBusiness',
              });
              if (result.action === Share.sharedAction) {
                if (result.activityType) {
                  console.log('分享成功，活动类型:', result.activityType);
                } else {
                  console.log('分享成功');
                }
              } else if (result.action === Share.dismissedAction) {
                console.log('分享面板已关闭');
              }
            } catch (error) {
              console.error('分享失败:', error); // 捕获并打印错误
            }
          },
        },
        {
          icon: 'feedback-line',
          title: t('profile.items.feedback.title'),
          type: 'arrow',
          onPress: () => {
            // 打开反馈页面
            Mailer.mail(
              {
                subject: t('profile.items.feedback.subject'),
                recipients: ['lurenotes@163.com'],
                body: t('profile.items.feedback.body'),
              },
              error => {
                if (error) {
                  console.error('send email error', error);
                  showToast(t('profile.items.feedback.error'));
                } else {
                  showToast(t('profile.items.feedback.success'));
                }
              },
            );
          },
        },
      ],
    },
    {
      title: t('profile.groups.followUs'),
      items: [
        {
          icon: 'red-packet-line',
          title: t('profile.items.redBook'),
          value: '@狄拉克的涟漪',
          type: 'arrow',
          onPress: async () => {
            // 打开小红书主页
            const canOpenXhs = await Linking.canOpenURL('xhsdiscover://');
            console.log('canOpenXhs', canOpenXhs);
            if (canOpenXhs) {
              Linking.openURL('xhsdiscover://user/5eafa5050000000001000d79');
            } else {
              Linking.openURL(
                'https://www.xiaohongshu.com/user/profile/5eafa5050000000001000d79',
              );
            }
          },
        },
      ],
    },
  ];

  // 渲染设置项
  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.title}
        className="flex-row items-center justify-between py-3"
        onPress={item.onPress}
        disabled={item.type === 'value'}>
        <View className="flex-row items-center">
          <RemixIcon
            name={item.icon as RemixIconNames}
            size={20}
            className="text-gray-600"
          />
          <Text className="ml-3 text-base">{item.title}</Text>
        </View>
        <View className="flex-row items-center">
          {item.type === 'switch' ? (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onPress}
              className="ml-2"
            />
          ) : item.type === 'arrow' ? (
            <>
              {item.value && (
                <Text className="mr-2 text-gray-500">{item.value}</Text>
              )}
              <RemixIcon name="arrow-right-s-line" size={20} color="#9CA3AF" />
            </>
          ) : (
            <Text className="text-gray-500">{item.value}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ScrollView className="flex-1">
        <SubscriptionCard />
        {/* 设置分组 */}
        {settingGroups.map(group => (
          <View key={group.title} className="mx-4 mt-4 rounded-lg bg-white p-4">
            <Text className="mb-2 text-base font-medium">{group.title}</Text>
            {group.items.map((item, index) => (
              <View key={item.title}>
                {renderSettingItem(item)}
                {index < group.items.length - 1 && (
                  <View className="h-[1px] bg-gray-100" />
                )}
              </View>
            ))}
          </View>
        ))}

        {/* 底部版本信息 */}
        <View className="my-8 items-center">
          <Text className="text-sm text-gray-400">
            {t('profile.version', { version: packageJson.version })}
          </Text>
        </View>
      </ScrollView>

      <CurrencySelector
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
        selectedCode={currencyCode}
        onSelect={currency => {
          setCurrencyCode(currency.code);
        }}
      />
    </>
  );
}
