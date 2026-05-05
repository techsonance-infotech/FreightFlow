import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const labourId = searchParams.get('labourId');
    const month = searchParams.get('month'); // YYYY-MM

    if (!labourId || !month) {
      return NextResponse.json({ error: 'Labour ID and Month are required' }, { status: 400 });
    }

    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    // 1. Get worker details (Base Salary)
    const labour = await prisma.labour.findUnique({
      where: { id: labourId },
    });

    if (!labour) return NextResponse.json({ error: 'Labour not found' }, { status: 404 });

    // 2. Get attendance summary
    const attendance = await prisma.labourAttendance.findMany({
      where: {
        labourId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const halfDays = attendance.filter(a => a.status === 'HalfDay').length;
    const totalDaysInMonth = endOfMonth.getDate();
    
    const workingDays = presentDays + (halfDays * 0.5);
    const baseSalaryPayable = Math.round((labour.salary / totalDaysInMonth) * workingDays);

    // 3. Get transactions (Advances, Bonuses, etc.)
    const transactions = await prisma.labourExpense.findMany({
      where: {
        labourId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const totalAdvances = transactions
      .filter(t => t.type === 'Advance')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalBonuses = transactions
      .filter(t => t.type === 'Bonus')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalDeductions = transactions
      .filter(t => t.type === 'Deduction')
      .reduce((sum, t) => sum + t.amount, 0);

    const netPayable = baseSalaryPayable + totalBonuses - totalAdvances - totalDeductions;

    return NextResponse.json({
      summary: {
        totalDays: totalDaysInMonth,
        workingDays,
        baseSalary: labour.salary,
        earnedSalary: baseSalaryPayable,
        bonuses: totalBonuses,
        advances: totalAdvances,
        deductions: totalDeductions,
        netPayable,
      },
      attendance,
      transactions,
    });
  } catch (error) {
    console.error('Payroll GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
