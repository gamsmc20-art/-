import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  Phone,
  CreditCard,
  History,
  Download,
  AlertOctagon,
  Award,
  Smartphone,
  Calendar,
} from 'lucide-react';
import { Customer, PawnContract } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/calculator';
import { exportCustomersToCSV } from '../utils/exporter';

interface CustomerManagementProps {
  customers: Customer[];
  contracts: PawnContract[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onSelectContractForView?: (contract: PawnContract) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  contracts,
  onAddCustomer,
  onUpdateCustomer,
  onSelectContractForView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vip' | 'regular' | 'blacklisted'>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New form fields
  const [fullName, setFullName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lineId, setLineId] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [custStatus, setCustStatus] = useState<'regular' | 'vip' | 'blacklisted'>('regular');
  const [note, setNote] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.idCard.includes(searchTerm) ||
      (c.lineId && c.lineId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || filteredCustomers[0];

  // Contracts belonging to selected customer
  const customerContracts = selectedCustomer
    ? contracts.filter((cnt) => cnt.customerId === selectedCustomer.id)
    : [];

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    const newCust: Customer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      fullName,
      idCard: idCard || '1-0000-00000-00-0',
      phone,
      address: address || '-',
      lineId,
      emergencyContact,
      memberSince: new Date().toISOString().split('T')[0],
      status: custStatus,
      note,
      activeContractsCount: 0,
      totalHistoryContracts: 0,
    };

    onAddCustomer(newCust);
    setIsAddingNew(false);
    setSelectedCustomerId(newCust.id);

    // Reset
    setFullName('');
    setIdCard('');
    setPhone('');
    setAddress('');
    setLineId('');
    setEmergencyContact('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">ฐานข้อมูลสมาชิกและลูกค้า (Customer Directory)</h2>
          <p className="text-xs text-slate-500">
            จัดเก็บประวัติ บัตรประชาชน เบอร์ติดต่อ และประวัติการทำสัญญาจำนำอย่างละเอียด
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="export-customers-csv-btn"
            type="button"
            onClick={() => exportCustomersToCSV(customers)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            id="add-new-customer-btn"
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มสมาชิกใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="customer-search-input"
            type="text"
            placeholder="ค้นหาชื่อ, เบอร์โทร, เลขบัตร ปชช, LINE ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: `ทั้งหมด (${customers.length})` },
            { id: 'vip', label: 'สมาชิก VIP' },
            { id: 'regular', label: 'ทั่วไป' },
            { id: 'blacklisted', label: 'แบล็กลิสต์' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Customer List & Detail Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Customer List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[680px]">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            รายชื่อสมาชิก ({filteredCustomers.length})
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">ไม่พบข้อมูลลูกค้าตามคำค้นหา</div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                const activeCount = contracts.filter((cnt) => cnt.customerId === c.id && (cnt.status === 'active' || cnt.status === 'due_soon' || cnt.status === 'overdue')).length;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-4 border-amber-600'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{c.fullName}</span>
                          {c.status === 'vip' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 flex items-center space-x-1">
                              <Award className="w-3 h-3" />
                              <span>VIP</span>
                            </span>
                          )}
                          {c.status === 'blacklisted' && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800">
                              แบล็กลิสต์
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2">
                          <span>{c.phone}</span>
                          <span>•</span>
                          <span>ปชช: {c.idCard}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          activeCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          จำนำอยู่ {activeCount} เครื่อง
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Customer Profile & History */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base shadow-xs">
                    {selectedCustomer.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedCustomer.fullName}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        selectedCustomer.status === 'vip'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedCustomer.status === 'blacklisted'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {selectedCustomer.status === 'vip' ? 'สมาชิก VIP' : selectedCustomer.status === 'blacklisted' ? 'แบล็กลิสต์' : 'สมาชิกทั่วไป'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">รหัสสมาชิก: {selectedCustomer.id} • สมาชิกตั้งแต่ {formatThaiDate(selectedCustomer.memberSince)}</p>
                  </div>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">เลขบัตรประจำตัวประชาชน:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCustomer.idCard}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">เบอร์โทรศัพท์:</span>
                  <span className="font-bold text-slate-900">{selectedCustomer.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">LINE ID:</span>
                  <span className="text-slate-800">{selectedCustomer.lineId || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">เบอร์ติดต่อฉุกเฉิน:</span>
                  <span className="text-slate-800">{selectedCustomer.emergencyContact || '-'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">ที่อยู่ตามทะเบียนบ้าน/ปัจจุบัน:</span>
                  <span className="text-slate-800">{selectedCustomer.address}</span>
                </div>
                {selectedCustomer.note && (
                  <div className="sm:col-span-2 pt-1 border-t border-slate-200">
                    <span className="text-slate-500 block">หมายเหตุเพิ่มเติม:</span>
                    <span className="text-amber-800 font-medium">{selectedCustomer.note}</span>
                  </div>
                )}
              </div>

              {/* Pawn Contracts History of this customer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <History className="w-4 h-4 text-amber-600" />
                    <span>ประวัติสัญญาจำนำของลูกค้ารายนี้ ({customerContracts.length} สัญญา)</span>
                  </h4>
                </div>

                {customerContracts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    ยังไม่มีรายการจำนำของลูกค้ารายนี้
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerContracts.map((cnt) => (
                      <div
                        key={cnt.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-amber-400 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">{cnt.contractNumber}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              cnt.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : cnt.status === 'due_soon'
                                ? 'bg-amber-100 text-amber-800'
                                : cnt.status === 'overdue'
                                ? 'bg-red-100 text-red-800'
                                : cnt.status === 'defaulted'
                                ? 'bg-slate-800 text-white'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {cnt.status === 'active'
                                ? 'กำลังจำนำ'
                                : cnt.status === 'due_soon'
                                ? 'ใกล้ครบกำหนด'
                                : cnt.status === 'overdue'
                                ? 'เลยกำหนด'
                                : cnt.status === 'defaulted'
                                ? 'หลุดจำนำ'
                                : 'ไถ่ถอนแล้ว'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 flex items-center space-x-2">
                            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {cnt.device.brand} {cnt.device.model} ({cnt.device.storage})
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="font-mono text-[11px]">IMEI: {cnt.device.imei}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ยอดจำนำ: <span className="font-bold text-slate-900">{formatCurrency(cnt.loanAmount)}</span> • ครบกำหนด: {formatThaiDate(cnt.dueDate)}
                          </div>
                        </div>

                        {onSelectContractForView && (
                          <button
                            type="button"
                            onClick={() => onSelectContractForView(cnt)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 rounded-lg transition-colors self-start sm:self-center"
                          >
                            ดูรายละเอียด
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              กรุณาเลือกลูกค้าจากรายการด้านซ้ายเพื่อดูประวัติ
            </div>
          )}
        </div>
      </div>

      {/* Add New Customer Modal */}
      {isAddingNew && (
        <div id="add-customer-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">เพิ่มสมาชิกใหม่</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="นาย/นาง/นางสาว..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08x-xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เลขบัตรประชาชน 13 หลัก</label>
                  <input
                    type="text"
                    placeholder="x-xxxx-xxxxx-xx-x"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LINE ID</label>
                  <input
                    type="text"
                    placeholder="ไอดีไลน์"
                    value={lineId}
                    onChange={(e) => setLineId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่</label>
                  <input
                    type="text"
                    placeholder="ที่อยู่ตามทะเบียนบ้าน หรือที่อยู่ปัจจุบัน"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์ติดต่อฉุกเฉิน</label>
                  <input
                    type="text"
                    placeholder="ชื่อและเบอร์โทร"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะสมาชิก</label>
                  <select
                    value={custStatus}
                    onChange={(e) => setCustStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value="regular">สมาชิกทั่วไป</option>
                    <option value="vip">สมาชิก VIP</option>
                    <option value="blacklisted">แบล็กลิสต์</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุ</label>
                  <input
                    type="text"
                    placeholder="บันทึกข้อมูลเพิ่มเติม"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  บันทึกข้อมูลสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
