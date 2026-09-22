import React, { useState } from 'react';
import { FileText, X, Copy, Check, Send, AlertCircle, Phone, Calendar } from 'lucide-react';
import { PawnContract, Branch } from '../types';
import { formatThaiDate, formatCurrency, calculatePayableAmounts, thaiBahtText } from '../utils/calculator';

interface InvoiceModalProps {
  contract: PawnContract;
  branch: Branch;
  onClose: () => void;
  onSendLineSimulated?: (message: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  contract,
  branch,
  onClose,
  onSendLineSimulated,
}) => {
  const [copied, setCopied] = useState(false);
  const [sentLine, setSentLine] = useState(false);

  const { baseInterest, overdueDays, penaltyFee, totalInterestDue, totalRedemptionAmount } =
    calculatePayableAmounts(contract.loanAmount, contract.interestRateMonthly, contract.dueDate);

  // Generate standardized LINE message for customer
  const lineNoticeText = `🔔 แจ้งเตือนยอดชำระดอกเบี้ยรับจำนำ
📋 สัญญาเลขที่: ${contract.contractNumber}
👤 เรียนคุณ: ${contract.customerName}
📱 ทรัพย์สิน: ${contract.device.brand} ${contract.device.model} (${contract.device.storage})
📅 วันครบกำหนด: ${formatThaiDate(contract.dueDate)}
${overdueDays > 0 ? `⚠️ เลยกำหนดแล้ว: ${overdueDays} วัน (ค่าปรับ ${formatCurrency(penaltyFee)})` : ''}

💰 สรุปยอดชำระ:
1. ยอดดอกเบี้ยต่อสัญญา (30 วัน): ${formatCurrency(baseInterest)}
${penaltyFee > 0 ? `2. ค่าปรับล่าช้า: ${formatCurrency(penaltyFee)}\n` : ''}👉 ยอดรวมชำระต่อดอกเบี้ย: ${formatCurrency(totalInterestDue)}
(หรือยอดปิดสัญญาไถ่ถอนเครื่อง: ${formatCurrency(totalRedemptionAmount)})

🏦 บัญชีโอนชำระเงิน:
ธนาคารกสิกรไทย (K-Bank)
ชื่อบัญชี: บจก. โมบาย พาวน์ช็อป (${branch.name})
เลขที่บัญชี: 098-2-34567-8
หรือ พร้อมเพย์: ${branch.taxId}

*หลังโอนเงินแล้วกรุณาส่งสลิปเพื่อออกใบเสร็จต่อสัญญาครับ
โทรสอบถาม: ${branch.phone}`;

  const handleCopyLine = () => {
    navigator.clipboard.writeText(lineNoticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendLine = () => {
    if (onSendLineSimulated) {
      onSendLineSimulated(lineNoticeText);
    }
    setSentLine(true);
    setTimeout(() => setSentLine(false), 3000);
  };

  return (
    <div id="invoice-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">ใบแจ้งหนี้ / ใบแจ้งเตือนชำระดอกเบี้ย</h3>
              <p className="text-xs text-slate-500">สัญญาเลขที่ {contract.contractNumber} • {contract.customerName}</p>
            </div>
          </div>
          <button
            id="close-invoice-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Invoice Card */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <div className="text-sm font-bold text-slate-900">{branch.name}</div>
                <div className="text-xs text-slate-500">{branch.address}</div>
                <div className="text-xs text-slate-500">โทร. {branch.phone}</div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  ใบแจ้งหนี้ดอกเบี้ย
                </span>
                <div className="text-xs text-slate-500 mt-1">วันที่: {formatThaiDate(new Date().toISOString().split('T')[0])}</div>
              </div>
            </div>

            {/* Customer & Contract Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">ผู้รับบริการ:</span>
                <span className="font-semibold text-slate-800">{contract.customerName}</span>
                <span className="text-slate-500 block">{contract.customerPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">อุปกรณ์ที่จำนำ:</span>
                <span className="font-semibold text-slate-800">{contract.device.brand} {contract.device.model}</span>
                <span className="text-slate-500 block font-mono">IMEI: {contract.device.imei}</span>
              </div>
              <div>
                <span className="text-slate-500 block">วันที่เริ่มจำนำ:</span>
                <span className="text-slate-700">{formatThaiDate(contract.contractDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">วันครบกำหนดชำระ:</span>
                <span className={`font-semibold ${overdueDays > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {formatThaiDate(contract.dueDate)} {overdueDays > 0 && `(เลยกำหนด ${overdueDays} วัน)`}
                </span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 text-left">รายการ</th>
                    <th className="py-2.5 px-3 text-right">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2 px-3">
                      <div>ดอกเบี้ยรอบสัญญา (อัตรา {contract.interestRateMonthly}% ต่อเดือน)</div>
                      <div className="text-[10px] text-slate-400">เงินต้น {formatCurrency(contract.loanAmount)}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">{formatCurrency(baseInterest)}</td>
                  </tr>
                  {overdueDays > 0 && (
                    <tr className="bg-red-50/50">
                      <td className="py-2 px-3 text-red-700">
                        <div>ค่าปรับชำระล่าช้า ({overdueDays} วัน)</div>
                        <div className="text-[10px] text-red-500">คำนวณอัตราวันละ 20 บาท</div>
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-red-700">{formatCurrency(penaltyFee)}</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                    <td className="py-2.5 px-3 text-sm">ยอดรวมที่ต้องชำระ (ต่อดอกเบี้ย):</td>
                    <td className="py-2.5 px-3 text-right text-base text-blue-700">{formatCurrency(totalInterestDue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs flex items-start space-x-2 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">กรณีต้องการไถ่ถอนเครื่อง (ปิดสัญญา):</span> ยอดชำระรวมเงินต้นและดอกเบี้ยทั้งหมดเท่ากับ{' '}
                <span className="font-bold underline text-amber-950">{formatCurrency(totalRedemptionAmount)}</span>
              </div>
            </div>
          </div>

          {/* Quick Copy & LINE Send Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">ข้อความสำหรับส่งให้ลูกค้าทาง LINE / SMS:</label>
              <div className="flex space-x-2">
                <button
                  id="copy-line-notice-btn"
                  type="button"
                  onClick={handleCopyLine}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
                </button>
                <button
                  id="send-line-notice-btn"
                  type="button"
                  onClick={handleSendLine}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  {sentLine ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sentLine ? 'ส่งแจ้งเตือนแล้ว' : 'ส่ง LINE Notify'}</span>
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={6}
              value={lineNoticeText}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
