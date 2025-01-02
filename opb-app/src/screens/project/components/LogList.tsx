import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Log } from '@src/orm/models/log';
import { useRootStore } from '@src/store/root';

type Props = {
  logs: Log[];
};

export function LogList({ logs }: Props) {
  const { t } = useTranslation();
  const currencySymbol = useRootStore(s => s.currencySymbol);

  return (
    <View className="rounded-lg p-4">
      {logs.length === 0 ? (
        <View className="items-center py-8">
          <Text className="text-gray-500">{t('project.log.list.empty')}</Text>
        </View>
      ) : (
        logs
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map(log => (
            <View
              key={log.id}
              className="mb-4 border-l-2 border-blue-500 bg-white pl-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">
                  {dayjs(log.createdAt).format(t('timeFormat.dateTime'))}
                </Text>
              </View>

              {/* 工时、投资、收益信息 */}
              <View className="mb-2 flex-row flex-wrap">
                {log.workHours && (
                  <View className="mr-4 flex-row items-center">
                    <RemixIcon name="time-line" size={16} color="#6B7280" />
                    <Text className="ml-1 text-gray-600">
                      {t('project.log.list.workHours', {
                        hours: log.workHours,
                      })}
                    </Text>
                  </View>
                )}
                {log.investment && (
                  <View className="mr-4 flex-row items-center">
                    <RemixIcon
                      name="money-cny-circle-line"
                      size={16}
                      color="#6B7280"
                    />
                    <Text className="ml-1 text-gray-600">
                      {t('project.log.list.investment', {
                        symbol: currencySymbol,
                        amount: log.investment,
                      })}
                    </Text>
                  </View>
                )}
                {log.revenue && (
                  <View className="flex-row items-center">
                    <RemixIcon name="funds-line" size={16} color="#10B981" />
                    <Text className="ml-1 text-green-600">
                      {t('project.log.list.revenue', {
                        symbol: currencySymbol,
                        amount: log.revenue,
                      })}
                    </Text>
                  </View>
                )}
              </View>

              {/* 备注信息 */}
              {log.remark && (
                <Text className="text-sm text-gray-500">{log.remark}</Text>
              )}
            </View>
          ))
      )}
    </View>
  );
}
