import RemixIcon, { RemixIconNames } from '@ui/icon/Remix';
import React from 'react';
import { Text, View } from 'react-native';

type EmptyViewProps = {
  icon?: RemixIconNames;
  title?: string;
  description?: string;
};

export function EmptyView({
  icon = 'inbox-line',
  title = '暂无数据',
  description = '快去添加一些内容吧',
}: EmptyViewProps) {
  return (
    <View className="my-8 items-center justify-center">
      <RemixIcon name={icon} size={48} color="#9CA3AF" />
      <Text className="mt-4 text-base font-medium text-gray-600">{title}</Text>
      <Text className="mt-1 text-sm text-gray-400">{description}</Text>
    </View>
  );
}
