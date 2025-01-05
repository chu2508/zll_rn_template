import { BlurView } from '@react-native-community/blur';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { t } from 'i18next';
import { useCallback, useLayoutEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { BostonMatrixChart } from './components/BostonMatrixChart';
import { OverviewStatsCard } from './components/OverviewStatsCard';
import { ProfitTrendChart } from './components/ProfitTrendChart';
import { TimeRangeSelector } from './components/TimeRangeSelector';

import { RootRouterParams } from '@src/navigation/types';
import { TimeRange, useOverviewStore } from '@src/store/overview/index';
import { useResourceStore } from '@src/store/resource/resource';
import { useRootStore } from '@src/store/root';

type Props = StackNavigationProp<RootRouterParams>;

const timeOptions = [
  { label: t('common.time.year'), value: TimeRange.YEAR },
  { label: t('common.time.month'), value: TimeRange.MONTH },
  { label: t('common.time.week'), value: TimeRange.WEEK },
];

export function HomeScreen() {
  const navigation = useNavigation<Props>();

  const selectedTimeRange = useOverviewStore(s => s.timeRange);
  const currentDate = useOverviewStore(s => s.currentDate);
  const setTimeRange = useOverviewStore(s => s.setTimeRange);
  const chartData = useOverviewStore(s => s.chartData);
  const initOverview = useOverviewStore(s => s.initOverview);
  const bostonMatrix = useResourceStore(s => s.bostonMatrix);
  const canAccessProFeature = useRootStore(s => s.canAccessProFeature);

  useFocusEffect(
    useCallback(() => {
      initOverview();
    }, [initOverview]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View className="w-60">
          <SegmentedControl
            values={timeOptions.map(({ label }) => label)}
            selectedIndex={timeOptions.findIndex(
              ({ value }) => value === selectedTimeRange,
            )}
            onChange={event => {
              const index = event.nativeEvent.selectedSegmentIndex;
              setTimeRange(timeOptions[index].value);
            }}
          />
        </View>
      ),
    });
  }, [navigation, selectedTimeRange, setTimeRange]);

  const handlePrevious = useOverviewStore(s => s.previous);
  const handleNext = useOverviewStore(s => s.next);

  const proTipsNode = (
    <BlurView
      blurType="dark"
      blurAmount={10}
      className="z-100 absolute bottom-0 left-0 right-0 top-0 bg-transparent">
      <TouchableOpacity
        onPress={() => navigation.navigate('Paywall')}
        className="h-full w-full items-center justify-center">
        <View className="rounded-lg p-4">
          <Text className="text-center text-base font-medium text-white">
            {t('subscription.yearly_view_locked')}
          </Text>
        </View>
      </TouchableOpacity>
    </BlurView>
  );

  const contentNode = (
    <ScrollView
      className="absolute h-full"
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[0]}>
      {/* 时间范围切换 */}
      <TimeRangeSelector
        timeRange={selectedTimeRange}
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      {/* 合并后的概览统计 */}
      <OverviewStatsCard />
      {/* 项目投入产出分析 */}
      <BostonMatrixChart matrix={bostonMatrix} />
      {/* 收益趋势图表 */}
      <ProfitTrendChart data={chartData.profit} />
    </ScrollView>
  );

  return (
    <>
      {contentNode}
      {!canAccessProFeature && selectedTimeRange === TimeRange.YEAR
        ? proTipsNode
        : null}
    </>
  );
}
