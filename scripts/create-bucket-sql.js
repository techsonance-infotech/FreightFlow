const { Client } = require('pg');
require('dotenv').config({ path: '../../.env' });

async function createBucket() {
  const connectionString = process.env.DIRECT_URL;
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

  const sql = `
    INSERT INTO storage.buckets (id, name, public, file_size_limit)
    VALUES ('compliance_documents', 'compliance_documents', false, 10485760)
    ON CONFLICT (id) DO NOTHING;
  `;

  try {
    await client.connect();
    console.log('Creating bucket via SQL...');
    await client.query(sql);
    console.log('Bucket created successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createBucket();
