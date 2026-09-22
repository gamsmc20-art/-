import React, { useState } from 'react';
import { Printer, X, Check, Smartphone, FileText, QrCode } from 'lucide-react';
import { PawnContract, Branch } from '../types';
import { formatThaiDate, formatCurrency, thaiBahtText, calculatePayableAmounts } from '../utils/calculator';

interface ThermalPrintModalProps {
  contract: PawnContract;
  branch: Branch;
  onClose: () => void;
}

export const ThermalPrintModal: React.FC<ThermalPrintModalProps> = ({ contract, branch, onClose }) => {
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm' | 'A4'>('80mm');
  const [includeTerms, setIncludeTerms] = useState(true);

  const { baseInterest } = calculatePayableAmounts(contract.loanAmount, contract.interestRateMonthly, contract.dueDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="thermal-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">พิมพ์ใบสัญญา / ใบเสร็จรับจำนำ</h3>
              <p className="text-xs text-slate-500">สัญญาเลขที่ {contract.contractNumber} • {branch.name}</p>
            </div>
          </div>
          <button
            id="close-print-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Print Configuration Controls */}
        <div className="px-6 py-3 bg-amber-50/70 border-b border-amber-100 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-600">ขนาดกระดาษ:</span>
            <div className="inline-flex bg-white rounded-lg p-1 border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setPaperSize('80mm')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  paperSize === '80mm' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                กระดาษความร้อน 80mm
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('58mm')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  paperSize === '58mm' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ความร้อน 58mm (พกพา)
              </button>
              <button
                type="button"
                onClick={() => setPaperSize('A4')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  paperSize === 'A4' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                เอกสาร A4
              </button>
            </div>
          </div>

          <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeTerms}
              onChange={(e) => setIncludeTerms(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span>แนบข้อกำหนดและเงื่อนไข</span>
          </label>
        </div>

        {/* Printable View Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div
            id="printable-area"
            className={`bg-white shadow-md rounded-sm p-6 text-slate-900 border border-slate-300 font-mono text-xs transition-all ${
              paperSize === '58mm'
                ? 'w-[220px] text-[10px] p-3 leading-tight'
                : paperSize === '80mm'
                ? 'w-[320px] text-[11px] p-4 leading-normal'
                : 'w-[560px] text-xs p-8 leading-relaxed font-sans'
            }`}
          >
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
              <h2 className="font-bold text-sm tracking-wide text-slate-950 uppercase">
                {branch.name}
              </h2>
              <p className="text-[10px] text-slate-600 mt-0.5">{branch.address}</p>
              <p className="text-[10px] text-slate-600">โทร: {branch.phone} | เลขประจำตัวผู้เสียภาษี: {branch.taxId}</p>
              <div className="mt-2 inline-block px-2 py-0.5 bg-slate-100 font-bold border border-slate-300 rounded text-[11px]">
                ใบสัญญารับจำนำโทรศัพท์มือถือ
              </div>
            </div>

            {/* Contract Meta */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="flex justify-between">
                <span className="text-slate-600">เลขที่สัญญา:</span>
                <span className="font-bold">{contract.contractNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">วันที่ทำสัญญา:</span>
                <span>{formatThaiDate(contract.contractDate)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">วันครบกำหนด:</span>
                <span className="text-red-600 underline">{formatThaiDate(contract.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">พนักงานผู้รับจำนำ:</span>
                <span>{contract.createdBy}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="font-bold text-slate-800">ข้อมูลผู้จำนำ (ลูกค้า):</div>
              <div className="flex justify-between">
                <span className="text-slate-600">ชื่อ-นามสกุล:</span>
                <span className="font-medium">{contract.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">เลขบัตรประชาชน:</span>
                <span>{contract.customerIdCard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">เบอร์โทรศัพท์:</span>
                <span>{contract.customerPhone}</span>
              </div>
            </div>

            {/* Device Info */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="font-bold text-slate-800">รายละเอียดทรัพย์สินจำนำ:</div>
              <div className="flex justify-between">
                <span className="text-slate-600">อุปกรณ์:</span>
                <span className="font-semibold">{contract.device.brand} {contract.device.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ความจุ / สี:</span>
                <span>{contract.device.storage} • {contract.device.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">เลข IMEI:</span>
                <span className="font-mono">{contract.device.imei}</span>
              </div>
              {contract.device.serialNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Serial No.:</span>
                  <span className="font-mono">{contract.device.serialNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">สภาพเครื่อง:</span>
                <span>เกรด {contract.device.condition.grade} (แบตเตอรี่ {contract.device.condition.batteryHealth || '-'}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ปลดล็อค iCloud/บัญชี:</span>
                <span className="text-emerald-700 font-medium">✓ ปลดล็อคเรียบร้อย</span>
              </div>
              {contract.device.condition.accessories.length > 0 && (
                <div className="text-[10px] text-slate-600 mt-1">
                  อุปกรณ์ที่ได้รับ: {contract.device.condition.accessories.join(', ')}
                </div>
              )}
            </div>

            {/* Financial Details */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2 mb-2">
              <div className="flex justify-between text-xs font-bold">
                <span>ยอดเงินต้นรับจำนำ:</span>
                <span className="text-slate-900 text-sm">{formatCurrency(contract.loanAmount)}</span>
              </div>
              <div className="text-right text-[10px] text-slate-600 italic">
                ({thaiBahtText(contract.loanAmount)})
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">อัตราดอกเบี้ย:</span>
                <span>{contract.interestRateMonthly}% ต่อเดือน</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">ดอกเบี้ยต่องวด (30 วัน):</span>
                <span>{formatCurrency(baseInterest)}</span>
              </div>
            </div>

            {/* PromptPay QR Code mockup */}
            <div className="text-center py-2 border-b border-dashed border-slate-300 mb-2">
              <div className="inline-block p-1 bg-white border border-slate-300 rounded mb-1">
                {/* Visual SVG QR representation */}
                <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="100" height="100" fill="#fff" />
                  <rect x="5" y="5" width="30" height="30" fill="#000" />
                  <rect x="10" y="10" width="20" height="20" fill="#fff" />
                  <rect x="15" y="15" width="10" height="10" fill="#000" />
                  <rect x="65" y="5" width="30" height="30" fill="#000" />
                  <rect x="70" y="10" width="20" height="20" fill="#fff" />
                  <rect x="75" y="15" width="10" height="10" fill="#000" />
                  <rect x="5" y="65" width="30" height="30" fill="#000" />
                  <rect x="10" y="70" width="20" height="20" fill="#fff" />
                  <rect x="15" y="75" width="10" height="10" fill="#000" />
                  <rect x="42" y="15" width="8" height="8" fill="#000" />
                  <rect x="45" y="35" width="12" height="12" fill="#000" />
                  <rect x="65" y="45" width="10" height="10" fill="#000" />
                  <rect x="45" y="65" width="10" height="10" fill="#000" />
                  <rect x="65" y="65" width="8" height="8" fill="#000" />
                  <rect x="80" y="80" width="12" height="12" fill="#000" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-500">สแกนชำระดอกเบี้ยผ่าน พร้อมเพย์ (PromptPay)</p>
            </div>

            {/* Legal Terms */}
            {includeTerms && (
              <div className="text-[9px] text-slate-500 leading-tight space-y-1 border-b border-dashed border-slate-300 pb-3 mb-3">
                <p className="font-bold text-slate-700">เงื่อนไขสัญญาจำนำ:</p>
                <p>1. ผู้จำนำตกลงนำทรัพย์สินข้างต้นมาวางประกันหนี้เงินกู้ และรับรองว่าเป็นเจ้าของกรรมสิทธิ์โดยชอบด้วยกฎหมาย</p>
                <p>2. ผู้จำนำต้องชำระดอกเบี้ยภายในวันครบกำหนด หากเลยกำหนดเกิน 7 วัน ทางร้านมีสิทธิ์คิดค่าปรับ หรือถือว่าผู้จำนำสละสิทธิ์ในทรัพย์สิน และร้านมีสิทธิ์นำทรัพย์สินออกขายทอดตลาด (หลุดจำนำ) ทันที</p>
                <p>3. การไถ่ถอนต้องแสดงใบสัญญานี้พร้อมบัตรประชาชนตัวจริงของผู้จำนำเท่านั้น</p>
              </div>
            )}

            {/* Signature Area */}
            <div className="pt-2 pb-1 space-y-4">
              <div className="flex justify-between items-end text-center">
                <div className="w-[45%]">
                  <div className="border-b border-slate-400 h-8 mb-1"></div>
                  <p className="text-[10px] text-slate-700">ลงชื่อ ผู้จำนำ</p>
                  <p className="text-[9px] text-slate-500">({contract.customerName})</p>
                </div>
                <div className="w-[45%]">
                  <div className="border-b border-slate-400 h-8 mb-1"></div>
                  <p className="text-[10px] text-slate-700">ลงชื่อ ผู้รับจำนำ / พยาน</p>
                  <p className="text-[9px] text-slate-500">({contract.createdBy})</p>
                </div>
              </div>
              <p className="text-center text-[9px] text-slate-400">--- ขอบพระคุณที่ไว้วางใจใช้บริการ ---</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-500">
            * รองรับเครื่องพิมพ์ความร้อนแบบ ESC/POS 80mm & 58mm และพิมพ์ผ่านมือถือ/แท็บเล็ต
          </span>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              id="execute-thermal-print-btn"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบสัญญา (Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
