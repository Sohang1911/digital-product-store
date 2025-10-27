import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  let connection;
  
  try {
    // First connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('📦 Connected to MySQL server');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Generate proper bcrypt hash for default password
    const defaultPassword = 'Sohang@1911';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Replace the placeholder hash with actual hash
    schemaSql = schemaSql.replace(
      '$2a$10$8K1p/a0dL3.E9.2K5Z9X8uzGYG8RLsIW2Q0k8G7Q8L5J6.K5Z9X8u',
      hashedPassword
    );

    await connection.query(schemaSql);
    
    console.log('✅ Database schema created successfully');
    console.log('\n📋 Default Admin Credentials:');
    console.log('   Username: Sohang');
    console.log('   Password: Sohang@1911');
    console.log('\n⚠️  Please change the default password after first login!\n');

    await connection.end();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

initializeDatabase();
