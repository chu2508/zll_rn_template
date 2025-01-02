import { clamp } from 'lodash';
import { Text, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

const getProgressColor = (progress: number) => {
  if (progress < 30) return '#EF4444'; // 红色
  if (progress < 50) return '#F59E0B'; // 橙色
  if (progress < 80) return '#3B82F6'; // 蓝色
  if (progress < 100) return '#10B981'; // 绿色
  return '#059669'; // 深绿色
};

export const CircleProgress = ({ progress }: { progress: number }) => {
  const p = clamp(progress, 0, 100);
  const size = 64;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (p / 100) * circumference;

  return (
    <View className="items-center justify-center">
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}>
        {/* 背景圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 进度圆环 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getProgressColor(progress)}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <View className="absolute items-center">
        <Text
          className="text-lg font-bold"
          style={{ color: getProgressColor(progress) }}>
          {progress}%
        </Text>
      </View>
    </View>
  );
};
