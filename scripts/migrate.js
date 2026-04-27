const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env' });

async function runMigration() {
  const connectionString = process.env.DIRECT_URL;
  console.log('Original connection URL starts with postgres://...');

  // Parse the URL so we can decode the password for pg
  const parsedUrl = new URL(connectionString);
  const decodedPassword = decodeURIComponent(parsedUrl.password);
  
  const client = new Client({
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    database: parsedUrl.pathname.replace('/', ''),
    user: parsedUrl.username,
    password: decodedPassword,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');
    
    const sqlPath = path.join(__dirname, 'prisma/migrations/000000000000_rls_setup/migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing migration...');
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

runMigration();
