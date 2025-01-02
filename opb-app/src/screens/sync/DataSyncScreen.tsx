import { useNavigation } from '@react-navigation/native';
import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as CloudStorage from 'react-native-cloud-store';
import RNFS from 'react-native-fs';

import { showToast } from '@src/components/common/Toast';
import { dataSource } from '@src/orm/db';

const dbPath = `${RNFS.DocumentDirectoryPath}/Library/${dataSource.options.database}`;
const cloudPath = `/${dataSource.options.database}`;
interface SyncInfo {
  modifiedTime: Date;
  size: number;
}

interface SyncStatus {
  isAvailable: boolean;
  local?: SyncInfo;
  remote?: SyncInfo;
  checking: boolean;
}

export function DataSyncScreen() {
  useEffect(() => {
    const uploadEvent = CloudStorage.registerGlobalUploadEvent();
    const downloadEvent = CloudStorage.registerGlobalDownloadEvent();

    return () => {
      downloadEvent?.remove();
      uploadEvent?.remove();
    };
  }, []);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isAvailable: false,
    checking: true,
  });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {}, []);

  // 检查同步状态
  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, checking: true }));

      // 检查 iCloud 是否可用
      const isAvailable = await CloudStorage.isICloudAvailable();
      console.log('check cloud available', isAvailable);

      if (!isAvailable) {
        setSyncStatus({
          isAvailable: false,
          checking: false,
        });
        return;
      }

      // 获取本地数据信息
      const localDbPath = dbPath;
      const localStats = await RNFS.stat(localDbPath);
      console.log('local stats', localStats);
      console.log('cloud path', cloudPath);
      const defPath = await CloudStorage.getDefaultICloudContainerPath();
      console.log('def', defPath);
      const fullICloudPath = `${defPath}${cloudPath}`;
      console.log('fullICloudPath', fullICloudPath);
      const remoteExist = await CloudStorage.exist(fullICloudPath);
      console.log('remoteExist', remoteExist);
      if (!remoteExist) {
        setSyncStatus({
          isAvailable: true,
          checking: false,
          local: localStats
            ? {
                modifiedTime: new Date(localStats.mtime),
                size: localStats.size,
              }
            : undefined,
        });

        return;
      }

      // 获取远程数据信息
      const remoteStats = await CloudStorage.stat(fullICloudPath);

      setSyncStatus({
        isAvailable: true,
        checking: false,
        local: localStats
          ? {
              modifiedTime: new Date(localStats.mtime),
              size: localStats.size,
            }
          : undefined,
        remote: remoteStats
          ? {
              modifiedTime: new Date(remoteStats.modifyTimestamp!),
              size: remoteStats.fileSize!,
            }
          : undefined,
      });
    } catch (error) {
      console.error('检查同步状态失败:', error);
      setSyncStatus({
        isAvailable: false,
        checking: false,
      });
    }
  };

  // 下载远程数据
  const handleDownload = async () => {
    Alert.alert('同步确认', '从云端同步数据将覆盖本地数据，确定要继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          const defPath = await CloudStorage.getICloudURL();
          console.log('handleDownload path', defPath);
          const fullICloudPath = `${defPath}${cloudPath}`;
          console.log('fullICloudPath', fullICloudPath);

          const exist = await CloudStorage.exist(fullICloudPath);
          if (exist) {
            // await CloudStorage.download(fullICloudPath);
            const oldPath = `${dbPath}_temp`;
            const dbPathExist = await CloudStorage.exist(dbPath);
            if (dbPathExist) {
              console.log('dbPathExist', dbPath);
              await RNFS.moveFile(dbPath, oldPath);
              await RNFS.copyFile(fullICloudPath, dbPath);
              await RNFS.unlink(oldPath);
            } else {
              await RNFS.copyFile(fullICloudPath, dbPath);
            }
            console.log('copy success');
            await checkSyncStatus();
          }
        },
      },
    ]);
  };

  const uploadFileToRemote = () => {
    return new Promise(async (resolve, reject) => {
      const defPath = await CloudStorage.getDefaultICloudContainerPath();
      console.log('def', defPath);
      const fullICloudPath = `${defPath}${cloudPath}`;
      console.log('fullICloudPath', fullICloudPath);

      try {
        if (await CloudStorage.exist(fullICloudPath)) {
          await CloudStorage.unlink(fullICloudPath);
        }
        CloudStorage.upload(dbPath, fullICloudPath, {
          onProgress: ({ progress }) => {
            console.log('uploadFileToRemote', progress);
            if (progress >= 100) {
              resolve(undefined);
            }
          },
        });

        setTimeout(checkSyncStatus, 2000);
      } catch (error) {
        console.error('error', error);
        reject(error);
      }
    });
  };

  // 上传本地数据
  const handleUpload = async () => {
    Alert.alert('同步确认', '上传数据将覆盖云端数据，确定要继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            setSyncing(true);
            uploadFileToRemote();
          } catch (error) {
            console.error('上传失败:', error);
            showToast('上传失败');
          } finally {
            setSyncing(false);
          }
        },
      },
    ]);
  };

  if (syncStatus.checking || syncing) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-500">
          {syncing ? '正在同步...' : '检查同步状态...'}
        </Text>
      </View>
    );
  }

  if (!syncStatus.isAvailable) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <RemixIcon name="cloud-off-line" size={48} color="#6B7280" />
        <Text className="mt-4 text-center text-base text-gray-500">
          iCloud 同步不可用，请检查：{'\n'}
          1. 是否已登录 iCloud 账号{'\n'}
          2. 是否已开启 iCloud Drive{'\n'}
          3. 是否已授权应用访问 iCloud
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* 数据信息卡片 */}
      <View className="m-4 rounded-lg bg-white p-4">
        <Text className="mb-4 text-base font-medium">数据信息</Text>

        {/* 本地数据 */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-gray-900">
            本地数据
          </Text>
          {syncStatus.local ? (
            <>
              <Text className="text-sm text-gray-500">
                修改时间：
                {dayjs(syncStatus.local.modifiedTime).format(
                  'YYYY-MM-DD HH:mm:ss',
                )}
              </Text>
              <Text className="text-sm text-gray-500">
                数据大小：{(syncStatus.local.size / 1024).toFixed(2)}KB
              </Text>
            </>
          ) : (
            <Text className="text-sm text-gray-500">暂无本地数据</Text>
          )}
        </View>

        {/* 远程数据 */}
        <View>
          <Text className="mb-2 text-sm font-medium text-gray-900">
            云端数据
          </Text>
          {syncStatus.remote ? (
            <>
              <Text className="text-sm text-gray-500">
                修改时间：
                {dayjs(syncStatus.remote.modifiedTime).format(
                  'YYYY-MM-DD HH:mm:ss',
                )}
              </Text>
              <Text className="text-sm text-gray-500">
                数据大小：{(syncStatus.remote.size / 1024).toFixed(2)}KB
              </Text>
            </>
          ) : (
            <Text className="text-sm text-gray-500">暂无云端数据</Text>
          )}
        </View>
      </View>

      {/* 同步按钮 */}
      <View className="m-4 space-y-4">
        <TouchableOpacity
          className="rounded-lg bg-blue-500 p-4"
          onPress={handleDownload}
          disabled={!syncStatus.remote}>
          <Text className="text-center font-medium text-white">
            从云端同步数据
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-lg bg-blue-500 p-4"
          onPress={handleUpload}
          disabled={!syncStatus.local}>
          <Text className="text-center font-medium text-white">
            上传数据到云端
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
