import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

import { CHART_COLORS, font } from '../utils';

import { ChartData } from '@src/store/overview';
import { useRootStore } from '@src/store/root';

// 定义图表显示模式
type ChartMode = 'revenue' | 'investment' | 'hours';

export const ProfitTrendChart = ({ data }: { data: ChartData['profit'] }) => {
  const { t } = useTranslation();
  const currencySymbol = useRootStore(s => s.currencySymbol);
  // 默认显示收益
  const [chartMode, setChartMode] = useState<ChartMode>('revenue');

  // 分段控制器选项
  const segments = [
    { label: t('home.profitTrend.legend.revenue'), value: 'revenue' },
    { label: t('home.profitTrend.legend.investment'), value: 'investment' },
    { label: t('home.profitTrend.legend.workHours'), value: 'hours' },
  ];

  // 获取当前显示的数据
  const getCurrentLine = () => {
    return [chartMode];
  };

  // 获取当前的Y轴格式化函数
  const getYAxisFormat = (value: string) => {
    return chartMode === 'hours' ? `${value}h` : `${currencySymbol}${value}`;
  };

  const visibleLine = getCurrentLine();

  return (
    <View className="mx-4 mb-4 rounded-lg bg-white p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-medium">
          {t('home.profitTrend.title')}
        </Text>
        {/* 添加分段控制器 */}
        <View className="w-48">
          <SegmentedControl
            values={segments.map(s => s.label)}
            selectedIndex={segments.findIndex(s => s.value === chartMode)}
            onChange={event => {
              const index = event.nativeEvent.selectedSegmentIndex;
              setChartMode(segments[index].value as ChartMode);
            }}
          />
        </View>
      </View>

      <View className="h-60">
        <CartesianChart
          data={data}
          xKey="day"
          yKeys={visibleLine}
          xAxis={{
            font,
            formatXLabel: label => `${label}`,
          }}
          yAxis={[
            {
              font,
              yKeys: visibleLine,
              formatYLabel: value => getYAxisFormat(value.toString()),
            },
          ]}>
          {({ points }) => {
            const color = CHART_COLORS[chartMode];
            return (
              <Line
                curveType="monotoneX"
                points={points[chartMode]}
                color={color}
                strokeWidth={2}
              />
            );
          }}
        </CartesianChart>
      </View>
    </View>
  );
};
