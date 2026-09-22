import React, { useState } from 'react';
import {
  X,
  Shield,
  Check,
  Edit2,
  Plus,
  Trash2,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { SystemUser, UserRole, Branch } from '../types';

interface UserRoleModalProps {
  currentUser: SystemUser;
  allUsers: SystemUser[];
  branches: Branch[];
  onSelectUser: (user: SystemUser) => void;
  onUpdateUser: (user: SystemUser) => void;
  onAddUser: (user: SystemUser) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateBranch: (branch: Branch) => void;
  onAddBranch: (branch: Branch) => void;
  onDeleteBranch: (branchId: string) => void;
  onClose: () => void;
}

type TabType = 'users' | 'branches' | 'permissions';

export const UserRoleModal: React.FC<UserRoleModalProps> = ({
  currentUser,
  allUsers,
  branches,
  onSelectUser,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  onUpdateBranch,
  onAddBranch,
  onDeleteBranch,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('users');

  // User Edit / Add state
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userFormData, setUserFormData] = useState<{
    name: string;
    role: UserRole;
    branchId: string;
    email: string;
  }>({
    name: '',
    role: 'staff',
    branchId: branches[0]?.id || '',
    email: '',
  });

  // Branch Edit / Add state
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [branchFormData, setBranchFormData] = useState<Branch>({
    id: '',
    name: '',
    code: '',
    address: '',
    phone: '',
    taxId: '',
    managerName: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const rolePermissions: Record<
    UserRole,
    { title: string; desc: string; permissions: string[] }
  > = {
    super_admin: {
      title: 'ผู้ดูแลระบบสูงสุด (Super Admin / เจ้าของร้าน)',
      desc: 'ควบคุมทุกสาขา สิทธิ์สูงสุดในการเข้าถึงระบบการเงินและข้อมูลทั้งหมด',
      permissions: [
        'แก้ไขชื่อเจ้าของร้านและข้อมูลกิจการ',
        'จัดการเพิ่ม/แก้ไขสาขา และพนักงานทุกคน',
        'ดูรายงานสรุปผลกำไรรายได้รวมทุกสาขา',
        'สำรองข้อมูลและเชื่อมต่อ Google Sheets',
        'ตั้งค่าและปรับอัตราดอกเบี้ยพื้นฐาน',
        'ส่งคำสั่งล็อคเครื่องทางไกล และปลดล็อคเครื่อง',
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

  // --- Handlers for User ---
  const handleStartEditUser = (user: SystemUser) => {
    setIsAddingUser(false);
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      role: user.role,
      branchId: user.branchId,
      email: user.email,
    });
  };

  const handleStartAddUser = () => {
    setEditingUser(null);
    setIsAddingUser(true);
    setUserFormData({
      name: '',
      role: 'staff',
      branchId: branches[0]?.id || '',
      email: '',
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim()) return;

    const matchedBranch = branches.find((b) => b.id === userFormData.branchId) || branches[0];
    const roleTitle = rolePermissions[userFormData.role].title.split(' (')[0];

    if (editingUser) {
      const updated: SystemUser = {
        ...editingUser,
        name: userFormData.name.trim(),
        role: userFormData.role,
        roleTitle,
        branchId: matchedBranch?.id || '',
        branchName: matchedBranch?.name || '',
        email: userFormData.email.trim() || `${Date.now()}@mobilepawn.co.th`,
      };
      onUpdateUser(updated);
      setEditingUser(null);
      showToast(`บันทึกการแก้ไข "${updated.name}" เรียบร้อยแล้ว`);
    } else if (isAddingUser) {
      const newUser: SystemUser = {
        id: `usr-${Date.now()}`,
        name: userFormData.name.trim(),
        role: userFormData.role,
        roleTitle,
        branchId: matchedBranch?.id || '',
        branchName: matchedBranch?.name || '',
        email: userFormData.email.trim() || `staff_${Date.now().toString().slice(-4)}@mobilepawn.co.th`,
      };
      onAddUser(newUser);
      setIsAddingUser(false);
      showToast(`เพิ่มพนักงานใหม่ "${newUser.name}" เรียบร้อยแล้ว`);
    }
  };

  const handleDeleteUserClick = (user: SystemUser) => {
    if (user.role === 'super_admin' && allUsers.filter((u) => u.role === 'super_admin').length <= 1) {
      alert('ไม่สามารถลบบัญชีเจ้าของร้าน (Super Admin) บัญชีเดียวของระบบได้');
      return;
    }
    if (confirm(`คุณต้องการลบผู้ใช้งาน "${user.name}" หรือไม่?`)) {
      onDeleteUser(user.id);
      showToast(`ลบผู้ใช้งาน "${user.name}" เรียบร้อย`);
    }
  };

  // --- Handlers for Branch ---
  const handleStartEditBranch = (branch: Branch) => {
    setIsAddingBranch(false);
    setEditingBranch(branch);
    setBranchFormData({ ...branch });
  };

  const handleStartAddBranch = () => {
    setEditingBranch(null);
    setIsAddingBranch(true);
    setBranchFormData({
      id: `br-${Date.now()}`,
      name: '',
      code: `BR-${branches.length + 1}`,
      address: '',
      phone: '',
      taxId: branches[0]?.taxId || '',
      managerName: '',
    });
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchFormData.name.trim()) return;

    if (editingBranch) {
      onUpdateBranch(branchFormData);
      setEditingBranch(null);
      showToast(`บันทึกการแก้ไขสาขา "${branchFormData.name}" เรียบร้อยแล้ว`);
    } else if (isAddingBranch) {
      onAddBranch(branchFormData);
      setIsAddingBranch(false);
      showToast(`เพิ่มสาขาใหม่ "${branchFormData.name}" เรียบร้อยแล้ว`);
    }
  };

  const handleDeleteBranchClick = (branch: Branch) => {
    if (branches.length <= 1) {
      alert('ต้องมีสาขาอย่างน้อย 1 สาขาในระบบ');
      return;
    }
    if (confirm(`คุณต้องการลบสาขา "${branch.name}" หรือไม่?`)) {
      onDeleteBranch(branch.id);
      showToast(`ลบสาขา "${branch.name}" เรียบร้อย`);
    }
  };

  return (
    <div id="user-role-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shadow-xs font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>จัดการเจ้าของร้าน พนักงาน & ข้อมูลสาขา</span>
              </h3>
              <p className="text-xs text-slate-300">
                แก้ไขชื่อเจ้าของร้าน พนักงาน สิทธิ์การเข้าถึง และข้อมูลสาขาสำหรับหัวบิล/สลิป
              </p>
            </div>
          </div>
          <button
            id="close-role-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 space-x-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              setEditingUser(null);
              setIsAddingUser(false);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'users'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ชื่อเจ้าของร้าน & พนักงาน ({allUsers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('branches');
              setEditingBranch(null);
              setIsAddingBranch(false);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'branches'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>ข้อมูลสาขา & ใบเสร็จ ({branches.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'permissions'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>สิทธิ์การใช้งาน (RBAC)</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs text-emerald-800 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Form: Add or Edit User */}
              {(editingUser || isAddingUser) ? (
                <form
                  onSubmit={handleSaveUser}
                  className="p-4 bg-amber-50/60 border border-amber-300 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="text-xs font-bold text-amber-950 flex items-center space-x-1.5">
                      <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>{editingUser ? `แก้ไขข้อมูล: ${editingUser.name}` : '➕ เพิ่มพนักงานใหม่'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setIsAddingUser(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      ยกเลิก
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ชื่อ - นามสกุล (หรือตำแหน่งกำกับ): <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        placeholder="เช่น คุณธนกร ทรัพย์เจริญ (เจ้าของร้าน)"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        บทบาทและระดับสิทธิ์: <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 font-medium"
                      >
                        <option value="super_admin">ผู้ดูแลระบบสูงสุด (Super Admin / เจ้าของร้าน)</option>
                        <option value="branch_manager">ผู้จัดการสาขา (Branch Manager)</option>
                        <option value="staff">พนักงานประจำสาขา (Staff / Cashier)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        สาขาที่สังกัด:
                      </label>
                      <select
                        value={userFormData.branchId}
                        onChange={(e) => setUserFormData({ ...userFormData, branchId: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 font-medium"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        อีเมลสำหรับติดต่อ/เข้าระบบ:
                      </label>
                      <input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        placeholder="owner@mobilepawn.co.th"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(null);
                        setIsAddingUser(false);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingUser ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มพนักงาน'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">รายชื่อเจ้าของร้านและพนักงาน:</span>
                    <p className="text-[11px] text-slate-500">คลิก "แก้ไข" เพื่อเปลี่ยนชื่อเจ้าของร้านหรือพนักงานได้ทันที</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartAddUser}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มพนักงานใหม่</span>
                  </button>
                </div>
              )}

              {/* Users List */}
              <div className="grid grid-cols-1 gap-2.5">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-amber-50/70 border-amber-400 shadow-xs ring-1 ring-amber-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            u.role === 'super_admin'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : u.role === 'branch_manager'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">{u.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white rounded-full">
                                บัญชีปัจจุบัน
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2">
                            <span className="font-semibold text-slate-700">{u.roleTitle}</span>
                            <span>•</span>
                            <span className="text-slate-500">{u.branchName}</span>
                            {u.email && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">{u.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => onSelectUser(u)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            สลับเข้าใช้
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEditUser(u)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg flex items-center space-x-1 transition-colors"
                          title="แก้ไขชื่อและข้อมูล"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>แก้ไขชื่อ</span>
                        </button>
                        {u.role !== 'super_admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUserClick(u)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบพนักงาน"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BRANCHES MANAGEMENT */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              {/* Form: Add or Edit Branch */}
              {(editingBranch || isAddingBranch) ? (
                <form
                  onSubmit={handleSaveBranch}
                  className="p-4 bg-slate-50 border border-slate-300 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-600" />
                      <span>{editingBranch ? `แก้ไขข้อมูลสาขา: ${editingBranch.name}` : '➕ เพิ่มสาขาใหม่'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBranch(null);
                        setIsAddingBranch(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      ยกเลิก
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ชื่อสาขา (พิมพ์บนหัวสลิป & ใบสัญญา): <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={branchFormData.name}
                        onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                        placeholder="เช่น สาขาหลัก สยามสแควร์"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        รหัสสาขา (Branch Code):
                      </label>
                      <input
                        type="text"
                        value={branchFormData.code}
                        onChange={(e) => setBranchFormData({ ...branchFormData, code: e.target.value })}
                        placeholder="เช่น SIAM-01"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        ที่อยู่สาขา (แสดงในใบสัญญาและสลิปความร้อน):
                      </label>
                      <input
                        type="text"
                        value={branchFormData.address}
                        onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                        placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        เบอร์โทรศัพท์สาขา:
                      </label>
                      <input
                        type="text"
                        value={branchFormData.phone}
                        onChange={(e) => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                        placeholder="02-xxx-xxxx หรือ 08x-xxx-xxxx"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        เลขประจำตัวผู้เสียภาษี (Tax ID):
                      </label>
                      <input
                        type="text"
                        value={branchFormData.taxId}
                        onChange={(e) => setBranchFormData({ ...branchFormData, taxId: e.target.value })}
                        placeholder="01055xxxxxxxx"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        ชื่อผู้จัดการสาขา:
                      </label>
                      <input
                        type="text"
                        value={branchFormData.managerName}
                        onChange={(e) => setBranchFormData({ ...branchFormData, managerName: e.target.value })}
                        placeholder="คุณ..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBranch(null);
                        setIsAddingBranch(false);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingBranch ? 'บันทึกข้อมูลสาขา' : 'ยืนยันเพิ่มสาขา'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">รายชื่อสาขาทั้งหมดในระบบ:</span>
                    <p className="text-[11px] text-slate-500">
                      ข้อมูลชื่อและที่อยู่สาขาจะถูกนำไปพิมพ์ลงบนใบสัญญารับจำนำ และสลิปความร้อนโดยอัตโนมัติ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartAddBranch}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มสาขาใหม่</span>
                  </button>
                </div>
              )}

              {/* Branches List */}
              <div className="grid grid-cols-1 gap-3">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{b.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {b.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{b.address || 'ยังไม่ระบุที่อยู่'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3">
                        {b.phone && <span>โทร: {b.phone}</span>}
                        {b.taxId && <span>เลขผู้เสียภาษี: {b.taxId}</span>}
                        {b.managerName && <span>ผู้จัดการ: {b.managerName}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditBranch(b)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-slate-600" />
                        <span>แก้ไขข้อมูลสาขา</span>
                      </button>
                      {branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteBranchClick(b)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบสาขา"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PERMISSIONS MATRIX */}
          {activeTab === 'permissions' && (
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            * ข้อมูลจะถูกบันทึกอัตโนมัติลงในระบบทันที
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
