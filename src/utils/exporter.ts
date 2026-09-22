import { PawnContract, Customer } from '../types';

/**
 * Export contracts to CSV format with UTF-8 BOM for proper Thai language rendering in Excel
 */
export function exportContractsToCSV(contracts: PawnContract[], filename = 'pawn-contracts-report.csv') {
  const headers = [
    'เลขที่สัญญา',
    'สาขา',
    'ชื่อลูกค้า',
    'เลขประจำตัวประชาชน',
    'เบอร์โทรศัพท์',
    'ยี่ห้อ',
    'รุ่น',
    'ความจุ',
    'สี',
    'IMEI',
    'สภาพเครื่อง',
    'เงินต้น (บาท)',
    'ดอกเบี้ยต่อเดือน (%)',
    'วันที่เริ่มสัญญา',
    'วันครบกำหนด',
    'สถานะ',
    'ดอกเบี้ยที่ชำระแล้ว (บาท)',
  ];

  const rows = contracts.map((c) => [
    `"${c.contractNumber}"`,
    `"${c.branchName}"`,
    `"${c.customerName}"`,
    `"${c.customerIdCard}"`,
    `"${c.customerPhone}"`,
    `"${c.device.brand}"`,
    `"${c.device.model}"`,
    `"${c.device.storage}"`,
    `"${c.device.color}"`,
    `"${c.device.imei}"`,
    `"เกรด ${c.device.condition.grade}"`,
    c.loanAmount,
    c.interestRateMonthly,
    `"${c.contractDate}"`,
    `"${c.dueDate}"`,
    `"${c.status}"`,
    c.totalInterestPaid,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(customers: Customer[], filename = 'customers-list.csv') {
  const headers = [
    'รหัสลูกค้า',
    'ชื่อ-นามสกุล',
    'เลขประจำตัวประชาชน',
    'เบอร์โทรศัพท์',
    'ที่อยู่',
    'LINE ID',
    'เบอร์ติดต่อฉุกเฉิน',
    'สถานะสมาชิก',
    'วันที่สมัคร',
  ];

  const rows = customers.map((c) => [
    `"${c.id}"`,
    `"${c.fullName}"`,
    `"${c.idCard}"`,
    `"${c.phone}"`,
    `"${c.address}"`,
    `"${c.lineId || '-'}"`,
    `"${c.emergencyContact || '-'}"`,
    `"${c.status}"`,
    `"${c.memberSince}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Full JSON database backup
 */
export function exportFullDatabaseBackup(data: {
  contracts: PawnContract[];
  customers: Customer[];
  branches: any[];
  exportedAt: string;
}) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pawnshop-backup-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export defaulted inventory items to CSV
 */
export function exportDefaultedItemsToCSV(items: any[], filename = 'defaulted-phones-inventory.csv') {
  const headers = [
    'เลขที่สัญญาเดิม',
    'ยี่ห้อ',
    'รุ่น',
    'ความจุ',
    'สี',
    'IMEI',
    'สภาพเกรด',
    'ต้นทุนเงินต้นจำนำ (บาท)',
    'ราคาตั้งขาย (บาท)',
    'สถานะสินค้า',
    'วันที่หลุดจำนำ',
    'ราคาขายจริง (บาท)',
    'วันที่ขาย',
  ];

  const rows = items.map((it) => [
    `"${it.contractNumber}"`,
    `"${it.device?.brand || ''}"`,
    `"${it.device?.model || ''}"`,
    `"${it.device?.storage || ''}"`,
    `"${it.device?.color || ''}"`,
    `"${it.device?.imei || ''}"`,
    `"${it.device?.condition?.grade || ''}"`,
    it.loanAmount,
    it.sellingPrice || 0,
    `"${it.status === 'sold' ? 'ขายแล้ว' : 'พร้อมจำหน่าย'}"`,
    `"${it.forfeitedDate || ''}"`,
    it.soldPrice || 0,
    `"${it.soldDate || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export financial P&L report to CSV
 */
export function exportFinancialReportToCSV(data: any[], filename = 'monthly-pnl-report.csv') {
  const headers = [
    'ประจำเดือน',
    'รายได้ดอกเบี้ยรับ (บาท)',
    'รายได้กำไรขายสินค้าหลุดจำนำ (บาท)',
    'รายได้ค่าปรับล่าช้า (บาท)',
    'ค่าใช้จ่ายในการดำเนินงาน (บาท)',
    'กำไรสุทธิ (บาท)',
  ];

  const rows = data.map((r) => [
    `"${r.month}"`,
    r.interestIncome,
    r.forfeitedSalesProfit,
    r.penaltyIncome,
    r.expenses,
    r.netProfit,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
