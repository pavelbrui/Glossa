import { readFileSync } from 'fs';
import { join } from 'path';
import Database from 'better-sqlite3';

const db = new Database('glossa.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Read and execute schema
const schema = readFileSync(join(process.cwd(), 'src', 'db', 'schema.sql'), 'utf8');
db.exec(schema);

console.log('Database migration completed successfully!');