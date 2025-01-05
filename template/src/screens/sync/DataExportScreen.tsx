import { useNavigation } from '@react-navigation/native';
import { Button, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { open } from 'react-native-quick-sqlite';
import Share from 'react-native-share';

import { showToast } from '@src/components/common/Toast';
import { LogRepository } from '@src/orm/models/log.repo';
import { ProjectRepository } from '@src/orm/models/porject.repo';
import { TodoRepository } from '@src/orm/models/todo.repo';
import { useOverviewStore } from '@src/store/overview';
import { useResourceStore } from '@src/store/resource/resource';

export function DataExportScreen() {
  const exportSQL = async () => {
    const connect = open({
      name: 'opb-database.db',
      location: 'Library',
    });
    let allSQL = '';

    const createTableResult = await connect.executeAsync(
      "SELECT sql FROM sqlite_master WHERE type='table';",
    );
    const allTableCreateSql = createTableResult.rows?._array.map(it => it.sql);
    allSQL = allTableCreateSql?.join('\n')!;

    // 查询所有表的名称
    const tablesResult = await connect.executeAsync(
      "SELECT name FROM sqlite_master WHERE type='table';",
    );
    const tableNames = tablesResult.rows?._array.map(row => row.name) || []; // 获取所有表名

    // 遍历每个表并查询数据
    for (const tableName of tableNames) {
      const result = await connect.executeAsync(`SELECT * FROM ${tableName};`); // 查询每个表的数据

      // 遍历每一行数据，生成 INSERT 语句
      for (const row of result.rows?._array || []) {
        const columns = Object.keys(row).join(', '); // 获取列名
        const values = Object.values(row)
          .map(value => {
            // 处理字符串和日期类型的值，确保它们被正确转义
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`; // 转义单引号
            }
            return value; // 其他类型直接返回
          })
          .join(', ');

        allSQL += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`; // 生成 INSERT 语句
      }
      allSQL += `-- 数据来自表: ${tableName}\n`; // 添加表名注释
    }
    console.log('allData', allSQL);
  };

  const exportJSON = async () => {
    try {
      const [projects, logs, todos] = await Promise.all([
        ProjectRepository.find(),
        LogRepository.find(),
        TodoRepository.find(),
      ]);

      const exportData = {
        projects,
        logs,
        todos,
      };

      const dataPath = `file://${RNFS.TemporaryDirectoryPath}/opb-export-${Date.now()}.json`;
      await RNFS.writeFile(dataPath, JSON.stringify(exportData), 'utf8');
      Share.open({
        url: dataPath,
        title: '导出数据',
        message: dataPath,
      });

      showToast('导出成功');
    } catch (err: any) {
      showToast(err?.message || '导出失败');
    }
  };

  const navigation = useNavigation();
  return (
    <View>
      <Button title="导出JSON数据" onPress={exportJSON} />
      <Button
        title="导入JSON数据"
        onPress={async () => {
          try {
            const res = await DocumentPicker.pick({
              mode: 'import',
              type: [DocumentPicker.types.json],
            });
            console.log('选中的文件:', res);
            const pickedPath = res[0].uri;
            const dataStr = await RNFS.readFile(pickedPath);
            const data = JSON.parse(dataStr);
            console.log('data', data);
            await Promise.all(
              data.projects?.map((p: any) => {
                return ProjectRepository.upsert(p, ['id']);
              }),
            );
            await Promise.all(
              data.todos?.map((p: any) => {
                return TodoRepository.upsert(p, ['id']);
              }),
            );
            await Promise.all(
              data.logs?.map((p: any) => {
                return LogRepository.upsert(p, ['id']);
              }),
            );
            useResourceStore.getState().initProjects();
            useOverviewStore.getState().initOverview();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          } catch (err: any) {
            if (DocumentPicker.isCancel(err)) {
              console.log('用户取消了选择');
            } else {
              console.error('选择文件时出错:', err);
              showToast(err?.message);
            }
          }
        }}
      />
    </View>
  );
}
