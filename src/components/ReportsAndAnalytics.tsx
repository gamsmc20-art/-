import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Download,
  Building2,
  DollarSign,
  PieChart as PieIcon,
  Printer,
  CheckCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PawnContract, Branch } from '../types';
import { formatCurrency } from '../utils/calculator';
import { exportFinancialReportToCSV } from '../utils/exporter';

interface ReportsAndAnalyticsProps {
  contracts: PawnContract[];
  branches: Branch[];
}

export const ReportsAndAnalytics: React.FC<ReportsAndAnalyticsProps> = ({
  contracts,
  branches,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | 'year'>('6months');

  // Realistic monthly P&L historical and projection data
  const monthlyPnL = [
    {
      month: 'เมษายน 2569',
      interestIncome: 15400,
      penaltyIncome: 1200,
      forfeitedSalesProfit: 18500,
      expenses: 8500,
      netProfit: 26600,
    },
    {
      month: 'พฤษภาคม 2569',
      interestIncome: 18900,
      penaltyIncome: 1800,
      forfeitedSalesProfit: 22000,
      expenses: 9200,
      netProfit: 33500,
    },
    {
      month: 'มิถุนายน 2569',
      interestIncome: 21500,
      penaltyIncome: 2100,
      forfeitedSalesProfit: 19800,
      expenses: 9500,
      netProfit: 33900,
    },
    {
      month: 'กรกฎาคม 2569',
      interestIncome: 24800,
      penaltyIncome: 2400,
      forfeitedSalesProfit: 28000,
      expenses: 10200,
      netProfit: 45000,
    },
    {
      month: 'สิงหาคม 2569',
      interestIncome: 28600,
      penaltyIncome: 3100,
      forfeitedSalesProfit: 24500,
      expenses: 10800,
      netProfit: 45400,
    },
    {
      month: 'กันยายน 2569 (ปัจจุบัน)',
      interestIncome: 31200,
      penaltyIncome: 2800,
      forfeitedSalesProfit: 32000,
      expenses: 11000,
      netProfit: 55000,
    },
  ];

  // Totals
  const totalInterest = monthlyPnL.reduce((sum, item) => sum + item.interestIncome, 0);
  const totalForfeitedProfit = monthlyPnL.reduce((sum, item) => sum + item.forfeitedSalesProfit, 0);
  const totalPenalty = monthlyPnL.reduce((sum, item) => sum + item.penaltyIncome, 0);
  const totalNetProfit = monthlyPnL.reduce((sum, item) => sum + item.netProfit, 0);

  // Branch performance metrics
  const branchMetrics = branches.map((branch) => {
    const bContracts = contracts.filter((c) => c.branchId === branch.id);
    const activeLoan = bContracts
      .filter((c) => c.status !== 'redeemed')
      .reduce((sum, c) => sum + c.loanAmount, 0);
    const interestTotal = bContracts.reduce((sum, c) => sum + c.totalInterestPaid, 0);
    const defaultedCount = bContracts.filter((c) => c.status === 'defaulted').length;

    return {
      branchName: branch.name,
      activeLoan,
      interestTotal,
      contractCount: bContracts.length,
      defaultedCount,
    };
  });

  const pieColors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
  const revenueSourcesData = [
    { name: 'ดอกเบี้ยรับจำนำ', value: totalInterest },
    { name: 'กำไรขายหลุดจำนำ', value: totalForfeitedProfit },
    { name: 'ค่าปรับล่าช้า', value: totalPenalty },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            รายงานสรุปผลกำไรและการวิเคราะห์ทางการเงิน (Profit & Analytics)
          </h2>
          <p className="text-xs text-slate-500">
            ระบบวิเคราะห์รายได้ กำไรสุทธิจากดอกเบี้ยและสินค้าหลุดจำนำ แยกรายเดือนและรายสาขา
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="export-financial-report-btn"
            type="button"
            onClick={() => exportFinancialReportToCSV(monthlyPnL)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ส่งออกรายงานงบการเงิน CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">กำไรสุทธิรวม (Net Profit 6 เดือน)</span>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalNetProfit)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>เติบโต +18.4% จากไตรมาสก่อน</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">รายได้ดอกเบี้ยรวม</span>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalInterest)}</div>
          <div className="text-[11px] text-slate-500">รายได้หลักประจำต่อเนื่อง</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">กำไรขายสินค้าหลุดจำนำ</span>
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(totalForfeitedProfit)}</div>
          <div className="text-[11px] text-slate-500">ผลตอบแทนส่วนเพิ่มจากสต็อก</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">ค่าปรับล่าช้า</span>
          <div className="text-2xl font-bold text-purple-900">{formatCurrency(totalPenalty)}</div>
          <div className="text-[11px] text-slate-500">จากการผิดนัดชำระเกินกำหนด</div>
        </div>
      </div>

      {/* Profit Trends Line Chart & Revenue Source Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                แนวโน้มผลกำไรสุทธิและรายรับรายเดือน (Monthly P&L Trend)
              </h3>
              <p className="text-xs text-slate-500">
                เส้นกราฟแสดงการเติบโตของกำไรสุทธิต่อเดือน
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPnL} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`${formatCurrency(Number(value))}`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="กำไรสุทธิ (Net Profit)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="interestIncome"
                  name="ดอกเบี้ยรับ"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="forfeitedSalesProfit"
                  name="กำไรขายหลุดจำนำ"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Pie */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">สัดส่วนที่มาของรายรับทั้งหมด</h3>
            <p className="text-xs text-slate-500">จำแนกตามประเภทรายได้</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueSourcesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${formatCurrency(Number(value))}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {revenueSourcesData.map((s, idx) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                  ></span>
                  <span>{s.name}</span>
                </span>
                <span className="font-bold text-slate-900">{formatCurrency(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            ตารางงบกำไรขาดทุนรายเดือน (Monthly Income Statement Table)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">เดือน</th>
                <th className="py-3 px-4 text-right">รายได้ดอกเบี้ย</th>
                <th className="py-3 px-4 text-right">กำไรขายหลุดจำนำ</th>
                <th className="py-3 px-4 text-right">ค่าปรับล่าช้า</th>
                <th className="py-3 px-4 text-right">ค่าใช้จ่ายดำเนินงาน</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">กำไรสุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyPnL.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{row.month}</td>
                  <td className="py-3.5 px-4 text-right text-amber-800">{formatCurrency(row.interestIncome)}</td>
                  <td className="py-3.5 px-4 text-right text-blue-700">{formatCurrency(row.forfeitedSalesProfit)}</td>
                  <td className="py-3.5 px-4 text-right text-purple-700">{formatCurrency(row.penaltyIncome)}</td>
                  <td className="py-3.5 px-4 text-right text-red-600">-{formatCurrency(row.expenses)}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700 text-sm">
                    +{formatCurrency(row.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Branch Performance Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>เปรียบเทียบผลการดำเนินงานรายสาขา (Multi-Branch Breakdown)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branchMetrics.map((bm, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-sm text-slate-900">{bm.branchName}</div>
              <div className="flex justify-between text-slate-600">
                <span>ยอดเงินต้นจำนำหมุนเวียน:</span>
                <span className="font-bold text-slate-900">{formatCurrency(bm.activeLoan)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ดอกเบี้ยรับสะสม:</span>
                <span className="font-bold text-emerald-700">+{formatCurrency(bm.interestTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>จำนวนสัญญาทั้งหมด:</span>
                <span className="font-semibold text-slate-800">{bm.contractCount} เครื่อง</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>สินค้าหลุดจำนำ:</span>
                <span className="font-semibold text-amber-800">{bm.defaultedCount} เครื่อง</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
