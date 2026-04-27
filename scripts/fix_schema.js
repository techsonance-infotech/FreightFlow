const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const modelsToAdd = [
  'OrderDetail', 'PalletDetail', 'PalletConsigneeDetail', 'LrStatusLog', 'PodRecord',
  'TripOrder', 'TripExpense', 'TripSettlement', 'JournalLine', 'BankTransaction',
  'SalaryStructure', 'PayrollLine', 'VehicleDocument', 'MaintenanceJob', 'FuelEntry'
];

let updatedSchema = schema;

modelsToAdd.forEach(model => {
  const modelRegex = new RegExp(`model ${model} \\{([^\\}]+)\\}`, 'g');
  updatedSchema = updatedSchema.replace(modelRegex, (match, body) => {
    if (body.includes('companyId')) return match;
    
    // Add companyId string @map("company_id") @db.Uuid at the top of the fields (after id)
    let newBody = body.replace(/id\s+String\s+@id[^\n]+\n/, `$&  companyId   String   @map("company_id") @db.Uuid\n`);
    
    // Add relation
    newBody += `  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)\n`;
    
    // Add index if not exists
    if (!newBody.includes('@@index([companyId])') && !newBody.includes('@@unique([')) {
      newBody += `\n  @@index([companyId])\n`;
    }
    
    return `model ${model} {${newBody}}`;
  });
});

fs.writeFileSync('prisma/schema.prisma', updatedSchema);
console.log('Schema updated');
