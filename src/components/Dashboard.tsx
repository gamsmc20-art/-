import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Smartphone,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Bell,
  Printer,
  FileText,
  Building2,
  Calendar,
  Cloud,
  ChevronRight,
  ShieldAlert,
  Lock,
  Unlock,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { PawnContract, Customer, Branch, SystemUser } from '../types';
import {
  formatCurrency,
  formatThaiDate,
  calculatePayableAmounts,
  getOverdueLockStatus,
} from '../utils/calculator';

interface DashboardProps {
  contracts: PawnContract[];
  customers: Customer[];
  branches: Branch[];
  currentUser: SystemUser;
  selectedBranchId: string;
  onSelectBranchId: (id: string) => void;
  onOpenNewPawn: () => void;
  onOpenContractDetail: (contract: PawnContract) => void;
  onOpenCloudBackup: () => void;
  onOpenLineNotify: () => void;
  onOpenThermalPrint: (contract: PawnContract) => void;
  onOpenInvoice: (contract: PawnContract) => void;
  onToggleDeviceLock?: (contractId: string, action: 'lock' | 'unlock', reason?: string, method?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  contracts,
  customers,
  branches,
  currentUser,
  selectedBranchId,
  onSelectBranchId,
  onOpenNewPawn,
  onOpenContractDetail,
  onOpenCloudBackup,
  onOpenLineNotify,
  onOpenThermalPrint,
  onOpenInvoice,
  onToggleDeviceLock,
}) => {
  // Filter contracts by selected branch (or all)
  const filteredContracts =
    selectedBranchId === 'all'
      ? contracts
      : contracts.filter((c) => c.branchId === selectedBranchId);

  // Status groupings
  const activeContracts = filteredContracts.filter((c) => c.status === 'active');
  const dueSoonContracts = filteredContracts.filter((c) => c.status === 'due_soon');
  const overdueContracts = filteredContracts.filter((c) => c.status === 'overdue');
  const defaultedContracts = filteredContracts.filter((c) => c.status === 'defaulted');
  const redeemedContracts = filteredContracts.filter((c) => c.status === 'redeemed');

  // Device Lock Status Tracking
  const lockedContracts = filteredContracts.filter((c) => c.lockInfo?.status === 'locked');
  const pendingLockContracts = filteredContracts.filter(
    (c) => (c.status === 'overdue' || c.status === 'defaulted') && c.lockInfo?.status !== 'locked'
  );

  // Overdue calculations (50 THB/day penalty, 7-day alert window)
  const overdueAlertDetails = overdueContracts.map((c) => {
    const statusInfo = getOverdueLockStatus(c.dueDate, c.lockInfo?.status === 'locked', 50);
    return { contract: c, ...statusInfo };
  });

  const totalOverduePenalties = overdueAlertDetails.reduce((sum, item) => sum + item.penaltyFee, 0);
  const pendingLockWithin7Days = overdueAlertDetails.filter(
    (item) => item.isWithin7Days && !item.isLocked
  );

  // Key Financial Metrics
  const totalActiveLoanAmount = [...activeContracts, ...dueSoonContracts, ...overdueContracts].reduce(
    (sum, c) => sum + c.loanAmount,
    0
  );

  const totalInterestCollected = filteredContracts.reduce(
    (sum, c) => sum + c.totalInterestPaid,
    0
  );

  const totalRedeemedAmount = redeemedContracts.reduce(
    (sum, c) => sum + c.loanAmount,
    0
  );

  // Chart data for monthly revenue & interest trend
  const monthlyData = [
    { month: 'พ.ค. 69', newPawns: 85000, interest: 14500, redeemed: 62000 },
    { month: 'มิ.ย. 69', newPawns: 110000, interest: 18200, redeemed: 84000 },
    { month: 'ก.ค. 69', newPawns: 125000, interest: 22400, redeemed: 95000 },
    { month: 'ส.ค. 69', newPawns: 140000, interest: 25800, redeemed: 112000 },
    { month: 'ก.ย. 69', newPawns: 98500, interest: 21900, redeemed: 78000 },
  ];

  // Device brand distribution
  const brandCountMap: Record<string, number> = {};
  filteredContracts.forEach((c) => {
    const brand = c.device.brand;
    brandCountMap[brand] = (brandCountMap[brand] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Branch Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">ระบบฐานข้อมูลเซิร์ฟเวอร์ออนไลน์ (Real-time Synced)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            แดชบอร์ดสรุปยอดประจำวันและรายงานรายได้
          </h1>
          <p className="text-xs text-slate-500">
            ระบบบริหารจัดการรับจำนำโทรศัพท์มือถือแบบรวมศูนย์ ทุกสาขาเรียลไทม์
          </p>
        </div>

        {/* Branch Filter & Intake CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              id="branch-selector-dashboard"
              value={selectedBranchId}
              onChange={(e) => onSelectBranchId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">ดูข้อมูลรวมทุกสาขา (All Branches)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            id="dashboard-new-pawn-btn"
            type="button"
            onClick={onOpenNewPawn}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ รับจำนำเครื่องใหม่</span>
          </button>
        </div>
      </div>

      {/* Critical Attention Alerts Banner (Due Soon & Overdue) */}
      {(dueSoonContracts.length > 0 || overdueContracts.length > 0 || defaultedContracts.length > 0 || lockedContracts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {dueSoonContracts.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">ใกล้ครบกำหนด (ภายใน 3 วัน)</div>
                  <div className="text-xs text-amber-800">
                    ต้องติดตาม <strong>{dueSoonContracts.length} รายการ</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenLineNotify}
                className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 rounded-lg transition-colors"
              >
                ส่ง LINE
              </button>
            </div>
          )}

          {overdueContracts.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 text-red-800 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-red-950">เลยกำหนดชำระ (Overdue)</div>
                  <div className="text-xs text-red-800">
                    ค้างส่ง <strong>{overdueContracts.length} รายการ</strong> (ปรับ 50฿/วัน รวม {formatCurrency(totalOverduePenalties)})
                  </div>
                  {pendingLockWithin7Days.length > 0 && (
                    <div className="text-[11px] font-semibold text-rose-700 mt-0.5 flex items-center space-x-1">
                      <span>🚨 แจ้งเตือนล็อคเครื่องภายใน 7 วัน: {pendingLockWithin7Days.length} เครื่อง</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenLineNotify}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors"
              >
                ติดตามด่วน
              </button>
            </div>
          )}

          {defaultedContracts.length > 0 && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between border border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-800 text-amber-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">สินค้าหลุดจำนำ</div>
                  <div className="text-xs text-slate-400">
                    ตัดขายได้ <strong>{defaultedContracts.length} เครื่อง</strong>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                พร้อมวางสต็อก
              </span>
            </div>
          )}

          {/* Device Lock Alert Card */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${
              lockedContracts.length > 0
                ? 'bg-rose-50 border-rose-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-xl ${
                  lockedContracts.length > 0
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}
              >
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div
                  className={`text-xs font-bold ${
                    lockedContracts.length > 0 ? 'text-rose-950' : 'text-emerald-950'
                  }`}
                >
                  ระบบล็อคเครื่อง (Device Lock)
                </div>
                <div
                  className={`text-xs ${
                    lockedContracts.length > 0 ? 'text-rose-800 font-semibold' : 'text-emerald-800'
                  }`}
                >
                  {lockedContracts.length > 0
                    ? `สั่งล็อคแล้ว ${lockedContracts.length} เครื่อง`
                    : 'ทุกเครื่องสถานะปกติ'}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                lockedContracts.length > 0
                  ? 'bg-rose-200 text-rose-900'
                  : 'bg-emerald-200 text-emerald-900'
              }`}
            >
              {lockedContracts.length > 0 ? 'กำลังล็อค' : 'Active'}
            </span>
          </div>
        </div>
      )}

      {/* Dedicated Remote Device Lock Alert & Action Center */}
      {(lockedContracts.length > 0 || pendingLockContracts.length > 0) && (
        <div className="bg-white rounded-2xl border-2 border-rose-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 bg-linear-to-r from-rose-900 via-slate-900 to-amber-950 text-white flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-rose-500/30 border border-rose-400/40 rounded-lg text-rose-300">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>แจ้งเตือนศูนย์ควบคุมการล็อคเครื่องทางไกล (Device Remote Lock Center)</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/40 text-rose-200 border border-rose-400/40">
                    Real-time Alert
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  ระบบส่งสัญญาณล็อคหน้าจอสำหรับเครื่องที่เลยกำหนดชำระหรือผิดนัด ป้องกันการนำไปขายต่อ
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-lg font-semibold">
                🔒 ล็อคแล้ว {lockedContracts.length} เครื่อง
              </span>
              {pendingLockContracts.length > 0 && (
                <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-200 rounded-lg font-semibold">
                  ⚠️ ค้างชำระรอสั่งล็อค {pendingLockContracts.length} เครื่อง
                </span>
              )}
            </div>
          </div>

          {/* Policy Rule Bar */}
          <div className="px-5 py-2.5 bg-rose-50/80 border-b border-rose-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-rose-950">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
              <span>
                <strong>กฎระเบียบร้าน:</strong> หากเลยกำหนดชำระ 1 วัน จะมีค่าปรับวันละ <strong>50 บาท</strong> • <strong>ภายใน 7 วัน</strong>ระบบจะแจ้งเตือนให้สั่งล็อคเครื่องทางไกล
              </span>
            </div>
            <div className="text-rose-800 font-bold">
              ค่าปรับสะสมรวม: {formatCurrency(totalOverduePenalties)}
            </div>
          </div>

          {/* Content List */}
          <div className="p-5 space-y-4">
            {/* 1. Locked Devices List */}
            {lockedContracts.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-950 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <span>รายการเครื่องที่ถูกสั่งล็อคหน้าจอแล้วขณะนี้ ({lockedContracts.length} เครื่อง):</span>
                  </span>
                  <span className="text-slate-500 text-[11px]">หน้าจอโทรศัพท์จะขึ้นข้อความเตือนให้ชำระหนี้</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lockedContracts.map((cnt) => {
                    const statusInfo = getOverdueLockStatus(cnt.dueDate, true, 50);
                    return (
                      <div
                        key={cnt.id}
                        className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex flex-col justify-between space-y-2 hover:shadow-xs transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-900">
                                {cnt.device.brand} {cnt.device.model} ({cnt.device.storage})
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                                LOCKED
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              IMEI: <span className="font-mono font-semibold text-slate-800">{cnt.device.imei}</span> • สี {cnt.device.color}
                            </p>
                            <p className="text-[11px] text-slate-700">
                              ลูกค้า: <span className="font-semibold">{cnt.customerName}</span> ({cnt.customerPhone})
                            </p>
                            {statusInfo.overdueDays > 0 && (
                              <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded">
                                <span>เลยกำหนด {statusInfo.overdueDays} วัน</span>
                                <span>• ค่าปรับสะสม {formatCurrency(statusInfo.penaltyFee)} (50฿/วัน)</span>
                              </div>
                            )}
                            <p className="text-[11px] text-rose-900 font-medium">
                              เหตุผล: {cnt.lockInfo?.lockReason || 'เลยกำหนดชำระ'}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              สั่งล็อคเมื่อ: {cnt.lockInfo?.lockedAt} โดย {cnt.lockInfo?.lockedBy} • ระบบ: {cnt.lockInfo?.lockMethod || 'Knox Guard'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-rose-200/60">
                          <span className="text-xs font-bold text-amber-900">
                            เงินต้น: {formatCurrency(cnt.loanAmount)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => onOpenContractDetail(cnt)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                            >
                              ดูสัญญา
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onToggleDeviceLock) {
                                  onToggleDeviceLock(cnt.id, 'unlock');
                                }
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center space-x-1 transition-colors"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>ปลดล็อคเครื่อง</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Overdue Devices Pending Remote Lock */}
            {pendingLockContracts.length > 0 && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>แจ้งเตือนให้ล็อคเครื่อง: พบ {pendingLockContracts.length} รายการที่เลยกำหนดและยังไม่ได้ล็อค</span>
                  </span>
                  <span className="text-[11px] text-amber-800">คลิกเพื่อสั่งล็อคทันที</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {pendingLockContracts.map((cnt) => {
                    const statusInfo = getOverdueLockStatus(cnt.dueDate, false, 50);
                    return (
                      <div
                        key={cnt.id}
                        className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <div className="font-bold text-slate-900 text-xs">
                              {cnt.device.brand} {cnt.device.model}
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                              ค้างชำระ
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-500 font-mono">
                            IMEI: {cnt.device.imei}
                          </div>
                          <div className="text-[11px] text-slate-700">
                            ลูกค้า: <span className="font-semibold">{cnt.customerName}</span>
                          </div>
                          <div className="text-[11px] text-red-700 font-bold">
                            ครบกำหนด: {formatThaiDate(cnt.dueDate)} (เลยกำหนด {statusInfo.overdueDays} วัน)
                          </div>
                          <div className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded font-semibold flex items-center justify-between">
                            <span>ค่าปรับ (50฿/วัน):</span>
                            <span>{formatCurrency(statusInfo.penaltyFee)}</span>
                          </div>
                          {statusInfo.isWithin7Days ? (
                            <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                              🚨 ภายใน 7 วันแจ้งเตือนล็อคเครื่อง (เหลือ {statusInfo.daysRemaining} วัน)
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              ⚠️ เลยกำหนดเกิน 7 วัน (เกณฑ์หลุดจำนำ)
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            เงินต้น: {formatCurrency(cnt.loanAmount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onToggleDeviceLock) {
                                onToggleDeviceLock(
                                  cnt.id,
                                  'lock',
                                  `เลยกำหนดชำระ ${statusInfo.overdueDays} วัน ค่าปรับ ${statusInfo.penaltyFee} บาท สั่งล็อคตามเกณฑ์ 7 วัน`,
                                  cnt.lockInfo?.lockMethod || 'Knox Guard'
                                );
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center space-x-1 transition-colors"
                          >
                            <Lock className="w-3 h-3" />
                            <span>สั่งล็อคเครื่อง</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Loan Portfolio */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ยอดเงินต้นจำนำคงค้าง</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(totalActiveLoanAmount)}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <span className="font-semibold text-emerald-600">{activeContracts.length + dueSoonContracts.length + overdueContracts.length} สัญญา</span>
            <span>ที่ยังไม่ไถ่ถอน</span>
          </div>
        </div>

        {/* Card 2: Interest Revenue Collected */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ดอกเบี้ยรับชำระสะสม</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-700 tracking-tight">
            +{formatCurrency(totalInterestCollected)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            อัตรา 25% ต่อเดือน / รายสัปดาห์
          </div>
        </div>

        {/* Card 3: Total Redeemed Principal Returned */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>ยอดไถ่ถอนเครื่องคืน</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-blue-700 tracking-tight">
            {formatCurrency(totalRedeemedAmount)}
          </div>
          <div className="text-[11px] text-slate-500">
            ปิดสัญญาสำเร็จ {redeemedContracts.length} เครื่อง
          </div>
        </div>

        {/* Card 4: Customers / Members */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>สมาชิกและลูกค้าในระบบ</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-900 tracking-tight">
            {customers.length} ท่าน
          </div>
          <div className="text-[11px] text-slate-500">
            {customers.filter((c) => c.status === 'vip').length} สมาชิก VIP
          </div>
        </div>
      </div>

      {/* Graphical Revenue & Profit Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                กราฟวิเคราะห์รายรับดอกเบี้ยและยอดจำนำรายเดือน
              </h3>
              <p className="text-xs text-slate-500">
                เปรียบเทียบยอดปล่อยจำนำใหม่ ยอดดอกเบี้ยรับชำระ และยอดไถ่ถอน
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center space-x-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>ยอดปล่อยจำนำ</span>
              </span>
              <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>ดอกเบี้ยที่ได้รับ</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <Bar dataKey="newPawns" name="ยอดรับจำนำใหม่" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="interest" name="รายได้ดอกเบี้ย" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Device Brand Breakdown & Cloud Status */}
        <div className="lg:col-span-4 space-y-4">
          {/* Brand breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900">สัดส่วนยี่ห้อโทรศัพท์มือถือที่รับจำนำ:</h4>
            <div className="space-y-2.5">
              {Object.entries(brandCountMap).map(([brand, count]) => {
                const percentage = Math.round((count / filteredContracts.length) * 100) || 0;
                return (
                  <div key={brand} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{brand}</span>
                      <span>
                        {count} เครื่อง ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          brand === 'Apple'
                            ? 'bg-slate-800'
                            : brand === 'Samsung'
                            ? 'bg-blue-600'
                            : brand === 'Xiaomi'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Cloud Sync Widget */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Google Sheets Backup</div>
                <div className="text-[11px] text-slate-500">สำรองข้อมูลขึ้นคลาวด์ปลอดภัย</div>
              </div>
            </div>
            <button
              id="dash-open-cloud-btn"
              type="button"
              onClick={onOpenCloudBackup}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 rounded-lg text-xs transition-colors shadow-xs"
            >
              จัดการซิงก์
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Attention Contracts List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              รายการที่ต้องดำเนินการและติดตามทันที (Urgent Contracts)
            </h3>
            <p className="text-xs text-slate-500">
              สัญญาที่ใกล้ครบกำหนดชำระ สัญญาเกินกำหนด และสินค้าหลุดจำนำ
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {[...dueSoonContracts, ...overdueContracts, ...defaultedContracts].length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              ยอดเยี่ยม! ขณะนี้ไม่มีสัญญาที่เลยกำหนดชำระหรือใกล้ครบกำหนด
            </div>
          ) : (
            [...dueSoonContracts, ...overdueContracts, ...defaultedContracts].map((c) => {
              const { baseInterest, overdueDays, penaltyFee, totalInterestDue } =
                calculatePayableAmounts(c.loanAmount, c.interestRateMonthly, c.dueDate);

              return (
                <div
                  key={c.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{c.contractNumber}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.status === 'due_soon'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {c.status === 'due_soon'
                          ? 'ใกล้ครบกำหนด'
                          : c.status === 'overdue'
                          ? `เกินกำหนด ${overdueDays} วัน`
                          : 'สินค้าหลุดจำนำ'}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 font-medium">{c.branchName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                      <span className="font-bold">
                        {c.device.brand} {c.device.model} ({c.device.storage})
                      </span>
                      <span className="text-slate-400">|</span>
                      <span className="font-mono text-[11px] text-slate-500">IMEI: {c.device.imei}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-600">ลูกค้า: {c.customerName} ({c.customerPhone})</span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      ยอดเงินต้น: <strong className="text-slate-900">{formatCurrency(c.loanAmount)}</strong> • ดอกเบี้ยต่องวด:{' '}
                      <strong className="text-amber-800">{formatCurrency(baseInterest)}</strong> • วันครบกำหนด:{' '}
                      <strong className={c.status === 'overdue' ? 'text-red-600' : 'text-slate-800'}>
                        {formatThaiDate(c.dueDate)}
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => onOpenInvoice(c)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>แจ้งหนี้ / LINE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenThermalPrint(c)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                      title="พิมพ์ใบสัญญา"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenContractDetail(c)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
                    >
                      จัดการสัญญา
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
