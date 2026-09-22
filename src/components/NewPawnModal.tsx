import React, { useState } from 'react';
import {
  X,
  Smartphone,
  User,
  ShieldCheck,
  Calculator,
  Plus,
  CheckCircle2,
  Printer,
  Sparkles,
  Lock,
} from 'lucide-react';
import { PawnContract, Customer, Branch, DeviceCondition, SystemUser, DeviceLockInfo } from '../types';
import {
  formatCurrency,
  calculateMonthlyInterest,
  calculateWeeklyInterest,
  calculateInterestByCycle,
  addDaysToDate,
} from '../utils/calculator';

interface NewPawnModalProps {
  customers: Customer[];
  branches: Branch[];
  currentUser: SystemUser;
  onClose: () => void;
  onSave: (newContract: PawnContract, newCustomer?: Customer, openPrintDirectly?: boolean) => void;
}

export const NewPawnModal: React.FC<NewPawnModalProps> = ({
  customers,
  branches,
  currentUser,
  onClose,
  onSave,
}) => {
  // Mode: Select existing customer or create new customer
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('new');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');

  // New Customer Fields
  const [newCustName, setNewCustName] = useState('');
  const [newCustIdCard, setNewCustIdCard] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustLineId, setNewCustLineId] = useState('');

  // Device Info
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 15 Pro Max');
  const [storage, setStorage] = useState('256GB');
  const [color, setColor] = useState('Natural Titanium');
  const [imei, setImei] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  // Condition checklist
  const [grade, setGrade] = useState<'A' | 'B' | 'C'>('A');
  const [screenCondition, setScreenCondition] = useState('จอแท้ ไม่แตก ไม่มีรอยขีดข่วน');
  const [batteryHealth, setBatteryHealth] = useState(95);
  const [icloudRemoved, setIcloudRemoved] = useState(true);
  const [accessories, setAccessories] = useState<string[]>(['กล่องแท้ครบ', 'สายชาร์จแท้']);
  const [notes, setNotes] = useState('');

  // Loan & Financials (Updated for 25% rate and Weekly/Monthly cycles)
  const [appraisedValue, setAppraisedValue] = useState(32000);
  const [loanAmount, setLoanAmount] = useState(25000);
  const [interestCycle, setInterestCycle] = useState<'monthly' | 'weekly'>('monthly');
  const [interestRateMonthly, setInterestRateMonthly] = useState(25.0); // ค่าตั้งต้น 25% ต่อเดือน
  const [interestRateWeekly, setInterestRateWeekly] = useState(6.25); // ค่าตั้งต้น 6.25% ต่อสัปดาห์ (เทียบเท่า 25% ต่อเดือน)
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [periodDays, setPeriodDays] = useState(30);
  const [branchId, setBranchId] = useState(currentUser.branchId || branches[0]?.id || '');

  // Remote Device Lock System State
  const [remoteLockEnabled, setRemoteLockEnabled] = useState(true);
  const [remoteLockMethod, setRemoteLockMethod] = useState<'Knox Guard' | 'iCloud Lost Mode' | 'MDM Enterprise' | 'Remote Lock APK' | 'Manual'>('Knox Guard');

  const [printAfterSave, setPrintAfterSave] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Common accessory options
  const accessoryOptions = [
    'กล่องแท้ครบ',
    'หัวชาร์จแท้',
    'สายชาร์จแท้',
    'หูฟังแท้',
    'ใบเสร็จรับเงินศูนย์',
    'เคสกันกระแทก',
  ];

  const toggleAccessory = (acc: string) => {
    if (accessories.includes(acc)) {
      setAccessories(accessories.filter((a) => a !== acc));
    } else {
      setAccessories([...accessories, acc]);
    }
  };

  // Predefined phone models for fast entry
  const popularPresets = [
    { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '256GB', appraised: 34000, loan: 26000 },
    { brand: 'Apple', model: 'iPhone 15 Pro', storage: '128GB', appraised: 29000, loan: 22000 },
    { brand: 'Apple', model: 'iPhone 14 Pro Max', storage: '128GB', appraised: 24000, loan: 18000 },
    { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '512GB', appraised: 32000, loan: 24000 },
    { brand: 'Samsung', model: 'Galaxy Z Flip 5', storage: '256GB', appraised: 19000, loan: 14000 },
    { brand: 'Xiaomi', model: 'Xiaomi 14 Ultra', storage: '512GB', appraised: 26000, loan: 19000 },
  ];

  const handleApplyPreset = (preset: (typeof popularPresets)[0]) => {
    setBrand(preset.brand);
    setModel(preset.model);
    setStorage(preset.storage);
    setAppraisedValue(preset.appraised);
    setLoanAmount(preset.loan);
  };

  const periodicInterest = interestCycle === 'weekly'
    ? calculateWeeklyInterest(loanAmount, interestRateWeekly) * Math.max(1, Math.round(periodDays / 7))
    : calculateInterestByCycle(loanAmount, interestRateMonthly, 'monthly', periodDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!icloudRemoved) {
      setErrorMsg('กรุณายืนยันการปลดล็อค iCloud / Google Account เพื่อความปลอดภัยก่อนรับจำนำ');
      return;
    }

    if (!imei || imei.trim().length < 8) {
      setErrorMsg('กรุณาระบุเลข IMEI ให้ถูกต้อง (อย่างน้อย 8-15 หลัก)');
      return;
    }

    if (loanAmount <= 0) {
      setErrorMsg('กรุณาระบุยอดเงินต้นรับจำนำที่มากกว่า 0');
      return;
    }

    let customerObj: Customer;
    let createdNewCustomer: Customer | undefined;

    if (customerMode === 'new') {
      if (!newCustName.trim() || !newCustPhone.trim()) {
        setErrorMsg('กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์');
        return;
      }
      const newCustId = `CUST-${Date.now().toString().slice(-4)}`;
      customerObj = {
        id: newCustId,
        fullName: newCustName.trim(),
        idCard: newCustIdCard.trim() || '1-0000-00000-00-0',
        phone: newCustPhone.trim(),
        address: newCustAddress.trim() || '-',
        lineId: newCustLineId.trim(),
        memberSince: new Date().toISOString().split('T')[0],
        status: 'regular',
        activeContractsCount: 1,
        totalHistoryContracts: 1,
      };
      createdNewCustomer = customerObj;
    } else {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (!found) {
        setErrorMsg('ไม่พบข้อมูลลูกค้าที่เลือก');
        return;
      }
      customerObj = found;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDateStr = addDaysToDate(todayStr, periodDays);

    const selectedBranch = branches.find((b) => b.id === branchId) || branches[0];
    const contractNum = `PN-${todayStr.replace(/-/g, '').slice(2, 6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newContract: PawnContract = {
      id: `cnt-${Date.now()}`,
      contractNumber: contractNum,
      customerId: customerObj.id,
      customerName: customerObj.fullName,
      customerPhone: customerObj.phone,
      customerIdCard: customerObj.idCard,
      customerAddress: customerObj.address,
      branchId: selectedBranch.id,
      branchName: selectedBranch.name,
      device: {
        brand,
        model,
        storage,
        color,
        imei: imei.trim(),
        serialNumber: serialNumber.trim(),
        condition: {
          grade,
          screenCondition,
          batteryHealth,
          icloudRemoved,
          accessories,
          notes,
        },
      },
      loanAmount,
      appraisedValue,
      interestCycle,
      interestRateMonthly,
      interestRateWeekly: interestCycle === 'weekly' ? interestRateWeekly : Math.round((interestRateMonthly / 4) * 100) / 100,
      contractDate: todayStr,
      dueDate: dueDateStr,
      status: 'active',
      lockInfo: {
        status: 'unlocked',
        lockMethod: remoteLockEnabled ? remoteLockMethod : 'Manual',
        lastPingTime: 'พร้อมเชื่อมต่อ',
      },
      totalInterestPaid: 0,
      interestPeriodsPaid: 0,
      paymentHistory: [],
      createdBy: currentUser.name,
    };

    onSave(newContract, createdNewCustomer, printAfterSave);
  };

  return (
    <div id="new-pawn-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-500/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">บันทึกรับจำนำเครื่องใหม่ (New Pawn)</h3>
              <p className="text-xs text-slate-600">
                ระบบคำนวณดอกเบี้ยอัตโนมัติ • ตรวจสอบ IMEI และสภาพเครื่องอย่างละเอียด
              </p>
            </div>
          </div>
          <button
            id="close-new-pawn-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <span className="font-semibold">ข้อผิดพลาด:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Presets Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>เลือกรุ่นยอดนิยมด่วน:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                >
                  {p.brand} {p.model} ({p.storage})
                </button>
              ))}
            </div>
          </div>

          {/* Branch & User info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">สาขาที่ทำรายการ:</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full text-xs font-medium py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เจ้าหน้าที่ผู้รับจำนำ:</label>
              <input
                type="text"
                readOnly
                value={currentUser.name}
                className="w-full text-xs py-2 px-3 bg-slate-200/70 border border-slate-300 rounded-lg text-slate-700"
              />
            </div>
          </div>

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                <User className="w-4 h-4 text-amber-600" />
                <span>1. ข้อมูลลูกค้า / ผู้จำนำ</span>
              </div>
              <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setCustomerMode('new')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    customerMode === 'new' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  + ลูกค้าใหม่
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode('existing')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    customerMode === 'existing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  เลือกลูกค้าเดิม ({customers.length})
                </button>
              </div>
            </div>

            {customerMode === 'existing' ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ค้นหา/เลือกลูกค้าจากฐานข้อมูล:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} • {c.phone} • บัตร ปชช: {c.idCard} ({c.status === 'vip' ? 'VIP' : 'ทั่วไป'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นายธนกร รัตนไพบูลย์"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081-xxx-xxxx"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">เลขบัตรประชาชน 13 หลัก</label>
                  <input
                    type="text"
                    placeholder="x-xxxx-xxxxx-xx-x"
                    value={newCustIdCard}
                    onChange={(e) => setNewCustIdCard(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">LINE ID</label>
                  <input
                    type="text"
                    placeholder="ไอดีไลน์ลูกค้า"
                    value={newCustLineId}
                    onChange={(e) => setNewCustLineId(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">ที่อยู่ตามบัตรประชาชน / ที่อยู่ปัจจุบัน</label>
                  <input
                    type="text"
                    placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Device Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>2. รายละเอียดโทรศัพท์มือถือและสภาพตัวเครื่อง</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ยี่ห้อ (Brand)</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Oppo">Oppo</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Realme">Realme</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Huawei">Huawei</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">รุ่น (Model)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น iPhone 15 Pro Max"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ความจุ (Storage)</label>
                <select
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="64GB">64GB</option>
                  <option value="128GB">128GB</option>
                  <option value="256GB">256GB</option>
                  <option value="512GB">512GB</option>
                  <option value="1TB">1TB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">สีเครื่อง</label>
                <input
                  type="text"
                  placeholder="เช่น Natural Titanium"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  หมายเลข IMEI (15 หลัก) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="กด *#06# เพื่อดูเลขอีมี่"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="w-full text-xs font-mono py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Serial Number (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="เช่น F2LL7890AA"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full text-xs font-mono py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Condition check */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">เกรดสภาพเครื่อง</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as 'A' | 'B' | 'C')}
                    className="w-full text-xs font-semibold py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="A">เกรด A (สวยกริ๊บ 95-100%)</option>
                    <option value="B">เกรด B (สภาพดี มีรอยเล็กน้อย 85-94%)</option>
                    <option value="C">เกรด C (มีริ้วรอย/รอยถลอก 70-84%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">สุขภาพแบตเตอรี่ (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(parseInt(e.target.value, 10) || 100)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">สภาพหน้าจอ</label>
                  <input
                    type="text"
                    value={screenCondition}
                    onChange={(e) => setScreenCondition(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Crucial: iCloud / Account Check */}
              <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-semibold text-emerald-900">
                    ปลดล็อค iCloud / Google Account / รหัสผ่านหน้าจอแล้ว
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={icloudRemoved}
                    onChange={(e) => setIcloudRemoved(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Accessories Checklist */}
              <div>
                <span className="block text-xs font-medium text-slate-600 mb-1.5">อุปกรณ์ที่ได้รับพร้อมเครื่อง:</span>
                <div className="flex flex-wrap gap-2">
                  {accessoryOptions.map((acc) => (
                    <button
                      type="button"
                      key={acc}
                      onClick={() => toggleAccessory(acc)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        accessories.includes(acc)
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {accessories.includes(acc) ? '✓ ' : '+ '}
                      {acc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Financials & Automatic Interest (Monthly & Weekly 25% Support) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
                <Calculator className="w-4 h-4 text-amber-600" />
                <span>3. ยอดเงินจำนำและอัตราดอกเบี้ย (รองรับ 25% ต่อเดือน / รายสัปดาห์)</span>
              </div>

              {/* Cycle Toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setInterestCycle('monthly');
                    if (periodDays < 15) setPeriodDays(30);
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    interestCycle === 'monthly'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  รอบรายเดือน
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInterestCycle('weekly');
                    if (periodDays > 14) setPeriodDays(7);
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    interestCycle === 'weekly'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  รอบรายสัปดาห์ (7/14 วัน)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">ราคาประเมินตลาด (บาท)</label>
                <input
                  type="number"
                  step="500"
                  value={appraisedValue}
                  onChange={(e) => setAppraisedValue(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs font-semibold py-2 px-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  ยอดเงินต้นรับจำนำ (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="500"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-sm font-bold py-2 px-3 bg-amber-50 border-2 border-amber-400 rounded-lg text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-600">
                    {interestCycle === 'monthly' ? 'อัตราดอกเบี้ยต่อเดือน (%)' : 'อัตราดอกเบี้ยต่อสัปดาห์ (%)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomRate(!isCustomRate)}
                    className="text-[10px] text-amber-700 hover:underline font-semibold"
                  >
                    {isCustomRate ? 'ใช้ค่ากำหนดล่วงหน้า' : 'ระบุ % เอง'}
                  </button>
                </div>

                {isCustomRate ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={interestCycle === 'monthly' ? interestRateMonthly : interestRateWeekly}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (interestCycle === 'monthly') {
                          setInterestRateMonthly(val);
                          setInterestRateWeekly(Math.round((val / 4) * 100) / 100);
                        } else {
                          setInterestRateWeekly(val);
                          setInterestRateMonthly(Math.round(val * 4 * 100) / 100);
                        }
                      }}
                      className="w-full text-xs font-bold py-2 px-3 bg-white border border-amber-400 rounded-lg text-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">%</span>
                  </div>
                ) : (
                  <div className="flex space-x-1">
                    {interestCycle === 'monthly' ? (
                      [25.0, 20.0, 15.0, 10.0, 2.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => {
                            setInterestRateMonthly(rate);
                            setInterestRateWeekly(Math.round((rate / 4) * 100) / 100);
                          }}
                          className={`flex-1 py-1.5 text-xs rounded-lg border font-semibold ${
                            interestRateMonthly === rate
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))
                    ) : (
                      [6.25, 5.0, 7.0, 10.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => {
                            setInterestRateWeekly(rate);
                            setInterestRateMonthly(Math.round(rate * 4 * 100) / 100);
                          }}
                          className={`flex-1 py-1.5 text-xs rounded-lg border font-semibold ${
                            interestRateWeekly === rate
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {rate}%
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Interest calculation preview widget */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">
                  ดอกเบี้ยต่องวด ({periodDays} วัน):
                </span>
                <span className="text-xl font-bold text-amber-400">{formatCurrency(periodicInterest)}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  ({interestCycle === 'monthly' ? `${interestRateMonthly}% / เดือน` : `${interestRateWeekly}% / สัปดาห์ (เทียบเท่า ${interestRateMonthly}% / เดือน)`})
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">ระยะเวลาสัญญา:</span>
                <div className="flex space-x-1.5">
                  {interestCycle === 'weekly' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPeriodDays(7)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          periodDays === 7 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        7 วัน (1 สัปดาห์)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPeriodDays(14)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          periodDays === 14 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        14 วัน (2 สัปดาห์)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setPeriodDays(30)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          periodDays === 30 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        30 วัน (1 เดือน)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPeriodDays(15)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          periodDays === 15 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        15 วัน (ครึ่งเดือน)
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">วันครบกำหนดชำระ:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {addDaysToDate(new Date().toISOString().split('T')[0], periodDays)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  ยอดรวมไถ่ถอน: {formatCurrency(loanAmount + periodicInterest)}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Remote Device Lock Control */}
          <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-800 rounded-lg">
                  <Lock className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    4. ระบบลงทะเบียนล็อคเครื่องทางไกล (Remote Lock Ready)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    เตรียมพร้อมส่งคำสั่งล็อคหน้าจอทันทีเมื่อค้างชำระ และแจ้งเตือนไปยังแดชบอร์ด
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteLockEnabled}
                  onChange={(e) => setRemoteLockEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {remoteLockEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">ระบบ/รูปแบบการล็อคเครื่อง:</label>
                  <select
                    value={remoteLockMethod}
                    onChange={(e) => setRemoteLockMethod(e.target.value as any)}
                    className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="Knox Guard">Samsung Knox Guard (ล็อกผ่าน Cloud)</option>
                    <option value="iCloud Lost Mode">Apple iCloud Lost Mode / MDM</option>
                    <option value="MDM Enterprise">Android Enterprise MDM</option>
                    <option value="Remote Lock APK">แอป APK ล็อคเครื่องเฉพาะของร้าน</option>
                    <option value="Manual">ควบคุมด้วยระบบแจ้งเตือนแมนนวล</option>
                  </select>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-emerald-700 font-semibold">สถานะเริ่มต้น: ปลดล็อคอยู่ (ใช้งานได้ปกติ)</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span>หากเกินกำหนดจะขึ้นเตือนให้กดล็อคบนแดชบอร์ด</span>
                </div>
              </div>
            )}
          </div>

          {/* Action toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              id="print-direct-checkbox"
              type="checkbox"
              checked={printAfterSave}
              onChange={(e) => setPrintAfterSave(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="print-direct-checkbox" className="text-xs font-medium text-slate-700 cursor-pointer">
              เปิดหน้าต่างพิมพ์ใบสัญญาความร้อน (Thermal Print) ทันทีหลังบันทึก
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              id="save-new-pawn-contract-btn"
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกสัญญาจำนำ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
