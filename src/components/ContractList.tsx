import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  Smartphone,
  Eye,
  ArrowUpDown,
  Plus,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { PawnContract, Branch, ContractStatus } from '../types';
import { formatCurrency, formatThaiDate, calculatePayableAmounts } from '../utils/calculator';
import { exportContractsToCSV } from '../utils/exporter';

interface ContractListProps {
  contracts: PawnContract[];
  branches: Branch[];
  onOpenNewPawn: () => void;
  onOpenDetail: (contract: PawnContract) => void;
  onOpenThermalPrint: (contract: PawnContract) => void;
  onOpenInvoice: (contract: PawnContract) => void;
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  branches,
  onOpenNewPawn,
  onOpenDetail,
  onOpenThermalPrint,
  onOpenInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'loanAmount' | 'contractDate'>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter logic
  const filtered = contracts.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      c.contractNumber.toLowerCase().includes(term) ||
      c.customerName.toLowerCase().includes(term) ||
      c.customerPhone.includes(term) ||
      c.device.brand.toLowerCase().includes(term) ||
      c.device.model.toLowerCase().includes(term) ||
      c.device.imei.includes(term);

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchBranch = branchFilter === 'all' || c.branchId === branchFilter;

    return matchSearch && matchStatus && matchBranch;
  });

  // Sort logic
  const sorted = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'dueDate') comp = a.dueDate.localeCompare(b.dueDate);
    else if (sortBy === 'contractDate') comp = a.contractDate.localeCompare(b.contractDate);
    else if (sortBy === 'loanAmount') comp = a.loanAmount - b.loanAmount;
    return sortAsc ? comp : -comp;
  });

  const getStatusBadge = (status: ContractStatus, overdueDays: number) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">กำลังจำนำ</span>;
      case 'due_soon':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800">ใกล้ครบกำหนด</span>;
      case 'overdue':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-100 text-red-800">
            เลยกำหนด ({overdueDays} วัน • ปรับ 50฿/วัน)
          </span>
        );
      case 'defaulted':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-800 text-white">หลุดจำนำ</span>;
      case 'redeemed':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800">ไถ่ถอนแล้ว</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">ทะเบียนสัญญารับจำนำโทรศัพท์มือถือ</h2>
          <p className="text-xs text-slate-500">
            รายการสัญญาทั้งหมด ค้นหาตามเลขที่สัญญา, เบอร์โทร, เลขอีมี่ (IMEI) และสถานะ
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="export-contracts-csv-btn"
            type="button"
            onClick={() => exportContractsToCSV(sorted)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            id="contract-new-pawn-btn"
            type="button"
            onClick={onOpenNewPawn}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ รับจำนำเครื่องใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-contract-input"
              type="text"
              placeholder="ค้นหาเลขที่สัญญา, ลูกค้า, เบอร์โทร, IMEI, รุ่นมือถือ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>

          {/* Branch filter */}
          <div className="md:col-span-3">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
            >
              <option value="all">ทุกสาขา</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-4 flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-800"
            >
              <option value="dueDate">เรียงตาม: วันครบกำหนด</option>
              <option value="contractDate">เรียงตาม: วันที่ทำสัญญา</option>
              <option value="loanAmount">เรียงตาม: ยอดเงินจำนำ</option>
            </select>
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
              title="สลับลำดับ น้อยไปมาก / มากไปน้อย"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { id: 'all', label: `ทั้งหมด (${contracts.length})` },
            { id: 'active', label: `กำลังจำนำ (${contracts.filter((c) => c.status === 'active').length})` },
            { id: 'due_soon', label: `ใกล้ครบกำหนด (${contracts.filter((c) => c.status === 'due_soon').length})` },
            { id: 'overdue', label: `เลยกำหนด (${contracts.filter((c) => c.status === 'overdue').length})` },
            { id: 'defaulted', label: `หลุดจำนำ (${contracts.filter((c) => c.status === 'defaulted').length})` },
            { id: 'redeemed', label: `ไถ่ถอนแล้ว (${contracts.filter((c) => c.status === 'redeemed').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">เลขที่สัญญา & สาขา</th>
                <th className="py-3 px-4">ข้อมูลผู้จำนำ</th>
                <th className="py-3 px-4">โทรศัพท์มือถือ & สเปก</th>
                <th className="py-3 px-4">เลขอีมี่ (IMEI)</th>
                <th className="py-3 px-4">ยอดเงินต้น & ดอกเบี้ย</th>
                <th className="py-3 px-4">วันครบกำหนด</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบรายการสัญญาที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                sorted.map((c) => {
                  const { baseInterest, overdueDays, penaltyFee } = calculatePayableAmounts(
                    c.loanAmount,
                    c.interestRateMonthly,
                    c.dueDate,
                    50,
                    c.interestCycle || 'monthly',
                    undefined,
                    c.interestRateWeekly
                  );

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Contract & Branch */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-slate-900">{c.contractNumber}</div>
                        <div className="text-[11px] text-slate-500">{c.branchName}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{c.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.customerPhone}</div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1">
                          <span>{c.device.brand} {c.device.model}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {c.device.storage} • {c.device.color} (เกรด {c.device.condition.grade})
                        </div>
                      </td>

                      {/* IMEI */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 text-[11px]">
                        {c.device.imei}
                      </td>

                      {/* Financials */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{formatCurrency(c.loanAmount)}</div>
                        <div className="text-[11px] text-amber-800">
                          ดบ. {formatCurrency(baseInterest)}/{c.interestCycle === 'weekly' ? 'สัปดาห์' : 'เดือน'} ({c.interestCycle === 'weekly' ? (c.interestRateWeekly ?? 6.25) : c.interestRateMonthly}%)
                        </div>
                        {overdueDays > 0 && (
                          <div className="text-[10px] text-red-600 font-semibold">
                            + ค่าปรับ {formatCurrency(penaltyFee)} (50฿/วัน)
                          </div>
                        )}
                      </td>

                      {/* Due date */}
                      <td className="py-3.5 px-4">
                        <div className={`font-semibold ${c.status === 'overdue' ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
                          {formatThaiDate(c.dueDate)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          เริ่ม: {formatThaiDate(c.contractDate)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(c.status, overdueDays)}
                          {c.lockInfo?.status === 'locked' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                              🔒 สั่งล็อคเครื่องแล้ว
                            </span>
                          ) : (
                            c.status === 'overdue' && overdueDays <= 7 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                🚨 เตือนล็อคเครื่อง (ใน 7 วัน)
                              </span>
                            )
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => onOpenThermalPrint(c)}
                            title="พิมพ์ใบสัญญา (เครื่องพิมพ์ความร้อน)"
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenInvoice(c)}
                            title="สร้างใบแจ้งหนี้ / ส่ง LINE"
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDetail(c)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            เปิดดู
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
