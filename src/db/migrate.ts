import { initDatabase } from './schema';

async function migrate() {
  try {
    await initDatabase();
    console.log('数据库迁移完成');
    process.exit(0);
  } catch (error) {
    console.error('数据库迁移失败:', error);
    process.exit(1);
  }
}

migrate();
