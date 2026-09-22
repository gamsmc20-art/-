import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  LayoutDashboard,
  FileText,
  Users,
  Package,
  TrendingUp,
  Plus,
  Cloud,
  Bell,
  Printer,
  Shield,
  Building2,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Rocket,
  Lock,
} from 'lucide-react';
import {
  PawnContract,
  Customer,
  Branch,
  SystemUser,
  LineNotifySettings,
} from './types';
import {
  initialContracts,
  initialCustomers,
  initialBranches,
  initialUsers,
  initialLineSettings,
} from './data/initialData';
import { Dashboard } from './components/Dashboard';
import { ContractList } from './components/ContractList';
import { CustomerManagement } from './components/CustomerManagement';
import { DefaultedItemsView } from './components/DefaultedItemsView';
import { ReportsAndAnalytics } from './components/ReportsAndAnalytics';
import { NewPawnModal } from './components/NewPawnModal';
import { PawnDetailModal } from './components/PawnDetailModal';
import { ThermalPrintModal } from './components/ThermalPrintModal';
import { InvoiceModal } from './components/InvoiceModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { LineNotifyModal } from './components/LineNotifyModal';
import { UserRoleModal } from './components/UserRoleModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { addDaysToDate } from './utils/calculator';

type ActiveView = 'dashboard' | 'contracts' | 'customers' | 'defaulted' | 'reports';

export default function App() {
  // State with LocalStorage persistence
  const [contracts, setContracts] = useState<PawnContract[]>(() => {
    const saved = localStorage.getItem('mobile_pawn_contracts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialContracts;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('mobile_pawn_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return initialCustomers;
  });

  const [branches] = useState<Branch[]>(initialBranches);
  const [currentUser, setCurrentUser] = useState<SystemUser>(initialUsers[0]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [lineSettings, setLineSettings] = useState<LineNotifySettings>(initialLineSettings);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ActiveView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [newPawnOpen, setNewPawnOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<PawnContract | null>(null);
  const [printContract, setPrintContract] = useState<PawnContract | null>(null);
  const [invoiceContract, setInvoiceContract] = useState<PawnContract | null>(null);
  const [cloudBackupOpen, setCloudBackupOpen] = useState(false);
  const [lineNotifyOpen, setLineNotifyOpen] = useState(false);
  const [userRoleOpen, setUserRoleOpen] = useState(false);
  const [deploymentGuideOpen, setDeploymentGuideOpen] = useState(false);

  // Persist contracts
  useEffect(() => {
    localStorage.setItem('mobile_pawn_contracts', JSON.stringify(contracts));
  }, [contracts]);

  // Persist customers
  useEffect(() => {
    localStorage.setItem('mobile_pawn_customers', JSON.stringify(customers));
  }, [customers]);

  // Badge counts
  const activeCount = contracts.filter(
    (c) => c.status === 'active' || c.status === 'due_soon' || c.status === 'overdue'
  ).length;
  const defaultedCount = contracts.filter((c) => c.status === 'defaulted').length;

  // Handler: Add new pawn contract
  const handleSaveNewContract = (
    newContract: PawnContract,
    newCustomer?: Customer,
    openPrintDirectly?: boolean
  ) => {
    if (newCustomer) {
      setCustomers((prev) => [newCustomer, ...prev]);
    }
    setContracts((prev) => [newContract, ...prev]);
    setNewPawnOpen(false);

    if (openPrintDirectly) {
      setPrintContract(newContract);
    }
  };

  // Handler: Pay interest & extend contract
  const handlePayInterest = (
    contractId: string,
    amount: number,
    periodDays: number,
    note?: string
  ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const newDueDate = addDaysToDate(c.dueDate, periodDays);
        const receiptNum = `REC-${Date.now().toString().slice(-6)}`;
        return {
          ...c,
          dueDate: newDueDate,
          status: 'active',
          totalInterestPaid: c.totalInterestPaid + amount,
          interestPeriodsPaid: c.interestPeriodsPaid + 1,
          paymentHistory: [
            {
              id: `pay-${Date.now()}`,
              contractId,
              receiptNumber: receiptNum,
              date: new Date().toISOString().split('T')[0],
              amount,
              type: 'interest',
              periodDays,
              newDueDate,
              note,
              recordedBy: currentUser.name,
            },
            ...c.paymentHistory,
          ],
        };
      })
    );
  };

  // Handler: Redeem pawned device
  const handleRedeem = (contractId: string, totalAmount: number, note?: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const receiptNum = `RED-${Date.now().toString().slice(-6)}`;
        return {
          ...c,
          status: 'redeemed',
          lockInfo: c.lockInfo
            ? { ...c.lockInfo, status: 'unlocked' as const, lockReason: undefined }
            : undefined,
          paymentHistory: [
            {
              id: `pay-${Date.now()}`,
              contractId,
              receiptNumber: receiptNum,
              date: new Date().toISOString().split('T')[0],
              amount: totalAmount,
              type: 'redemption',
              note,
              recordedBy: currentUser.name,
            },
            ...c.paymentHistory,
          ],
        };
      })
    );
  };

  // Handler: Remote Lock or Unlock device
  const handleToggleDeviceLock = (
    contractId: string,
    action: 'lock' | 'unlock',
    reason?: string,
    method?: any
  ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const currentLock = c.lockInfo || {
          status: 'unlocked' as const,
          lockMethod: 'Knox Guard' as const,
        };
        return {
          ...c,
          lockInfo: {
            ...currentLock,
            status: action === 'lock' ? ('locked' as const) : ('unlocked' as const),
            lockedAt: action === 'lock' ? new Date().toLocaleString('th-TH') : currentLock.lockedAt,
            lockedBy: action === 'lock' ? currentUser.name : currentLock.lockedBy,
            lockReason: action === 'lock' ? (reason || 'เลยกำหนดชำระ สั่งล็อคจากระบบ') : undefined,
            lockMethod: method || currentLock.lockMethod,
          },
        };
      })
    );

    // Keep detailContract in sync if open
    setDetailContract((prev) => {
      if (prev && prev.id === contractId) {
        const currentLock = prev.lockInfo || {
          status: 'unlocked' as const,
          lockMethod: 'Knox Guard' as const,
        };
        return {
          ...prev,
          lockInfo: {
            ...currentLock,
            status: action === 'lock' ? ('locked' as const) : ('unlocked' as const),
            lockedAt: action === 'lock' ? new Date().toLocaleString('th-TH') : currentLock.lockedAt,
            lockedBy: action === 'lock' ? currentUser.name : currentLock.lockedBy,
            lockReason: action === 'lock' ? (reason || 'เลยกำหนดชำระ สั่งล็อคจากระบบ') : undefined,
            lockMethod: method || currentLock.lockMethod,
          },
        };
      }
      return prev;
    });
  };

  // Handler: Mark as defaulted
  const handleMarkDefaulted = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, status: 'defaulted' } : c))
    );
  };

  // Handler: Add customer
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  // Handler: Update customer
  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Handler: Restore data from backup
  const handleRestoreBackup = (data: { contracts: PawnContract[]; customers: Customer[] }) => {
    setContracts(data.contracts);
    setCustomers(data.customers);
  };

  // Current contract branch
  const activeBranch = branches.find((b) => b.id === currentUser.branchId) || branches[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-xl shadow-md">
                <Smartphone className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Mobile Pawn Pro</span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Enterprise
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 hidden sm:block">
                  ระบบรับจำนำโทรศัพท์มือถือ • คำนวณดอกเบี้ยอัตโนมัติ • สำรองข้อมูลคลาวด์
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Production Deployment Guide */}
              <button
                id="header-deploy-guide-btn"
                type="button"
                onClick={() => setDeploymentGuideOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors shadow-xs"
                title="คู่มือและวิธีนำระบบออกไปใช้งานจริง (Production Deployment Guide)"
              >
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span className="hidden lg:inline">วิธีนำไปใช้งาน</span>
              </button>

              {/* Cloud Backup button */}
              <button
                id="header-cloud-btn"
                type="button"
                onClick={() => setCloudBackupOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors shadow-xs"
                title="สำรองข้อมูลขึ้นคลาวด์ Google Sheets"
              >
                <Cloud className="w-4 h-4" />
                <span className="hidden md:inline">สำรองคลาวด์</span>
              </button>

              {/* LINE Notify setup */}
              <button
                id="header-line-btn"
                type="button"
                onClick={() => setLineNotifyOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors shadow-xs"
                title="ตั้งค่าแจ้งเตือน LINE Notify"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden md:inline">LINE Notify</span>
              </button>

              {/* Fast Intake CTA */}
              <button
                id="header-intake-btn"
                type="button"
                onClick={() => setNewPawnOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>รับจำนำ</span>
              </button>

              {/* User Role Switcher Pill */}
              <button
                id="header-user-btn"
                type="button"
                onClick={() => setUserRoleOpen(true)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-300">{currentUser.roleTitle}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {/* Mobile menu hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar (Desktop) */}
          <div className="hidden md:flex space-x-1 overflow-x-auto border-t border-slate-800/80 pt-1 pb-2">
            {[
              { id: 'dashboard', label: 'แดชบอร์ดสรุปยอด', icon: LayoutDashboard },
              {
                id: 'contracts',
                label: 'สัญญารับจำนำ',
                icon: FileText,
                badge: activeCount,
              },
              { id: 'customers', label: 'สมาชิก & ลูกค้า', icon: Users },
              {
                id: 'defaulted',
                label: 'สินค้าหลุดจำนำ',
                icon: Package,
                badge: defaultedCount,
              },
              { id: 'reports', label: 'รายงานกำไร & งบการเงิน', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveView)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1">
            {[
              { id: 'dashboard', label: 'แดชบอร์ดสรุปยอด', icon: LayoutDashboard },
              { id: 'contracts', label: `สัญญารับจำนำ (${activeCount})`, icon: FileText },
              { id: 'customers', label: 'สมาชิก & ลูกค้า', icon: Users },
              { id: 'defaulted', label: `สินค้าหลุดจำนำ (${defaultedCount})`, icon: Package },
              { id: 'reports', label: 'รายงานกำไร & งบการเงิน', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as ActiveView);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            contracts={contracts}
            customers={customers}
            branches={branches}
            currentUser={currentUser}
            selectedBranchId={selectedBranchId}
            onSelectBranchId={setSelectedBranchId}
            onOpenNewPawn={() => setNewPawnOpen(true)}
            onOpenContractDetail={(c) => setDetailContract(c)}
            onOpenCloudBackup={() => setCloudBackupOpen(true)}
            onOpenLineNotify={() => setLineNotifyOpen(true)}
            onOpenThermalPrint={(c) => setPrintContract(c)}
            onOpenInvoice={(c) => setInvoiceContract(c)}
            onToggleDeviceLock={handleToggleDeviceLock}
          />
        )}

        {activeTab === 'contracts' && (
          <ContractList
            contracts={contracts}
            branches={branches}
            onOpenNewPawn={() => setNewPawnOpen(true)}
            onOpenDetail={(c) => setDetailContract(c)}
            onOpenThermalPrint={(c) => setPrintContract(c)}
            onOpenInvoice={(c) => setInvoiceContract(c)}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManagement
            customers={customers}
            contracts={contracts}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onSelectContractForView={(c) => setDetailContract(c)}
          />
        )}

        {activeTab === 'defaulted' && (
          <DefaultedItemsView
            contracts={contracts}
            onOpenContractDetail={(c) => setDetailContract(c)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAndAnalytics contracts={contracts} branches={branches} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            ระบบรับจำนำโทรศัพท์มือถือแบบรวมศูนย์ (Mobile Pawn Management System) • รองรับเครื่องพิมพ์ความร้อน
            และซิงก์ Google Sheets
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span>สถานะระบบ: ปกติ (99.9% Online)</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCloudBackupOpen(true)}
              className="text-emerald-600 hover:underline"
            >
              Google Sheets Connected
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {newPawnOpen && (
        <NewPawnModal
          customers={customers}
          branches={branches}
          currentUser={currentUser}
          onClose={() => setNewPawnOpen(false)}
          onSave={handleSaveNewContract}
        />
      )}

      {detailContract && (
        <PawnDetailModal
          contract={detailContract}
          branch={branches.find((b) => b.id === detailContract.branchId) || branches[0]}
          currentUser={currentUser}
          onClose={() => setDetailContract(null)}
          onPayInterest={handlePayInterest}
          onRedeem={handleRedeem}
          onMarkDefaulted={handleMarkDefaulted}
          onToggleDeviceLock={handleToggleDeviceLock}
          onOpenPrint={(c) => setPrintContract(c)}
          onOpenInvoice={(c) => setInvoiceContract(c)}
        />
      )}

      {printContract && (
        <ThermalPrintModal
          contract={printContract}
          branch={branches.find((b) => b.id === printContract.branchId) || branches[0]}
          onClose={() => setPrintContract(null)}
        />
      )}

      {invoiceContract && (
        <InvoiceModal
          contract={invoiceContract}
          branch={branches.find((b) => b.id === invoiceContract.branchId) || branches[0]}
          onClose={() => setInvoiceContract(null)}
        />
      )}

      {cloudBackupOpen && (
        <CloudBackupModal
          contracts={contracts}
          customers={customers}
          branches={branches}
          onClose={() => setCloudBackupOpen(false)}
          onRestoreData={handleRestoreBackup}
        />
      )}

      {lineNotifyOpen && (
        <LineNotifyModal
          settings={lineSettings}
          contracts={contracts}
          onClose={() => setLineNotifyOpen(false)}
          onSaveSettings={(s) => setLineSettings(s)}
        />
      )}

      {userRoleOpen && (
        <UserRoleModal
          currentUser={currentUser}
          allUsers={initialUsers}
          onSelectUser={(u) => {
            setCurrentUser(u);
            setUserRoleOpen(false);
          }}
          onClose={() => setUserRoleOpen(false)}
        />
      )}

      {deploymentGuideOpen && (
        <DeploymentGuideModal onClose={() => setDeploymentGuideOpen(false)} />
      )}
    </div>
  );
}
