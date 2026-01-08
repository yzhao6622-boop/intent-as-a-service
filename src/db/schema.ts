import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || './data/intent.db';

// 确保数据目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 包装数据库方法以支持Promise（better-sqlite3 是同步的，但为了兼容性提供 Promise 包装）
export function dbRun(sql: string, params?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = params ? stmt.run(...params) : stmt.run();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

export function dbGet(sql: string, params?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = params ? stmt.get(...params) : stmt.get();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

export function dbAll(sql: string, params?: any[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      const result = params ? stmt.all(...params) : stmt.all();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

// 导出db实例（使用any类型避免类型导出问题）
// 注意：如果不需要导出db，可以删除这行
export const dbInstance: any = db;

// 初始化数据库表
export async function initDatabase() {
  // 用户表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 意图表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS intents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      time_window_days INTEGER NOT NULL,
      credibility_score REAL DEFAULT 0.0,
      status TEXT DEFAULT 'active',
      stage TEXT DEFAULT 'initial',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 意图阶段拆解表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS intent_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intent_id INTEGER NOT NULL,
      stage_name TEXT NOT NULL,
      stage_order INTEGER NOT NULL,
      description TEXT,
      verification_points TEXT,
      completed BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (intent_id) REFERENCES intents(id)
    )
  `);

  // 行为验证记录表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS verification_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intent_id INTEGER NOT NULL,
      verification_type TEXT NOT NULL,
      verification_data TEXT,
      ai_analysis TEXT,
      passed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (intent_id) REFERENCES intents(id)
    )
  `);

  // AI对话记录表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intent_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (intent_id) REFERENCES intents(id)
    )
  `);

  // 意图市场表（交易/订阅）
  await dbRun(`
    CREATE TABLE IF NOT EXISTS intent_marketplace (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intent_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL,
      buyer_id INTEGER,
      price REAL,
      status TEXT DEFAULT 'available',
      transaction_type TEXT DEFAULT 'subscription',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      purchased_at DATETIME,
      FOREIGN KEY (intent_id) REFERENCES intents(id),
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (buyer_id) REFERENCES users(id)
    )
  `);

  // 意图进展追踪表
  await dbRun(`
    CREATE TABLE IF NOT EXISTS intent_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intent_id INTEGER NOT NULL,
      progress_percentage REAL DEFAULT 0.0,
      milestone TEXT,
      notes TEXT,
      ai_assessment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (intent_id) REFERENCES intents(id)
    )
  `);

  console.log('数据库初始化完成');
}
