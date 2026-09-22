import React, { useState } from 'react';
import {
  Package,
  Search,
  Tag,
  Download,
  Smartphone,
  DollarSign,
  TrendingUp,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { PawnContract, DefaultedPhoneItem } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/calculator';
import { exportDefaultedItemsToCSV } from '../utils/exporter';

interface DefaultedItemsViewProps {
  contracts: PawnContract[];
  onOpenContractDetail?: (contract: PawnContract) => void;
}

export const DefaultedItemsView: React.FC<DefaultedItemsViewProps> = ({
  contracts,
  onOpenContractDetail,
}) => {
  // Convert defaulted contracts to inventory items
  const defaultedContracts = contracts.filter((c) => c.status === 'defaulted');

  const [items, setItems] = useState<DefaultedPhoneItem[]>(() =>
    defaultedContracts.map((c) => ({
      id: `def-${c.id}`,
      contractId: c.id,
      contractNumber: c.contractNumber,
      device: c.device,
      loanAmount: c.loanAmount,
      appraisedValue: c.appraisedValue,
      forfeitedDate: c.dueDate,
      sellingPrice: Math.round(c.loanAmount * 1.35),
      status: 'ready_for_sale',
    }))
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready_for_sale' | 'sold'>('all');
  const [sellingModalItem, setSellingModalItem] = useState<DefaultedPhoneItem | null>(null);
  const [actualSalePrice, setActualSalePrice] = useState<number>(0);

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.contractNumber.toLowerCase().includes(term) ||
      item.device.brand.toLowerCase().includes(term) ||
      item.device.model.toLowerCase().includes(term) ||
      item.device.imei.includes(term);

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCost = items.reduce((sum, item) => sum + item.loanAmount, 0);
  const totalPotentialSale = items.reduce((sum, item) => sum + (item.sellingPrice || 0), 0);
  const totalSoldProfit = items
    .filter((item) => item.status === 'sold' && item.soldPrice)
    .reduce((sum, item) => sum + (item.soldPrice! - item.loanAmount), 0);

  const handleOpenSellModal = (item: DefaultedPhoneItem) => {
    setSellingModalItem(item);
    setActualSalePrice(item.sellingPrice || item.loanAmount * 1.3);
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingModalItem) return;

    setItems((prev) =>
      prev.map((it) =>
        it.id === sellingModalItem.id
          ? {
              ...it,
              status: 'sold',
              soldPrice: actualSalePrice,
              soldDate: new Date().toISOString().split('T')[0],
            }
          : it
      )
    );

    setSellingModalItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            คลังสินค้าหลุดจำนำพร้อมจำหน่ายหน้าร้าน (Defaulted Stock)
          </h2>
          <p className="text-xs text-slate-500">
            โทรศัพท์มือถือที่หลุดจำนำตามกฎหมาย ปลดล็อคเรียบร้อย พร้อมตั้งราคาขายและบันทึกกำไร
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="export-defaulted-csv-btn"
            type="button"
            onClick={() => exportDefaultedItemsToCSV(items)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>ส่งออก CSV สินค้าหลุดจำนำ</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">ต้นทุนสินค้าหลุดจำนำรวม</span>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(totalCost)}</div>
          <div className="text-[11px] text-slate-500">
            รวม {items.length} เครื่อง (เงินต้นค้างชำระ)
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">มูลค่าตั้งขายหน้าร้านรวม</span>
          <div className="text-xl font-bold text-amber-700">{formatCurrency(totalPotentialSale)}</div>
          <div className="text-[11px] text-slate-500">
            พร้อมขาย {items.filter((i) => i.status === 'ready_for_sale').length} เครื่อง
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500">กำไรสุทธิจากการขายแล้ว</span>
          <div className="text-xl font-bold text-emerald-700">+{formatCurrency(totalSoldProfit)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            ขายแล้ว {items.filter((i) => i.status === 'sold').length} เครื่อง
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="defaulted-search-input"
            type="text"
            placeholder="ค้นหายี่ห้อ, รุ่น, IMEI, เลขที่สัญญา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div className="flex space-x-1.5">
          {[
            { id: 'all', label: `ทั้งหมด (${items.length})` },
            { id: 'ready_for_sale', label: 'พร้อมจำหน่าย' },
            { id: 'sold', label: 'ขายแล้ว' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Defaulted Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            ไม่มีสินค้าหลุดจำนำที่ตรงกับเงื่อนไขการค้นหา
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSold = item.status === 'sold';
            const profit = isSold && item.soldPrice ? item.soldPrice - item.loanAmount : (item.sellingPrice || 0) - item.loanAmount;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isSold ? 'border-slate-200 opacity-80' : 'border-slate-200 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Top line */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      สัญญา: {item.contractNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSold
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isSold ? 'ขายแล้ว' : 'พร้อมจำหน่าย'}
                    </span>
                  </div>

                  {/* Device Title */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>{item.device.brand} {item.device.model}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      ความจุ {item.device.storage} • สี {item.device.color} • สภาพเกรด {item.device.condition.grade}
                    </p>
                  </div>

                  {/* Specs & Status */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span>IMEI:</span>
                      <span className="font-semibold text-slate-800">{item.device.imei}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>สุขภาพแบตเตอรี่:</span>
                      <span className="font-medium">{item.device.condition.batteryHealth || '-'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>สภาพหน้าจอ:</span>
                      <span className="font-medium text-emerald-700">จอแท้ ปลด iCloud แล้ว</span>
                    </div>
                    {item.device.condition.accessories.length > 0 && (
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        อุปกรณ์: {item.device.condition.accessories.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Pricing Overview */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">ต้นทุนรับจำนำ:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(item.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">ราคาตั้งขาย:</span>
                      <span className="font-bold text-amber-800 text-sm">
                        {formatCurrency(isSold && item.soldPrice ? item.soldPrice : item.sellingPrice || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">กำไรคาดการณ์/จริง:</span>
                      <span className="font-bold text-emerald-600">+{formatCurrency(profit)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    หลุดจำนำเมื่อ {formatThaiDate(item.forfeitedDate)}
                  </span>
                  {!isSold ? (
                    <button
                      id={`sell-item-btn-${item.id}`}
                      type="button"
                      onClick={() => handleOpenSellModal(item)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>บันทึกขาย</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ขายแล้วเมื่อ {formatThaiDate(item.soldDate || '')}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Sale Modal */}
      {sellingModalItem && (
        <div id="record-sale-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">บันทึกการขายสินค้าหลุดจำนำหน้าร้าน</h3>
              <button
                type="button"
                onClick={() => setSellingModalItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSale} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-slate-900">
                  {sellingModalItem.device.brand} {sellingModalItem.device.model} ({sellingModalItem.device.storage})
                </div>
                <div className="text-slate-500 font-mono">IMEI: {sellingModalItem.device.imei}</div>
                <div className="text-slate-600">
                  ต้นทุนจำนำ: <strong>{formatCurrency(sellingModalItem.loanAmount)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  ราคาขายจริง (บาท) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  value={actualSalePrice}
                  onChange={(e) => setActualSalePrice(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-base font-bold p-2.5 bg-amber-50 border-2 border-amber-400 rounded-xl text-amber-950 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex justify-between font-semibold">
                <span>กำไรสุทธิจากการขาย:</span>
                <span className="text-emerald-700 font-bold">
                  +{formatCurrency(actualSalePrice - sellingModalItem.loanAmount)}
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSellingModalItem(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  ยืนยันบันทึกการขาย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
