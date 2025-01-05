import { Text, View } from 'react-native';

import { ProjectStatus, ProjectStatusNames } from '@src/orm/models/project';

const getBgColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.PLANNING:
      return 'bg-blue-100';
    case ProjectStatus.DEVELOPING:
      return 'bg-yellow-100';
    case ProjectStatus.OPERATING:
      return 'bg-green-100';
    case ProjectStatus.ARCHIVED:
      return 'bg-gray-100';
  }
};

const getTextColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.PLANNING:
      return 'text-blue-800';
    case ProjectStatus.DEVELOPING:
      return 'text-yellow-800';
    case ProjectStatus.OPERATING:
      return 'text-green-800';
    case ProjectStatus.ARCHIVED:
      return 'text-gray-800';
  }
};
export const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  return (
    <View className={`rounded-full px-2 py-1 ${getBgColor(status)}`}>
      <Text className={`text-xs ${getTextColor(status)}`}>
        {ProjectStatusNames[status]}
      </Text>
    </View>
  );
};
