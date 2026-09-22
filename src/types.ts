export type ContractStatus = 'active' | 'due_soon' | 'overdue' | 'defaulted' | 'redeemed';

export type UserRole = 'super_admin' | 'branch_manager' | 'staff';

export type DeviceLockStatus = 'unlocked' | 'locked' | 'lock_pending';

export interface DeviceLockInfo {
  status: DeviceLockStatus;
  lockedAt?: string;
  unlockedAt?: string;
  lockReason?: string;
  lockedBy?: string;
  lockMethod?: 'Knox Guard' | 'iCloud Lost Mode' | 'MDM Enterprise' | 'Remote Lock APK' | 'Manual';
  lastPingTime?: string;
}

export interface DeviceCondition {
  grade: 'A' | 'B' | 'C';
  screenCondition: string; // เช่น 'ไม่มีรอยขีดข่วน', 'รอยขนแมวเล็กน้อย', 'จอมีรอยร้าว'
  batteryHealth?: number; // %
  icloudRemoved: boolean; // ปลดล็อค iCloud/Gmail แล้ว
  accessories: string[]; // ['กล่องแท้', 'หัวชาร์จแท้', 'สายชาร์จแท้', 'เคส']
  notes?: string;
}

export interface DeviceInfo {
  brand: string; // Apple, Samsung, Xiaomi, Oppo, Vivo etc.
  model: string; // iPhone 15 Pro Max 256GB
  storage: string;
  color: string;
  imei: string;
  serialNumber?: string;
  condition: DeviceCondition;
}

export interface PaymentRecord {
  id: string;
  contractId: string;
  date: string;
  type: 'interest' | 'redemption' | 'principal_decrease';
  amount: number;
  periodDays?: number;
  newDueDate?: string;
  receiptNumber: string;
  recordedBy: string;
  note?: string;
}

export interface PawnContract {
  id: string;
  contractNumber: string; // e.g. PN-202609-001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress?: string;
  branchId: string;
  branchName: string;
  device: DeviceInfo;
  loanAmount: number; // เงินต้นรับจำนำ (บาท)
  appraisedValue: number; // ราคาประเมินตลาด (บาท)
  interestCycle?: 'monthly' | 'weekly'; // รอบคิดดอกเบี้ย: รายเดือน หรือ รายสัปดาห์
  interestRateMonthly: number; // อัตราดอกเบี้ยต่อเดือน (%) เช่น 25%
  interestRateWeekly?: number; // อัตราดอกเบี้ยต่อสัปดาห์ (%) เช่น 6.25%
  contractDate: string; // วันที่ทำสัญญา YYYY-MM-DD
  dueDate: string; // วันครบกำหนด YYYY-MM-DD
  status: ContractStatus;
  lockInfo?: DeviceLockInfo; // ข้อมูลสถานะการล็อคเครื่องทางไกล
  totalInterestPaid: number;
  interestPeriodsPaid: number;
  lastPaymentDate?: string;
  redemptionDate?: string;
  defaultDate?: string;
  paymentHistory: PaymentRecord[];
  createdBy: string;
  termsNotes?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  idCard: string; // บัตรประชาชน 13 หลัก
  phone: string;
  address: string;
  lineId?: string;
  emergencyContact?: string;
  memberSince: string;
  status: 'regular' | 'vip' | 'blacklisted';
  note?: string;
  activeContractsCount?: number;
  totalHistoryContracts?: number;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  taxId: string;
  managerName: string;
}

export interface SystemUser {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  branchId: string;
  branchName: string;
  email: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  timestamp: string;
  contractId?: string;
  contractNumber?: string;
  isRead: boolean;
}

export interface LineNotifySettings {
  enabled: boolean;
  token: string;
  notifyDaysBefore: number; // แจ้งเตือนก่อนครบกำหนดกี่วัน เช่น 3 วัน
  notifyOverdue: boolean; // แจ้งเตือนเมื่อเลยกำหนด
  notifyDefaulted: boolean; // แจ้งเตือนเมื่อสินค้าหลุดจำนำ
  sendDailySummary: boolean; // สรุปยอดประจำวัน
  lastSentTimestamp?: string;
}

export interface DailySummary {
  date: string;
  totalActiveLoan: number; // ยอดเงินต้นที่กำลังจำนำทั้งหมด
  activeContractsCount: number; // จำนวนสัญญาที่ยังไม่ไถ่ถอน
  todayNewPawnsCount: number; // สัญญาใหม่วันนี้
  todayNewPawnsAmount: number; // ยอดรับจำนำใหม่วันนี้
  todayInterestCollected: number; // ดอกเบี้ยที่รับชำระวันนี้
  todayRedeemedCount: number; // จำนวนที่ไถ่ถอนวันนี้
  todayRedeemedAmount: number; // เงินต้นที่ได้รับคืนวันนี้
  dueSoonCount: number; // สัญญาใกล้ครบกำหนด (ภายใน 3-7 วัน)
  overdueCount: number; // สัญญาเกินกำหนด
  defaultedCount: number; // สินค้าหลุดจำนำรอบใหม่
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  lastSyncTime?: string;
  autoSyncDaily: boolean;
}

export interface DefaultedPhoneItem {
  id: string;
  contractId: string;
  contractNumber: string;
  device: DeviceInfo;
  loanAmount: number;
  appraisedValue: number;
  forfeitedDate: string;
  sellingPrice?: number;
  soldPrice?: number;
  soldDate?: string;
  status: 'ready_for_sale' | 'sold';
}
