// 进度指示器组件，显示当前是第几个问题
import React from 'react';
import { Text, View } from 'react-native';

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
}) => {
  return (
    <View className="flex-row items-center">
      <Text className="text-gray-500 text-sm">
        {current} OF {total}
      </Text>
    </View>
  );
};

export default ProgressIndicator;
