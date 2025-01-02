import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { TimeRange } from '@src/store/overview';

export const TimeRangeSelector = ({
  timeRange,
  currentDate,
  onPrevious,
  onNext,
}: {
  timeRange: TimeRange;
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}) => {
  const { t } = useTranslation();

  const getTimeRangeText = () => {
    const date = dayjs(currentDate);
    switch (timeRange) {
      case TimeRange.YEAR:
        return date.format(t('timeFormat.year'));
      case TimeRange.MONTH:
        return date.format(t('timeFormat.yearMonth'));
      case TimeRange.WEEK:
        const weekStart = date.startOf('week');
        const weekEnd = date.endOf('week');
        return `${weekStart.format(t('timeFormat.monthDay'))}-${weekEnd.format(
          t('timeFormat.monthDay'),
        )}`;
    }
  };

  return (
    <View className="mb-4 flex-row items-center justify-center bg-white py-2">
      <TouchableOpacity
        onPress={onPrevious}
        className="h-8 w-8 items-center justify-center rounded-full">
        <RemixIcon name="arrow-left-s-line" size={24} color="#374151" />
      </TouchableOpacity>
      <Text className="mx-4 text-base font-medium">{getTimeRangeText()}</Text>
      <TouchableOpacity
        onPress={onNext}
        className="h-8 w-8 items-center justify-center rounded-full">
        <RemixIcon name="arrow-right-s-line" size={24} color="#374151" />
      </TouchableOpacity>
    </View>
  );
};
