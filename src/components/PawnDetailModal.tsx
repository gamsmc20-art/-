import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Package,
  Calendar,
  DollarSign,
  User,
  Smartphone,
  ShieldCheck,
  CreditCard,
  History,
  Send,
  Lock,
  Unlock,
} from 'lucide-react';
import { PawnContract, Branch, SystemUser, DeviceLockInfo } from '../types';
import {
  formatThaiDate,
  formatCurrency,
  calculatePayableAmounts,
  addDaysToDate,
} from '../utils/calculator';

interface PawnDetailModalProps {
  contract: PawnContract;
  branch: Branch;
  currentUser: SystemUser;
  onClose: () => void;
  onPayInterest: (contractId: string, amount: number, periodDays: number, note?: string) => void;
  onRedeem: (contractId: string, totalAmount: number, note?: string) => void;
  onMarkDefaulted: (contractId: string) => void;
  onToggleDeviceLock?: (contractId: string, action: 'lock' | 'unlock', reason?: string, method?: any) => void;
  onOpenPrint: (contract: PawnContract) => void;
  onOpenInvoice: (contract: PawnContract) => void;
}

export const PawnDetailModal: React.FC<PawnDetailModalProps> = ({
  contract,
  branch,
  currentUser,
  onClose,
  onPayInterest,
  onRedeem,
  onMarkDefaulted,
  onToggleDeviceLock,
  onOpenPrint,
  onOpenInvoice,
}) => {
  const isWeekly = contract.interestCycle === 'weekly';
  const [activeTab, setActiveTab] = useState<'overview' | 'pay_interest' | 'redeem' | 'history'>('overview');
  const [interestPeriod, setInterestPeriod] = useState<number>(isWeekly ? 7 : 30);
  const [interestNote, setInterestNote] = useState('');
  const [redeemNote, setRedeemNote] = useState('');
  const [confirmDefaultOpen, setConfirmDefaultOpen] = useState(false);

  // Device Lock Modal state
  const [lockPromptOpen, setLockPromptOpen] = useState(false);
  const [lockReasonInput, setLockReasonInput] = useState('ค้างส่งดอกเบี้ยเกินกำหนด ติดต่อลูกค้าไม่ได้');
  const [lockMethodInput, setLockMethodInput] = useState<'Knox Guard' | 'iCloud Lost Mode' | 'MDM Enterprise' | 'Remote Lock APK' | 'Manual'>(
    contract.lockInfo?.lockMethod || 'Knox Guard'
  );

  const { baseInterest, overdueDays, penaltyFee, totalInterestDue, totalRedemptionAmount } =
    calculatePayableAmounts(
      contract.loanAmount,
      contract.interestRateMonthly,
      contract.dueDate,
      50, // 50 THB/day penalty for overdue payments
      contract.interestCycle || 'monthly',
      interestPeriod,
      contract.interestRateWeekly
    );

  // Status badge
  const getStatusBadge = () => {
    switch (contract.status) {
      case 'active':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">กำลังจำนำ (ปกติ)</span>;
      case 'due_soon':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">ใกล้ครบกำหนด</span>;
      case 'overdue':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">เลยกำหนดชำระ ({overdueDays} วัน)</span>;
      case 'defaulted':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-white">สินค้าหลุดจำนำ</span>;
      case 'redeemed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">ไถ่ถอนแล้ว</span>;
    }
  };

  const handleExecuteInterestPayment = () => {
    onPayInterest(contract.id, totalInterestDue, interestPeriod, interestNote);
    setActiveTab('overview');
  };

  const handleExecuteRedemption = () => {
    onRedeem(contract.id, totalRedemptionAmount, redeemNote);
    setActiveTab('overview');
  };

  return (
    <div id="pawn-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{contract.contractNumber}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-500">{contract.branchName} • ลูกค้า: {contract.customerName}</p>
            </div>
          </div>
          <button
            id="close-pawn-detail-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex space-x-6 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลสัญญา
          </button>
          {contract.status !== 'redeemed' && contract.status !== 'defaulted' && (
            <>
              <button
                id="tab-pay-interest-btn"
                type="button"
                onClick={() => setActiveTab('pay_interest')}
                className={`py-3 font-semibold border-b-2 transition-all ${
                  activeTab === 'pay_interest'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                ชำระดอกเบี้ย / ต่อสัญญา
              </button>
              <button
                id="tab-redeem-btn"
                type="button"
                onClick={() => setActiveTab('redeem')}
                className={`py-3 font-semibold border-b-2 transition-all ${
                  activeTab === 'redeem'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                ไถ่ถอนเครื่อง (ปิดยอด)
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ประวัติการเงิน ({contract.paymentHistory.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap gap-2">
                <button
                  id="modal-open-thermal-btn"
                  type="button"
                  onClick={() => onOpenPrint(contract)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์ใบสัญญาความร้อน</span>
                </button>
                <button
                  id="modal-open-invoice-btn"
                  type="button"
                  onClick={() => onOpenInvoice(contract)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>สร้างใบแจ้งหนี้ / LINE</span>
                </button>
                {contract.status === 'overdue' && (
                  <button
                    id="modal-mark-defaulted-btn"
                    type="button"
                    onClick={() => setConfirmDefaultOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>ตัดเป็นสินค้าหลุดจำนำ</span>
                  </button>
                )}
              </div>

              {/* Confirmation for default */}
              {confirmDefaultOpen && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-red-900">
                    ยืนยันการตัดสินค้าหลุดจำนำสำหรับสัญญา {contract.contractNumber}?
                  </div>
                  <p className="text-xs text-red-700">
                    เมื่อตัดเป็นสินค้าหลุดจำนำ ทรัพย์สินจะถูกโอนย้ายไปยังสต็อกขายหน้าร้าน และสัญญานี้จะสิ้นสุดลง
                  </p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        onMarkDefaulted(contract.id);
                        setConfirmDefaultOpen(false);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      ยืนยันตัดหลุดจำนำ
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDefaultOpen(false)}
                      className="px-3 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}

              {/* Overdue & 7-Day Device Lock Alert Banner */}
              {overdueDays > 0 && (
                <div
                  className={`p-4 rounded-xl border space-y-2.5 ${
                    overdueDays <= 7
                      ? 'bg-rose-50 border-rose-300'
                      : 'bg-slate-900 text-white border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle
                        className={`w-5 h-5 shrink-0 ${
                          overdueDays <= 7 ? 'text-rose-600' : 'text-amber-400'
                        }`}
                      />
                      <div>
                        <span
                          className={`text-sm font-bold ${
                            overdueDays <= 7 ? 'text-rose-950' : 'text-white'
                          }`}
                        >
                          สัญญาเลยกำหนดชำระแล้ว {overdueDays} วัน (ค่าปรับวันละ 50 บาท รวม {formatCurrency(penaltyFee)})
                        </span>
                        <div
                          className={`text-xs ${
                            overdueDays <= 7 ? 'text-rose-700' : 'text-slate-300'
                          }`}
                        >
                          {overdueDays <= 7
                            ? `⚠️ เกณฑ์แจ้งเตือนล็อคเครื่อง: อยู่ในช่วง 7 วัน (เหลือเวลาอีก ${7 - overdueDays} วัน)`
                            : '🚨 เกณฑ์สินค้าหลุดจำนำ: เลยกำหนดเกิน 7 วันแล้ว สามารถดำเนินการตัดหลุดจำนำได้'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {contract.lockInfo?.status === 'locked' ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white flex items-center space-x-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>สั่งล็อคเครื่องแล้ว</span>
                        </span>
                      ) : (
                        overdueDays <= 7 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onToggleDeviceLock) {
                                onToggleDeviceLock(
                                  contract.id,
                                  'lock',
                                  `เลยกำหนดชำระ ${overdueDays} วัน (ค่าปรับสะสม ${penaltyFee} บาท) สั่งล็อคตามเกณฑ์แจ้งเตือน 7 วัน`,
                                  contract.lockInfo?.lockMethod || 'Knox Guard'
                                );
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs flex items-center space-x-1.5 text-xs transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>สั่งล็อคเครื่องทันที</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-[11px] leading-relaxed pt-1 border-t ${
                      overdueDays <= 7 ? 'border-rose-200 text-rose-800' : 'border-slate-700 text-slate-300'
                    }`}
                  >
                    📌 <strong>นโยบายร้าน:</strong> หากเลยกำหนดชำระ 1 วัน จะมีค่าปรับวันละ 50 บาท และภายใน 7 วันระบบจะแจ้งเตือนให้ส่งคำสั่งล็อคเครื่องทางไกลเพื่อระงับการใช้งาน
                  </p>
                </div>
              )}

              {/* Financial Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">เงินต้นรับจำนำ</span>
                  <span className="text-base font-bold text-slate-900">{formatCurrency(contract.loanAmount)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">อัตราดอกเบี้ย</span>
                  <span className="text-base font-bold text-amber-700">{contract.interestRateMonthly}% / เดือน</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">ดอกเบี้ยต่องวด</span>
                  <span className="text-base font-bold text-slate-800">{formatCurrency(baseInterest)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">วันครบกำหนด</span>
                  <span className={`text-base font-bold ${overdueDays > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                    {formatThaiDate(contract.dueDate)}
                  </span>
                </div>
              </div>

              {/* Customer details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>ข้อมูลผู้จำนำ</span>
                </h4>
                <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">ชื่อ:</span> <span className="font-semibold text-slate-800">{contract.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">เบอร์โทรศัพท์:</span>{' '}
                    <span className="font-semibold text-slate-800">{contract.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">เลขประจำตัวประชาชน:</span>{' '}
                    <span className="text-slate-800">{contract.customerIdCard}</span>
                  </div>
                  {contract.customerAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">ที่อยู่:</span> <span className="text-slate-700">{contract.customerAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Device specs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>ข้อมูลทรัพย์สินและสภาพเครื่อง</span>
                </h4>
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block">รุ่น:</span>
                      <span className="font-bold text-slate-900">{contract.device.brand} {contract.device.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ความจุ & สี:</span>
                      <span className="font-semibold text-slate-800">{contract.device.storage} • {contract.device.color}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">เกรดสภาพเครื่อง:</span>
                      <span className="font-bold text-amber-800">เกรด {contract.device.condition.grade}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">เลขอีมี่ (IMEI):</span>
                      <span className="font-mono font-semibold text-slate-800">{contract.device.imei}</span>
                    </div>
                    {contract.device.serialNumber && (
                      <div>
                        <span className="text-slate-500 block">Serial No.:</span>
                        <span className="font-mono text-slate-800">{contract.device.serialNumber}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 block">สุขภาพแบตเตอรี่:</span>
                      <span className="font-semibold text-slate-800">{contract.device.condition.batteryHealth || '-'}%</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ปลดล็อค iCloud/Google ID และรหัสผ่านเครื่องเรียบร้อยแล้ว</span>
                  </div>
                  {contract.device.condition.accessories.length > 0 && (
                    <div className="text-slate-600">
                      <span className="font-medium">อุปกรณ์เสริม:</span> {contract.device.condition.accessories.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Remote Device Lock Status & Control Panel */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>ระบบควบคุมการล็อคเครื่องทางไกล (Remote Device Lock Control)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    ระบบ: {contract.lockInfo?.lockMethod || 'Knox Guard'}
                  </span>
                </h4>

                <div
                  className={`p-4 rounded-xl border transition-all ${
                    contract.lockInfo?.status === 'locked'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          contract.lockInfo?.status === 'locked'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-emerald-600 text-white shadow-xs'
                        }`}
                      >
                        {contract.lockInfo?.status === 'locked' ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <Unlock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              contract.lockInfo?.status === 'locked'
                                ? 'bg-red-200 text-red-900'
                                : 'bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {contract.lockInfo?.status === 'locked'
                              ? 'เครื่องถูกล็อคหน้าจอแล้ว (LOCKED)'
                              : 'เครื่องปลดล็อคอยู่ (UNLOCKED / ปกติ)'}
                          </span>
                          <span className="text-xs text-slate-500">
                            IMEI: <span className="font-mono font-semibold">{contract.device.imei}</span>
                          </span>
                        </div>
                        {contract.lockInfo?.status === 'locked' ? (
                          <div className="mt-1.5 text-xs text-red-900 space-y-0.5">
                            <p>
                              <strong>เหตุผลที่ล็อค:</strong> {contract.lockInfo.lockReason || 'เลยกำหนดชำระ สั่งล็อคจากระบบ'}
                            </p>
                            <p className="text-[11px] text-red-700">
                              สั่งล็อคเมื่อ: {contract.lockInfo.lockedAt} โดย: {contract.lockInfo.lockedBy}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-emerald-800">
                            เครื่องพร้อมใช้งานตามปกติ หากลูกค้าค้างชำระเกินกำหนด สามารถกดสั่งล็อคหน้าจอทางไกลได้ทันที
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center space-x-2">
                      {contract.lockInfo?.status === 'locked' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (onToggleDeviceLock) {
                              onToggleDeviceLock(contract.id, 'unlock');
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>ส่งคำสั่งปลดล็อคเครื่อง</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setLockPromptOpen(true)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>สั่งล็อคเครื่องทางไกล</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-modal: Confirm Lock Dialog */}
                {lockPromptOpen && (
                  <div className="p-4 bg-white rounded-xl border-2 border-red-400 shadow-md space-y-3">
                    <div className="flex items-center space-x-2 text-red-800 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>ยืนยันการส่งคำสั่งล็อคหน้าจอโทรศัพท์เครื่องนี้?</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      เมื่อยืนยัน ระบบจะส่งสัญญาณล็อคไปยังเครื่องผ่าน {lockMethodInput} หน้าจอโทรศัพท์จะขึ้นข้อความเตือนให้ติดต่อร้านค้าเพื่อชำระหนี้ และจะแสดงการแจ้งเตือนบนแดชบอร์ด
                    </p>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">เหตุผลที่สั่งล็อค:</label>
                      <input
                        type="text"
                        value={lockReasonInput}
                        onChange={(e) => setLockReasonInput(e.target.value)}
                        className="w-full text-xs py-1.5 px-3 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setLockPromptOpen(false)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onToggleDeviceLock) {
                            onToggleDeviceLock(contract.id, 'lock', lockReasonInput, lockMethodInput);
                          }
                          setLockPromptOpen(false);
                        }}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>ยืนยันสั่งล็อคเครื่องทันที</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pay_interest' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-amber-900">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  <span>คำนวณยอดชำระดอกเบี้ยเพื่อขยายระยะเวลาสัญญา</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">เงินต้นคงค้าง:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(contract.loanAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">วันครบกำหนดเดิม:</span>
                    <span className="font-bold text-slate-900">{formatThaiDate(contract.dueDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">อัตราดอกเบี้ย:</span>
                    <span className="font-bold text-amber-800">
                      {contract.interestRateMonthly}% / เดือน
                      {contract.interestCycle === 'weekly' && ` (${contract.interestRateWeekly || (contract.interestRateMonthly/4)}% / สัปดาห์)`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">ดอกเบี้ยต่องวด ({interestPeriod} วัน):</span>
                    <span className="font-bold text-amber-800">{formatCurrency(baseInterest)}</span>
                  </div>
                  {overdueDays > 0 && (
                    <div className="sm:col-span-2 bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-700 font-bold">
                          ค่าปรับล่าช้า ({overdueDays} วัน × วันละ 50 บาท):
                        </span>
                        <span className="font-bold text-red-600 text-sm">
                          {formatCurrency(penaltyFee)}
                        </span>
                      </div>
                      <div className="text-[10px] text-red-600">
                        * คิดค่าปรับ 50 บาทต่อวันนับตั้งแต่เลยกำหนดชำระ 1 วัน
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">เลือกระยะเวลาต่อสัญญาใหม่:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setInterestPeriod(7)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      interestPeriod === 7
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">7 วัน (1 สัปดาห์)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      +7 วันจากเดิม
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestPeriod(14)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      interestPeriod === 14
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">14 วัน (2 สัปดาห์)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      +14 วันจากเดิม
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestPeriod(15)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      interestPeriod === 15
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">15 วัน (ครึ่งเดือน)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      +15 วันจากเดิม
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestPeriod(30)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      interestPeriod === 30
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">30 วัน (1 เดือน)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      +30 วันจากเดิม
                    </div>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">วันครบกำหนดใหม่ที่จะบันทึก:</span>
                  <span className="font-bold text-emerald-700">
                    {formatThaiDate(addDaysToDate(contract.dueDate, interestPeriod))}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">หมายเหตุการรับเงิน (ถ้ามี):</label>
                  <input
                    type="text"
                    placeholder="เช่น ชำระผ่านพร้อมเพย์ ธนาคารกสิกรไทย"
                    value={interestNote}
                    onChange={(e) => setInterestNote(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">ยอดรวมที่ต้องรับชำระสุทธิ:</span>
                    <span className="text-xl font-bold text-amber-400">{formatCurrency(totalInterestDue)}</span>
                  </div>
                  <button
                    id="execute-pay-interest-confirm-btn"
                    type="button"
                    onClick={handleExecuteInterestPayment}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 font-bold text-sm text-white rounded-xl shadow-md transition-colors"
                  >
                    บันทึกรับชำระดอกเบี้ย
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'redeem' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center space-x-2 text-sm font-bold text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>ไถ่ถอนเครื่องคืน (ปิดสัญญาจำนำ)</span>
                </div>
                <p className="text-xs text-emerald-800">
                  ลูกค้านำเงินต้นพร้อมดอกเบี้ยคงค้างมาชำระครบถ้วน และส่งมอบโทรศัพท์มือถือคืนแก่ลูกค้า
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs bg-slate-50">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">เงินต้นจำนำ:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(contract.loanAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">ดอกเบี้ยงวดสุดท้าย:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(baseInterest)}</span>
                </div>
                {overdueDays > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 text-red-600">
                    <span>ค่าปรับล่าช้า ({overdueDays} วัน × 50 บาท):</span>
                    <span className="font-bold">{formatCurrency(penaltyFee)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm font-bold text-slate-900">
                  <span>ยอดปิดสัญญาสุทธิ:</span>
                  <span className="text-emerald-700 text-base">{formatCurrency(totalRedemptionAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">หมายเหตุการไถ่ถอน:</label>
                <input
                  type="text"
                  placeholder="เช่น ตรวจสอบเครื่องและอุปกรณ์เรียบร้อย ลูกค้าเซ็นรับคืนแล้ว"
                  value={redeemNote}
                  onChange={(e) => setRedeemNote(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <button
                id="execute-redeem-confirm-btn"
                type="button"
                onClick={handleExecuteRedemption}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold text-sm text-white rounded-xl shadow-md transition-colors"
              >
                ยืนยันการไถ่ถอนเครื่อง (รับเงิน {formatCurrency(totalRedemptionAmount)})
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <span>บันทึกประวัติการรับชำระเงิน</span>
              </h4>
              {contract.paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  ยังไม่มีประวัติการชำระดอกเบี้ยสำหรับสัญญานี้
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {contract.paymentHistory.map((p) => (
                    <div key={p.id} className="p-3.5 bg-white flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">
                          {p.type === 'interest' ? 'ชำระดอกเบี้ย' : p.type === 'redemption' ? 'ไถ่ถอนสัญญา' : 'ตัดเงินต้น'} • {p.receiptNumber}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          วันที่: {formatThaiDate(p.date)} {p.newDueDate && `(ขยายถึง ${formatThaiDate(p.newDueDate)})`}
                        </div>
                        {p.note && <div className="text-slate-400 text-[11px]">{p.note}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-700 text-sm">+{formatCurrency(p.amount)}</div>
                        <div className="text-slate-400 text-[10px]">บันทึกโดย: {p.recordedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
