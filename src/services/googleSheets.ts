import { PawnContract, Customer } from '../types';

export interface SyncResult {
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  syncedAt: string;
  itemsCount: number;
  message: string;
}

/**
 * Creates a dedicated Google Spreadsheet for Mobile Pawnshop Backup
 */
export async function createPawnBackupSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  const title = `Mobile Pawnshop Backup (ระบบรับจำนำมือถือ) - ${new Date().toISOString().split('T')[0]}`;
  
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'สัญญาจำนำ (Contracts)',
            gridProperties: { rowCount: 200, columnCount: 15 },
          },
        },
        {
          properties: {
            title: 'สมาชิกและลูกค้า (Customers)',
            gridProperties: { rowCount: 100, columnCount: 10 },
          },
        },
        {
          properties: {
            title: 'ประวัติรับชำระดอกเบี้ย (Payments)',
            gridProperties: { rowCount: 300, columnCount: 10 },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || 'Failed to create Google Spreadsheet');
  }

  const data = await response.json();
  const id = data.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${id}/edit`;
  return { id, url };
}

/**
 * Syncs contracts, customers, and payments to the Google Spreadsheet
 */
export async function syncPawnDataToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  contracts: PawnContract[],
  customers: Customer[]
): Promise<SyncResult> {
  // Format Contracts rows
  const contractHeaders = [
    'เลขที่สัญญา',
    'สาขา',
    'ชื่อลูกค้า',
    'เบอร์โทรศัพท์',
    'ยี่ห้อ/รุ่นโทรศัพท์',
    'ความจุ',
    'สี',
    'IMEI',
    'สภาพเครื่อง (เกรด)',
    'เงินต้นจำนำ (บาท)',
    'อัตราดอกเบี้ยต่อเดือน (%)',
    'วันที่ทำสัญญา',
    'วันครบกำหนด',
    'สถานะปัจจุบัน',
    'ดอกเบี้ยที่ชำระแล้วทั้งหมด (บาท)',
  ];

  const contractRows = contracts.map((c) => [
    c.contractNumber,
    c.branchName,
    c.customerName,
    c.customerPhone,
    `${c.device.brand} ${c.device.model}`,
    c.device.storage,
    c.device.color,
    c.device.imei,
    `เกรด ${c.device.condition.grade} (${c.device.condition.screenCondition})`,
    c.loanAmount,
    `${c.interestRateMonthly}%`,
    c.contractDate,
    c.dueDate,
    c.status === 'active'
      ? 'กำลังจำนำ'
      : c.status === 'due_soon'
      ? 'ใกล้ครบกำหนด'
      : c.status === 'overdue'
      ? 'เลยกำหนดชำระ'
      : c.status === 'defaulted'
      ? 'หลุดจำนำ'
      : 'ไถ่ถอนแล้ว',
    c.totalInterestPaid,
  ]);

  // Format Customers rows
  const customerHeaders = [
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

  const customerRows = customers.map((cust) => [
    cust.id,
    cust.fullName,
    cust.idCard,
    cust.phone,
    cust.address,
    cust.lineId || '-',
    cust.emergencyContact || '-',
    cust.status === 'vip' ? 'VIP' : cust.status === 'blacklisted' ? 'แบล็กลิสต์' : 'ทั่วไป',
    cust.memberSince,
  ]);

  // Format Payments rows
  const paymentHeaders = [
    'รหัสใบเสร็จ',
    'เลขที่สัญญา',
    'ประเภทรายการ',
    'จำนวนเงิน (บาท)',
    'วันที่ชำระ',
    'วันครบกำหนดใหม่',
    'ผู้บันทึก',
    'หมายเหตุ',
  ];

  const paymentRows: (string | number)[][] = [];
  contracts.forEach((c) => {
    (c.paymentHistory || []).forEach((p) => {
      paymentRows.push([
        p.receiptNumber,
        c.contractNumber,
        p.type === 'interest' ? 'ชำระดอกเบี้ย/ต่อสัญญา' : p.type === 'redemption' ? 'ไถ่ถอนเครื่อง' : 'ตัดเงินต้น',
        p.amount,
        p.date,
        p.newDueDate || '-',
        p.recordedBy,
        p.note || '-',
      ]);
    });
  });

  const valueRanges = [
    {
      range: "'สัญญาจำนำ (Contracts)'!A1:O" + (contractRows.length + 1),
      values: [contractHeaders, ...contractRows],
    },
    {
      range: "'สมาชิกและลูกค้า (Customers)'!A1:I" + (customerRows.length + 1),
      values: [customerHeaders, ...customerRows],
    },
    {
      range: "'ประวัติรับชำระดอกเบี้ย (Payments)'!A1:H" + (paymentRows.length + 1),
      values: [paymentHeaders, ...paymentRows],
    },
  ];

  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueRanges,
      }),
    }
  );

  if (!updateResponse.ok) {
    const err = await updateResponse.json();
    throw new Error(err?.error?.message || 'Failed to update Google Sheet values');
  }

  const syncedAt = new Date().toLocaleString('th-TH');
  return {
    success: true,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    syncedAt,
    itemsCount: contracts.length,
    message: `สำรองข้อมูลสำเร็จ ${contracts.length} สัญญา และลูกค้า ${customers.length} รายการ ขึ้นสู่ Google Sheets เรียบร้อยแล้ว`,
  };
}
