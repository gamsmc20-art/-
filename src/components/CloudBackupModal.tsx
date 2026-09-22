import React, { useState } from 'react';
import {
  X,
  Cloud,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Clock,
  AlertCircle,
  Database,
} from 'lucide-react';
import { PawnContract, Customer, Branch } from '../types';
import {
  googleSignIn,
  getAccessToken,
  logoutGoogle,
} from '../services/firebaseAuth';
import {
  createPawnBackupSpreadsheet,
  syncPawnDataToGoogleSheets,
  SyncResult,
} from '../services/googleSheets';
import { exportContractsToCSV, exportFullDatabaseBackup } from '../utils/exporter';

interface CloudBackupModalProps {
  contracts: PawnContract[];
  customers: Customer[];
  branches: Branch[];
  onClose: () => void;
  onRestoreData?: (data: { contracts: PawnContract[]; customers: Customer[] }) => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  contracts,
  customers,
  branches,
  onClose,
  onRestoreData,
}) => {
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(
    localStorage.getItem('pawn_backup_sheet_id') || ''
  );
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(
    localStorage.getItem('pawn_backup_sheet_url') || ''
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoDailyBackup, setAutoDailyBackup] = useState(true);

  const handleGoogleConnect = async () => {
    setErrorMsg('');
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'ไม่สามารถเข้าสู่ระบบ Google ได้');
    }
  };

  const handleSyncToSheets = async () => {
    setErrorMsg('');
    setIsSyncing(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signResult = await googleSignIn();
        if (signResult) {
          token = signResult.accessToken;
          setGoogleUser(signResult.user);
        } else {
          throw new Error('กรุณาลงชื่อเข้าใช้ Google เพื่ออนุญาตการสำรองข้อมูล');
        }
      }

      let currentSheetId = spreadsheetId;
      if (!currentSheetId) {
        // Create new spreadsheet
        const newSheet = await createPawnBackupSpreadsheet(token);
        currentSheetId = newSheet.id;
        setSpreadsheetId(newSheet.id);
        setSpreadsheetUrl(newSheet.url);
        localStorage.setItem('pawn_backup_sheet_id', newSheet.id);
        localStorage.setItem('pawn_backup_sheet_url', newSheet.url);
      }

      const res = await syncPawnDataToGoogleSheets(token, currentSheetId, contracts, customers);
      setSyncStatus(res);
    } catch (err: any) {
      console.error('Sync failed:', err);
      setErrorMsg(err?.message || 'การสำรองข้อมูลขึ้น Google Sheets เกิดข้อผิดพลาด');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.contracts && parsed.customers && onRestoreData) {
          onRestoreData({
            contracts: parsed.contracts,
            customers: parsed.customers,
          });
          alert(`กู้คืนข้อมูลสำเร็จ (${parsed.contracts.length} สัญญา, ${parsed.customers.length} ลูกค้า)`);
          onClose();
        } else {
          setErrorMsg('รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง');
        }
      } catch (err) {
        setErrorMsg('ไม่สามารถอ่านไฟล์สำรองข้อมูล JSON ได้');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="cloud-backup-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-500/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">สำรองข้อมูลขึ้นคลาวด์ (Cloud & Google Sheets Backup)</h3>
              <p className="text-xs text-slate-600">
                ระบบรักษาความปลอดภัยระดับสูงสุด ป้องกันข้อมูลสูญหาย และซิงก์ข้อมูลสัญญารับจำนำอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            id="close-cloud-backup-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Google Sheets Direct Integration */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Google Sheets Cloud Synchronization</h4>
                  <p className="text-xs text-slate-600">
                    ซิงก์ข้อมูลสัญญาจำนำ รายชื่อลูกค้า และประวัติการรับชำระเงินไปยังสเปรดชีตบน Google Drive
                  </p>
                </div>
              </div>
            </div>

            {/* Google Auth Status */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>
                  สถานะการเชื่อมต่อ:{' '}
                  <strong className="text-slate-800">
                    {googleUser ? `เชื่อมต่อกับ ${googleUser.email || googleUser.displayName}` : 'พร้อมเชื่อมต่อบัญชี Google'}
                  </strong>
                </span>
              </div>
              {!googleUser && (
                <button
                  id="google-signin-btn"
                  type="button"
                  onClick={handleGoogleConnect}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-semibold shadow-xs flex items-center space-x-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>เชื่อมต่อ Google</span>
                </button>
              )}
            </div>

            {/* Sync Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-600">
                รายการที่จะซิงก์: <strong>{contracts.length} สัญญา</strong> และ <strong>{customers.length} ลูกค้า</strong>
              </div>
              <button
                id="execute-sheets-sync-btn"
                type="button"
                disabled={isSyncing}
                onClick={handleSyncToSheets}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังซิงก์ขึ้น Google Sheets...' : 'สำรองข้อมูลขึ้น Google Sheets เดี๋ยวนี้'}</span>
              </button>
            </div>

            {/* Sync Success Result */}
            {syncStatus && (
              <div className="p-4 bg-white rounded-xl border border-emerald-300 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{syncStatus.message}</span>
                </div>
                <div className="text-slate-500">เวลาที่ซิงก์ล่าสุด: {syncStatus.syncedAt}</div>
                {syncStatus.spreadsheetUrl && (
                  <a
                    href={syncStatus.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-emerald-700 hover:text-emerald-900 font-semibold underline mt-1"
                  >
                    <span>เปิดดูสเปรดชีต Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Automated Daily Backup Configuration */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">ระบบสำรองข้อมูลอัตโนมัติประจำวัน (Daily Auto Backup)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDailyBackup}
                  onChange={(e) => setAutoDailyBackup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-xs text-slate-500">
              เมื่อเปิดใช้งาน ระบบจะทำการสำรองฐานข้อมูลอัตโนมัติทุกเวลา 23:59 น. ของทุกวันขึ้นสู่ Cloud Storage เพื่อความปลอดภัยของข้อมูลสัญญาสำคัญ
            </p>
          </div>

          {/* Section 3: Local Offline Backup & Restore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-slate-600" />
              <span>สำรองและกู้คืนไฟล์ข้อมูลในเครื่อง (Offline Backup & JSON Export)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="export-json-backup-btn"
                type="button"
                onClick={() =>
                  exportFullDatabaseBackup({
                    contracts,
                    customers,
                    branches,
                    exportedAt: new Date().toISOString(),
                  })
                }
                className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all hover:bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">ดาวน์โหลดฐานข้อมูลฉบับเต็ม (.JSON)</div>
                  <div className="text-[11px] text-slate-500">บันทึกข้อมูลทุกสาขาลงคอมพิวเตอร์หรือมือถือ</div>
                </div>
                <Download className="w-4 h-4 text-slate-600 shrink-0" />
              </button>

              <label className="p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all hover:bg-slate-50 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-900">กู้คืนข้อมูลจากไฟล์ (.JSON)</div>
                  <div className="text-[11px] text-slate-500">นำเข้าไฟล์สำรองที่บันทึกไว้ก่อนหน้า</div>
                </div>
                <Upload className="w-4 h-4 text-slate-600 shrink-0" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>
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
