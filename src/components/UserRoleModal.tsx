import React, { useState } from 'react';
import {
  X,
  Shield,
  UserCheck,
  Lock,
  Check,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { SystemUser, UserRole } from '../types';

interface UserRoleModalProps {
  currentUser: SystemUser;
  allUsers: SystemUser[];
  onSelectUser: (user: SystemUser) => void;
  onClose: () => void;
}

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  onClose,
}) => {
  const rolePermissions: Record<
    UserRole,
    { title: string; desc: string; permissions: string[] }
  > = {
    super_admin: {
      title: 'ผู้ดูแลระบบสูงสุด (Super Admin / เจ้าของร้าน)',
      desc: 'ควบคุมทุกสาขา สิทธิ์สูงสุดในการเข้าถึงระบบการเงินและข้อมูลทั้งหมด',
      permissions: [
        'ดูรายงานสรุปผลกำไรรายได้รวมทุกสาขา',
        'สำรองข้อมูลและเชื่อมต่อ Google Sheets',
        'ตั้งค่าและปรับอัตราดอกเบี้ยพื้นฐาน',
        'จัดการสิทธิ์และเพิ่มลดผู้ใช้งานในระบบ',
        'อนุมัติการตัดจำหน่ายสินค้าหลุดจำนำ',
        'ส่งออกฐานข้อมูลฉบับเต็ม และกู้คืนข้อมูล',
      ],
    },
    branch_manager: {
      title: 'ผู้จัดการสาขา (Branch Manager)',
      desc: 'ดูแลและบริหารจัดการสาขาที่ได้รับมอบหมาย ตรวจสอบความถูกต้อง',
      permissions: [
        'อนุมัติวงเงินรับจำนำโทรศัพท์ตามราคาประเมิน',
        'ตัดสถานะสินค้าหลุดจำนำเพื่อส่งขายหน้าร้าน',
        'ดูรายงานสรุปยอดรายวันและรายเดือนประจำสาขา',
        'ติดตามการแจ้งเตือนสัญญาใกล้ครบกำหนดทาง LINE',
        'พิมพ์ใบสัญญาและใบแจ้งหนี้',
      ],
    },
    staff: {
      title: 'พนักงานประจำสาขา (Staff / Cashier)',
      desc: 'ปฏิบัติงานหน้าเคาน์เตอร์ ตรวจสอบเครื่องและรับชำระเงิน',
      permissions: [
        'บันทึกรับจำนำโทรศัพท์มือถือเครื่องใหม่',
        'ตรวจเช็คเลขอีมี่ (IMEI) สภาพเครื่อง และ iCloud',
        'รับชำระดอกเบี้ยและขยายเวลาสัญญา 15/30 วัน',
        'พิมพ์ใบสัญญาผ่านเครื่องพิมพ์ความร้อน (Thermal POS)',
        'สร้างใบแจ้งหนี้และคัดลอกข้อความแจ้งเตือนลูกค้า',
      ],
    },
  };

  return (
    <div id="user-role-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">จัดการสิทธิ์ผู้ใช้งานหลายระดับ (RBAC Security)</h3>
              <p className="text-xs text-slate-600">
                สิทธิ์การเข้าถึงแยกตามหน้าที่ความรับผิดชอบเพื่อความปลอดภัยสูงสุด
              </p>
            </div>
          </div>
          <button
            id="close-role-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Switch Active User Selector */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>สลับบทบาทผู้ใช้งานเพื่อทดสอบระบบ (Switch Account / Role):</span>
              <span className="text-[11px] text-amber-800 font-semibold">
                ผู้ใช้ปัจจุบัน: {currentUser.name}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {allUsers.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUser(u)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-50/80 border-amber-500 shadow-xs ring-1 ring-amber-400'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          u.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'branch_manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {u.roleTitle} • {u.branchName}
                        </div>
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-600 text-white rounded-full">
                        กำลังใช้งาน
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 hover:text-slate-600">สลับเข้าใช้ →</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Permissions Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900">
              รายละเอียดขอบเขตสิทธิ์ของบทบาทปัจจุบัน ({currentUser.roleTitle}):
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600 mb-2 font-medium">
                {rolePermissions[currentUser.role]?.desc}
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {rolePermissions[currentUser.role]?.permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
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
