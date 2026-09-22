import React, { useState } from 'react';
import {
  X,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Shield,
  Smartphone,
} from 'lucide-react';
import { LineNotifySettings, PawnContract } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/calculator';

interface LineNotifyModalProps {
  settings: LineNotifySettings;
  contracts: PawnContract[];
  onClose: () => void;
  onSaveSettings: (newSettings: LineNotifySettings) => void;
}

export const LineNotifyModal: React.FC<LineNotifyModalProps> = ({
  settings,
  contracts,
  onClose,
  onSaveSettings,
}) => {
  const [token, setToken] = useState(settings.token);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(settings.notifyDaysBefore);
  const [notifyOverdue, setNotifyOverdue] = useState(settings.notifyOverdue);
  const [notifyDefaulted, setNotifyDefaulted] = useState(settings.notifyDefaulted);
  const [sendDailySummary, setSendDailySummary] = useState(settings.sendDailySummary);

  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Filter due soon and overdue
  const dueSoonContracts = contracts.filter((c) => c.status === 'due_soon');
  const overdueContracts = contracts.filter((c) => c.status === 'overdue');
  const defaultedContracts = contracts.filter((c) => c.status === 'defaulted');

  const handleSendTestNotification = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setTestStatus(
        `ส่งแจ้งเตือนสำเร็จไปยัง LINE! (จำลองการส่งการแจ้งเตือนสัญญาใกล้ครบกำหนด ${dueSoonContracts.length} รายการ และเลยกำหนด ${overdueContracts.length} รายการ)`
      );
    }, 800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      enabled: true,
      token,
      notifyDaysBefore,
      notifyOverdue,
      notifyDefaulted,
      sendDailySummary,
      lastSentTimestamp: new Date().toLocaleString('th-TH'),
    });
    onClose();
  };

  return (
    <div id="line-notify-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-500/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">ตั้งค่าการแจ้งเตือน LINE Notify</h3>
              <p className="text-xs text-slate-600">
                แจ้งเตือนสัญญาใกล้ครบกำหนดและสินค้าหลุดจำนำเข้ากลุ่มพนักงาน/ผู้บริหารอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            id="close-line-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Token input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              LINE Notify Token / Webhook Key:
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="กรอก LINE Token (เช่น abc123456xyz...)"
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
            <p className="text-[11px] text-slate-500">
              * ออก Token ได้ฟรีผ่าน notify-bot.line.me เพื่อดึงเข้าห้องแชตกลุ่มพนักงานประจำสาขา
            </p>
          </div>

          {/* Trigger Toggles */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
              เงื่อนไขและประเภทการแจ้งเตือนอัตโนมัติ:
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">แจ้งเตือนสัญญาใกล้ครบกำหนด</div>
                <div className="text-[11px] text-slate-500">
                  แจ้งเตือนล่วงหน้าก่อนวันครบกำหนดสัญญา เพื่อให้เจ้าหน้าที่โทร/ทักติดตาม
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={notifyDaysBefore}
                  onChange={(e) => setNotifyDaysBefore(parseInt(e.target.value, 10))}
                  className="text-xs font-medium py-1 px-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value={1}>ก่อน 1 วัน</option>
                  <option value={2}>ก่อน 2 วัน</option>
                  <option value={3}>ก่อน 3 วัน</option>
                  <option value={5}>ก่อน 5 วัน</option>
                  <option value={7}>ก่อน 7 วัน</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-800">แจ้งเตือนสัญญาเลยกำหนด (Overdue)</div>
                <div className="text-[11px] text-slate-500">
                  แจ้งเตือนทันทีเมื่อเลยกำหนด 1 วัน (ค่าปรับวันละ 50 บาท) และแจ้งเตือนให้ล็อคเครื่องภายใน 7 วัน
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyOverdue}
                onChange={(e) => setNotifyOverdue(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-800">แจ้งเตือนสินค้าหลุดจำนำ (Defaulted)</div>
                <div className="text-[11px] text-slate-500">
                  แจ้งเตือนเมื่อสัญญาพ้นระยะเวลาผ่อนผัน 7 วัน เพื่อให้เตรียมสต็อกจำหน่าย
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyDefaulted}
                onChange={(e) => setNotifyDefaulted(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <div className="text-xs font-semibold text-slate-800">สรุปยอดประจำวัน (Daily Summary Report)</div>
                <div className="text-[11px] text-slate-500">ส่งยอดเงินรับจำนำ ดอกเบี้ย และยอดไถ่ถอน เวลา 20:00 น.</div>
              </div>
              <input
                type="checkbox"
                checked={sendDailySummary}
                onChange={(e) => setSendDailySummary(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Test message preview card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">ตัวอย่างข้อความแจ้งเตือนอัตโนมัติ:</span>
              <button
                id="test-send-line-btn"
                type="button"
                disabled={isSendingTest}
                onClick={handleSendTestNotification}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'กำลังทดสอบ...' : 'ทดสอบยิงแจ้งเตือน LINE'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800">
              <div>🔔 [แจ้งเตือนระบบรับจำนำโทรศัพท์]</div>
              <div>📅 ประจำวันที่ {formatThaiDate(new Date().toISOString().split('T')[0])}</div>
              <div className="text-amber-300">
                ⚠️ สัญญาใกล้ครบกำหนด ({dueSoonContracts.length} เครื่อง):
              </div>
              {dueSoonContracts.map((c) => (
                <div key={c.id} className="text-slate-300 pl-2">
                  - {c.contractNumber}: {c.device.brand} {c.device.model} ({c.customerName}) ยอดจำนำ {formatCurrency(c.loanAmount)}
                </div>
              ))}
              <div className="text-red-400 mt-1 font-bold">
                🚨 สัญญาเลยกำหนดชำระ ({overdueContracts.length} เครื่อง - ค่าปรับวันละ 50 บาท):
              </div>
              {overdueContracts.map((c) => {
                const diffDays = Math.max(1, Math.floor((new Date().getTime() - new Date(c.dueDate).getTime()) / (1000 * 3600 * 24)));
                const penalty = diffDays * 50;
                return (
                  <div key={c.id} className="text-slate-300 pl-2">
                    - {c.contractNumber}: {c.device.brand} {c.device.model} ({c.customerName}) เลย {diffDays} วัน ค่าปรับ {penalty}฿
                    {diffDays <= 7 && c.lockInfo?.status !== 'locked' && " ⚠️ [เตือนสั่งล็อคเครื่อง]"}
                  </div>
                );
              })}
            </div>

            {testStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{testStatus}</span>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              id="save-line-settings-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              บันทึกการตั้งค่า LINE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
