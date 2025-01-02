// 添加获取点颜色的函数
import { matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

export const BOSTON_MATRIX_COLORS = {
  yellow: '#FCD34D',
  green: '#34D399',
  red: '#F87171',
  blue: '#60A5FA',
};

export const getPointColor = (
  roi: number,
  workHours: number,
  medianHours: number,
  medianROI: number,
) => {
  const isHighROI = roi > medianROI;
  const isHighHours = workHours > medianHours;

  // 根据象限设置颜色
  if (isHighROI && isHighHours) return BOSTON_MATRIX_COLORS.green;
  if (isHighROI && !isHighHours) return BOSTON_MATRIX_COLORS.yellow;
  if (!isHighROI && isHighHours) return BOSTON_MATRIX_COLORS.blue;
  return BOSTON_MATRIX_COLORS.red;
};

const fontFamily = Platform.select({ ios: 'PingFang SC', default: 'serif' });
const fontStyle = {
  fontFamily,
  fontSize: 10,
  fontStyle: 'italic',
  fontWeight: 'bold',
};

export const font = matchFont(fontStyle as any);
export const font2 = matchFont({ ...fontStyle, fontSize: 14 } as any);

// 添加颜色常量
export const CHART_COLORS = {
  investment: '#F87171', // 柔和的红色
  revenue: '#34D399', // 柔和的绿色
  hours: '#60A5FA', // 柔和的蓝色
};
