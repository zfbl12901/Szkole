import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin de la base de données
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/articles.db');
const dbDir = dirname(dbPath);

// Créer le dossier data s'il n'existe pas
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

let db = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Mode WAL pour de meilleures performances
  }
  return db;
}

export function initDatabase() {
  const database = getDatabase();
  
  // Créer la table articles si elle n'existe pas
  database.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      category TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Créer un index sur updated_at pour les requêtes de tri
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_updated_at ON articles(updated_at DESC)
  `);

  console.log('✅ Database initialized');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

