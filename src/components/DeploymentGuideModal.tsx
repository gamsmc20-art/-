import React, { useState } from 'react';
import {
  X,
  Server,
  Cloud,
  Terminal,
  Printer,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  Smartphone,
  Lock,
  FileSpreadsheet,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick_start' | 'local_pc' | 'cloud_server' | 'hardware' | 'faq'>('quick_start');

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div id="deployment-guide-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-amber-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>คู่มือการนำระบบออกไปใช้งานจริง (Production Deployment Guide)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Ready to Deploy
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                ขั้นตอนและวิธีนำระบบรับจำนำโทรศัพท์มือถือไปเปิดใช้งานหน้าร้านจริง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('quick_start')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'quick_start'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. เลือกวิธีติดตั้งใช้งาน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('local_pc')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'local_pc'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. รันบนคอมพิวเตอร์ที่ร้าน (Offline / Local)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloud_server')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'cloud_server'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>3. รันออนไลน์บนคลาวด์ (Cloud Run / VPS)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'hardware'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>4. ต่อเครื่องพิมพ์สลิป & ล็อคเครื่อง</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'faq'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>5. ข้อควรระวัง & FAQ</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm flex-1">
          {activeTab === 'quick_start' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-amber-950 text-base mb-1">
                  คำตอบ: ถ้าจะนำระบบนี้ออกไปใช้งานจริง มี 3 ช่องทางหลักให้เลือก
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  ระบบนี้พัฒนาด้วย <strong>React 19 + TypeScript + Tailwind CSS + Express</strong> จึงมีความยืดหยุ่นสูง สามารถรันเป็นเว็บออนไลน์หลายสาขา หรือรันแบบโปรแกรมประจำเครื่องหน้าร้านได้ทันที
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white border-2 border-amber-500/60 rounded-2xl shadow-xs space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        แนะนำวิธีที่ 1 (สะดวกสุด)
                      </span>
                      <Cloud className="w-4 h-4 text-amber-600" />
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">Deploy Cloud Run ผ่าน AI Studio</h5>
                    <p className="text-xs text-slate-600">
                      คลิกปุ่ม <strong>Deploy</strong> ที่มุมขวาบนของ Google AI Studio ระบบจะติดตั้งบน Cloud Run ให้ทันที ได้ URL เว็บไซต์พร้อม HTTPS สำหรับเปิดบนมือถือ แท็บเล็ต iPad ได้เลย
                    </p>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg">
                    ✓ ไม่ต้องลงโปรแกรมเพิ่ม เปิดได้ทันที
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        วิธีที่ 2 (หน้าร้านเดี่ยว)
                      </span>
                      <Terminal className="w-4 h-4 text-blue-600" />
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">ดาวน์โหลด ZIP รันบน PC หน้าร้าน</h5>
                    <p className="text-xs text-slate-600">
                      กดดาวน์โหลด Source Code เป็นไฟล์ ZIP หรือ Export to GitHub จากเมนูตั้งค่า นำไปแตกไฟล์ลงในคอมพิวเตอร์ที่ร้าน รันผ่านคำสั่ง <code>npm run build && npm run start</code>
                    </p>
                  </div>
                  <div className="text-[11px] text-blue-700 font-semibold bg-blue-50 p-2 rounded-lg">
                    ✓ ทำงานได้แม้ไม่มีอินเทอร์เน็ต (Offline)
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 relative flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        วิธีที่ 3 (หลายสาขา)
                      </span>
                      <Server className="w-4 h-4 text-purple-600" />
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">โฮสติ้งของตนเอง (VPS / Docker)</h5>
                    <p className="text-xs text-slate-600">
                      นำโค้ดไปติดตั้งบน VPS (เช่น DigitalOcean, AWS, หรือ Firebase Hosting / Vercel) พร้อมเชื่อมต่อโดเมนของร้าน เช่น <code>pawn.yourshop.com</code>
                    </p>
                  </div>
                  <div className="text-[11px] text-purple-700 font-semibold bg-purple-50 p-2 rounded-lg">
                    ✓ ครอบคลุมหลายสาขา บริหารส่วนกลาง
                  </div>
                </div>
              </div>

              {/* Checklist for Launch */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Checklist ความพร้อมก่อนเปิดรับจำนำจริง</span>
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">1.</span>
                    <span>ตั้งค่าชื่อร้าน ที่อยู่ สาขา และเบอร์ติดต่อ ในใบสัญญา</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">2.</span>
                    <span>ตรวจสอบอัตราดอกเบี้ย <strong>25% ต่อเดือน หรือ 6.25% ต่อสัปดาห์</strong></span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">3.</span>
                    <span>ทดสอบพิมพ์ใบสัญญาและใบเสร็จผ่านเครื่องพิมพ์ความร้อน</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center space-x-2">
                    <span className="text-emerald-600 font-bold">4.</span>
                    <span>เชื่อมต่อ Google Drive / Sheets เพื่อสำรองข้อมูลอัตโนมัติ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local_pc' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">การนำไปติดตั้งบนคอมพิวเตอร์ Windows / Mac หน้าร้าน</h4>
                <p className="text-xs text-slate-500">เหมาะสำหรับการใช้งานในร้านที่มีคอมพิวเตอร์ 1 เครื่อง ทำงานเร็ว และพิมพ์ใบสัญญาได้ตรงๆ</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">ขั้นตอนที่ 1: ติดตั้ง Node.js</span>
                  <p className="text-xs text-slate-600">
                    ดาวน์โหลดและติดตั้ง Node.js (เวอร์ชัน 20 หรือ 22 LTS) จาก{' '}
                    <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="text-amber-700 underline font-medium">
                      nodejs.org
                    </a>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 block">ขั้นตอนที่ 2: รันคำสั่งติดตั้ง Dependencies</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('npm install', 'cmd1')}
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200"
                    >
                      {copiedSection === 'cmd1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'cmd1' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-amber-300 font-mono text-xs rounded-lg overflow-x-auto">
                    npm install
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 block">ขั้นตอนที่ 3: คอมไพล์และเปิดระบบ (Production Mode)</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('npm run build\nnpm run start', 'cmd2')}
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200"
                    >
                      {copiedSection === 'cmd2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSection === 'cmd2' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-amber-300 font-mono text-xs rounded-lg overflow-x-auto">
                    npm run build{'\n'}npm run start
                  </pre>
                  <p className="text-xs text-slate-500">
                    เมื่อรันเสร็จ เปิดเว็บเบราว์เซอร์ (Chrome / Edge) แล้วพิมพ์ URL: <code className="text-amber-800 font-bold">http://localhost:3000</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cloud_server' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">การนำไปใช้งานบนคลาวด์เซิร์ฟเวอร์ (รองรับหลายสาขา / มือถือ / แท็บเล็ต)</h4>
                <p className="text-xs text-slate-500">พนักงานเปิดใช้งานได้ทุกที่ผ่านโทรศัพท์มือถือ แท็บเล็ต หรือโน้ตบุ๊ก</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Cloud className="w-4 h-4 text-amber-600" />
                    <span>ตัวเลือก 1: Google Cloud Run (ง่ายที่สุด)</span>
                  </div>
                  <p className="text-slate-600">
                    ใน AI Studio มีฟังก์ชัน <strong>Deploy</strong> ในตัว เพียงคลิกครั้งเดียว โค้ดทั้งหมดจะถูกบรรจุลงใน Container และเปิดให้บริการบน Google Cloud ทันที โดยมีใบรับรอง SSL (HTTPS) ให้ฟรี
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Server className="w-4 h-4 text-purple-600" />
                    <span>ตัวเลือก 2: Docker Container บน VPS ส่วนตัว</span>
                  </div>
                  <p className="text-slate-600">
                    หากต้องการติดตั้งบนเซิร์ฟเวอร์ของร้านเอง สามารถใช้ไฟล์ <code>Dockerfile</code> รันบน Docker Swarm หรือ Kubernetes ได้อย่างง่ายดาย
                  </p>
                  <pre className="p-2.5 bg-slate-900 text-amber-300 font-mono text-xs rounded-lg overflow-x-auto">
                    docker build -t mobile-pawn-system .{'\n'}docker run -p 3000:3000 mobile-pawn-system
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">การเชื่อมต่อเครื่องพิมพ์สลิปความร้อน และระบบล็อคเครื่องทางไกล</h4>
                <p className="text-xs text-slate-500">วิธีต่ออุปกรณ์ฮาร์ดแวร์หน้าร้าน</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                    <Printer className="w-4 h-4" />
                    <span>เครื่องพิมพ์ความร้อน (Thermal POS)</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    <li>รองรับทั้งขนาดกระดาษ <strong>80 มม.</strong> (แนะนำ) และ <strong>58 มม.</strong></li>
                    <li>เชื่อมต่อกับคอมพิวเตอร์ผ่านสาย USB หรือ Bluetooth</li>
                    <li>เมื่อกดปุ่ม "พิมพ์สลิปด่วน" ระบบจะตัดขอบและจัดหน้าให้ตรงกับความกว้างของกระดาษความร้อนโดยอัตโนมัติ</li>
                    <li>ในหน้าต่าง Print Dialog ของเบราว์เซอร์ ให้เลือก <strong>Margins: None</strong> เพื่อความคมชัด</li>
                  </ul>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
                    <Lock className="w-4 h-4" />
                    <span>ระบบล็อคเครื่องทางไกล (Device Lock)</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    <li><strong>Samsung:</strong> เชื่อมต่อผ่านโปรไฟล์ Knox Guard หรือ PayJoy</li>
                    <li><strong>Apple (iPhone/iPad):</strong> ให้ลูกค้าลงทะเบียน Apple Configurator หรือเปิด Lost Mode เมื่อค้างชำระ</li>
                    <li><strong>Android อื่นๆ:</strong> ติดตั้ง Remote Lock APK แบบ Device Admin ก่อนส่งมอบเงินจำนำ</li>
                    <li>เมื่อลูกค้าชำระดอกเบี้ยหรือไถ่ถอน ระบบจะส่งคำสั่งปลดล็อคเครื่องให้ทันที</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">Q: ข้อมูลสูญหายได้ไหมถ้าคอมพิวเตอร์ดับ?</div>
                <div className="text-slate-600">
                  A: ไม่สูญหาย ระบบมี <strong>Local Storage Persistence</strong> อัตโนมัติทุกวินาที และมีระบบสำรองข้อมูลขึ้น <strong>Google Drive / Sheets</strong> กดสำรองได้ทุกสิ้นวัน
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">Q: ปรับอัตราดอกเบี้ยเป็น 25% หรืออัตราอื่นได้หรือไม่?</div>
                <div className="text-slate-600">
                  A: ได้ทันที ระบบอัปเดตอัตราดอกเบี้ย <strong>25% ต่อเดือน</strong> และ <strong>6.25% ต่อสัปดาห์</strong> เป็นค่ามาตรฐานแล้ว และยังสามารถพิมพ์ระบุอัตราดอกเบี้ยอื่นๆ ได้อย่างอิสระตามความต้องการของแต่ละสัญญา
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900">Q: ถ้าต้องการแจ้งเตือนไปยัง LINE ของเจ้าของร้าน ต้องทำอย่างไร?</div>
                <div className="text-slate-600">
                  A: คลิกที่ปุ่ม <strong>"LINE แจ้งเตือน"</strong> ที่แถบเมนูด้านบน แล้วใส่ LINE Notify Token ร้าน เมื่อมีสัญญาใกล้ครบกำหนด หรือสั่งล็อคเครื่อง ระบบจะส่งข้อความแจ้งเตือนเข้ากลุ่ม LINE ทันที
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            ระบบบริหารจัดการรับจำนำโทรศัพท์มือถือ v2.2 (พร้อมใช้งานหน้าร้าน)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
