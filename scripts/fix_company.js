const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const backRefs = `
  orderDetails OrderDetail[]
  palletDetails PalletDetail[]
  palletConsigneeDetails PalletConsigneeDetail[]
  lrStatusLogs LrStatusLog[]
  podRecords PodRecord[]
  tripOrders TripOrder[]
  tripExpenses TripExpense[]
  tripSettlements TripSettlement[]
  journalLines JournalLine[]
  bankTransactions BankTransaction[]
  salaryStructures SalaryStructure[]
  payrollLines PayrollLine[]
  vehicleDocuments VehicleDocument[]
  maintenanceJobs MaintenanceJob[]
  fuelEntries FuelEntry[]
`;

schema = schema.replace(/(model Company \{[\s\S]+?)(@@index\(\[tenantId\]\))/m, (match, body, idx) => {
  return body + backRefs + '\n  ' + idx;
});

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Company updated');
