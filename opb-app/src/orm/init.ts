import RNFS from 'react-native-fs';

import { dataSource } from './db';

const checkDBStat = async () => {
  const dbPath = RNFS.DocumentDirectoryPath + '/Library/opb-database.db';
  const dbExists = await RNFS.exists(dbPath);
  if (!dbExists) {
    console.log('db file not exists');
  } else {
    const stat = await RNFS.stat(dbPath);
    console.log('db file exists', stat);
  }
};

export async function initDB() {
  console.log('db start initializing');
  checkDBStat();
  await dataSource.initialize();
  console.log('db initialized');
}
