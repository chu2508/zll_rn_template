import dayjs from 'dayjs';
import { Dimensions, Text, View } from 'react-native';

import { SearchBar } from './SearchBar';

type UserPoolType = '应用' | '社群' | '平台';

type BaseUserPool = {
  id: string;
  name: string;
  type: UserPoolType;
  lastUpdated: Date;
  description?: string;
};

type AppUserPool = BaseUserPool & {
  type: '应用';
  userCount: number;
  activeCount: number;
};

type CommunityUserPool = BaseUserPool & {
  type: '社群';
  memberCount: number;
};

type PlatformUserPool = BaseUserPool & {
  type: '平台';
  platform: string;
  followerCount: number;
};

type UserPool = AppUserPool | CommunityUserPool | PlatformUserPool;

const WindowWidth = Dimensions.get('window').width;

const StatItem = ({ count, label }: { count: number; label: string }) => {
  return (
    <View className="basis-1/3 items-center">
      <Text className="text-2xl font-bold">{count}</Text>
      <Text className="text-sm">{label}</Text>
    </View>
  );
};

const UserPoolCard = (props: Omit<UserPool, 'id'>) => {
  const renderStats = () => {
    if (props.type === '应用') {
      return (
        <View className="mt-4 flex-row justify-between">
          <View>
            <Text className="text-2xl font-bold">{props.userCount}</Text>
            <Text className="text-sm text-gray-500">用户总数</Text>
          </View>
          <View>
            <Text className="text-2xl font-bold">{props.activeCount}</Text>
            <Text className="text-sm text-gray-500">活跃用户</Text>
          </View>
          <View>
            <Text className="text-2xl font-bold">
              {Math.round((props.activeCount / props.userCount) * 100)}%
            </Text>
            <Text className="text-sm text-gray-500">活跃率</Text>
          </View>
        </View>
      );
    }

    return (
      <View className="mt-4 flex-row justify-start">
        <View>
          <Text className="text-2xl font-bold">
            {props.type === '社群' ? props.memberCount : props.followerCount}
          </Text>
          <Text className="text-sm text-gray-500">
            {props.type === '社群' ? '成员数' : '粉丝数'}
          </Text>
        </View>
      </View>
    );
  };

  // 为应用类型使用全宽卡片，为其他类型使用半宽卡片
  const cardClassName = `${
    props.type === '应用' ? 'mx-4' : ''
  } mb-4 rounded-lg bg-white p-4`;

  return (
    <View
      className={cardClassName}
      style={{
        width: props.type !== '应用' ? WindowWidth / 2 - 24 : undefined,
      }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold" numberOfLines={1}>
          {props.name}
        </Text>
        <View
          className={`rounded-full px-2 py-1 ${
            props.type === '应用'
              ? 'bg-blue-100'
              : props.type === '社群'
                ? 'bg-green-100'
                : 'bg-purple-100'
          }`}>
          <Text
            className={`text-xs ${
              props.type === '应用'
                ? 'text-blue-800'
                : props.type === '社群'
                  ? 'text-green-800'
                  : 'text-purple-800'
            }`}>
            {props.type}
            {props.type === '平台' ? ` · ${props.platform}` : ''}
          </Text>
        </View>
      </View>

      {props.description && (
        <Text className="mt-2 text-sm text-gray-600" numberOfLines={2}>
          {props.description}
        </Text>
      )}

      {renderStats()}

      <Text className="mt-4 text-xs text-gray-500">
        最后更新：{dayjs(props.lastUpdated).format('MM月DD日 HH:mm')}
      </Text>
    </View>
  );
};

const UserPoolStats = ({
  appUsers,
  communityMembers,
  platformFollowers,
}: {
  appUsers: { total: number; active: number };
  communityMembers: number;
  platformFollowers: number;
}) => {
  const totalUsers = appUsers.total + communityMembers + platformFollowers;

  return (
    <View className="flex-row py-4">
      <StatItem count={totalUsers} label="总用户" />
      <StatItem count={appUsers.active} label="活跃用户" />
      <StatItem count={communityMembers + platformFollowers} label="粉丝用户" />
    </View>
  );
};

export function UserPoolListView() {
  // 示例用户池数据
  const userPools: UserPool[] = [
    {
      id: '1',
      name: '主应用用户',
      type: '应用',
      userCount: 1500,
      activeCount: 800,
      lastUpdated: new Date(),
      description: '应用内注册的用户',
    },
    {
      id: '2',
      name: '核心用户群',
      type: '社群',
      memberCount: 500,
      lastUpdated: new Date(),
      description: 'VIP用户交流群',
    },
    {
      id: '3',
      name: '微博账号',
      type: '平台',
      platform: '微博',
      followerCount: 500,
      lastUpdated: new Date(),
    },
  ];

  // 计算统计数据
  const appUsers = {
    total: userPools
      .filter((pool): pool is AppUserPool => pool.type === '应用')
      .reduce((sum, pool) => sum + pool.userCount, 0),
    active: userPools
      .filter((pool): pool is AppUserPool => pool.type === '应用')
      .reduce((sum, pool) => sum + pool.activeCount, 0),
  };

  const communityMembers = userPools
    .filter((pool): pool is CommunityUserPool => pool.type === '社群')
    .reduce((sum, pool) => sum + pool.memberCount, 0);

  const platformFollowers = userPools
    .filter((pool): pool is PlatformUserPool => pool.type === '平台')
    .reduce((sum, pool) => sum + pool.followerCount, 0);

  // 分离应用和其他类型的用户池
  const appPools = userPools.filter(pool => pool.type === '应用');
  const otherPools = userPools.filter(pool => pool.type !== '应用');

  return (
    <>
      <SearchBar />
      <UserPoolStats
        appUsers={appUsers}
        communityMembers={communityMembers}
        platformFollowers={platformFollowers}
      />
      {/* 应用类型用户池 */}
      {appPools.map(pool => (
        <UserPoolCard key={pool.id} {...pool} />
      ))}

      {/* 社群和平台类型用户池 */}
      <View className="mx-4 flex-row flex-wrap justify-between">
        {otherPools.map(pool => (
          <UserPoolCard key={pool.id} {...pool} />
        ))}
      </View>
    </>
  );
}
