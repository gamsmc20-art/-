/**
 * Calculation and formatting utilities for Thai Mobile Pawnshop System
 */

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Format date string (YYYY-MM-DD) to Thai Buddhist era format
 * e.g., "2026-09-22" -> "22 ก.ย. 2569"
 */
export function formatThaiDate(dateStr: string, isFullMonth = false): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const year = parseInt(parts[0], 10) + 543;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = isFullMonth ? THAI_MONTHS_FULL[monthIdx] : THAI_MONTHS_SHORT[monthIdx];
  return `${day} ${monthName} ${year}`;
}

/**
 * Calculate difference in days between two dates
 */
export function getDaysDifference(targetDate: string, baseDate = new Date()): number {
  const target = new Date(targetDate);
  const base = new Date(baseDate.toISOString().split('T')[0]);
  const diffTime = target.getTime() - base.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine dynamic contract status based on due date and grace period
 */
export function evaluateContractStatus(
  currentStatus: string,
  dueDateStr: string,
  gracePeriodDays = 7
): 'active' | 'due_soon' | 'overdue' | 'defaulted' | 'redeemed' {
  if (currentStatus === 'redeemed' || currentStatus === 'defaulted') {
    return currentStatus;
  }

  const daysDiff = getDaysDifference(dueDateStr);

  if (daysDiff < -gracePeriodDays) {
    // Exceeded due date + grace period -> Defaulted/หลุดจำนำ
    return 'defaulted';
  } else if (daysDiff < 0) {
    // Exceeded due date but within grace period -> Overdue/เกินกำหนด
    return 'overdue';
  } else if (daysDiff <= 3) {
    // Within 3 days of due date -> Due soon/ใกล้ครบกำหนด
    return 'due_soon';
  } else {
    return 'active';
  }
}

/**
 * Calculate periodic interest amount for loan (monthly or weekly)
 */
export function calculateMonthlyInterest(loanAmount: number, ratePercentMonthly: number): number {
  return Math.round((loanAmount * (ratePercentMonthly / 100)) * 100) / 100;
}

export function calculateWeeklyInterest(loanAmount: number, ratePercentWeekly: number): number {
  return Math.round((loanAmount * (ratePercentWeekly / 100)) * 100) / 100;
}

/**
 * Calculate interest based on cycle ('monthly' | 'weekly') or period days
 */
export function calculateInterestByCycle(
  loanAmount: number,
  ratePercentMonthly: number,
  cycle: 'monthly' | 'weekly' = 'monthly',
  periodDays = 30,
  ratePercentWeekly?: number
): number {
  if (cycle === 'weekly') {
    const weeklyRate = ratePercentWeekly !== undefined ? ratePercentWeekly : Math.round((ratePercentMonthly / 4) * 100) / 100;
    const numWeeks = Math.max(1, Math.round(periodDays / 7));
    return Math.round((loanAmount * (weeklyRate / 100) * numWeeks) * 100) / 100;
  }
  // Monthly calculation
  if (periodDays <= 15) {
    return Math.round((loanAmount * (ratePercentMonthly / 100) * 0.5) * 100) / 100;
  }
  return Math.round((loanAmount * (ratePercentMonthly / 100)) * 100) / 100;
}

/**
 * Calculate total payable interest & overdue penalty (ค่าปรับวันละ 50 บาท เมื่อเลยกำหนดชำระ 1 วัน)
 */
export function calculatePayableAmounts(
  loanAmount: number,
  ratePercentMonthly: number,
  dueDateStr: string,
  penaltyRatePerDay = 50, // ค่าปรับวันละ 50 บาท เมื่อเลยกำหนดชำระตั้งแต่ 1 วันขึ้นไป
  cycle: 'monthly' | 'weekly' = 'monthly',
  periodDays = 30,
  ratePercentWeekly?: number
) {
  const baseInterest = calculateInterestByCycle(
    loanAmount,
    ratePercentMonthly,
    cycle,
    periodDays,
    ratePercentWeekly
  );
  const daysDiff = getDaysDifference(dueDateStr);
  
  let overdueDays = 0;
  let penaltyFee = 0;

  if (daysDiff < 0) {
    overdueDays = Math.abs(daysDiff);
    // Overdue penalty fee: ค่าปรับวันละ 50 บาท เริ่มตั้งแต่วันที่ 1
    penaltyFee = overdueDays * penaltyRatePerDay;
  }

  const totalInterestDue = baseInterest + penaltyFee;
  const totalRedemptionAmount = loanAmount + totalInterestDue;

  return {
    baseInterest,
    overdueDays,
    penaltyFee,
    totalInterestDue,
    totalRedemptionAmount,
  };
}

/**
 * Helper to check overdue status, 50 THB/day penalty, and 7-day device lock alert requirement
 * "หากเลยกำหนดชำระ 1 วัน จะมีค่าปรับวันละ 50 บาท ภายใน 7 วันแจ้งเตือนให้ล็อคเครื่อง"
 */
export function getOverdueLockStatus(
  dueDateStr: string,
  currentLockStatus?: string | boolean,
  customPenaltyRate = 50
) {
  const daysDiff = getDaysDifference(dueDateStr);
  const isOverdue = daysDiff < 0;
  const overdueDays = isOverdue ? Math.abs(daysDiff) : 0;
  const penaltyPerDay = customPenaltyRate;
  const penaltyFee = overdueDays * penaltyPerDay;

  // ภายใน 7 วัน แจ้งเตือนให้ล็อคเครื่อง
  const isWithin7Days = overdueDays >= 1 && overdueDays <= 7;
  const isPast7Days = overdueDays > 7;
  const daysRemainingIn7Days = Math.max(0, 7 - overdueDays);
  const isLocked = currentLockStatus === 'locked' || currentLockStatus === true;
  const shouldAlertToLock = isOverdue && !isLocked;

  return {
    isOverdue,
    overdueDays,
    penaltyPerDay,
    penaltyFee,
    isWithin7Days,
    isPast7Days,
    daysRemainingIn7Days,
    daysRemaining: daysRemainingIn7Days,
    isLocked,
    shouldAlertToLock,
  };
}

/**
 * Format currency with commas and 2 decimals or 0 decimals
 */
export function formatCurrency(amount: number, showDecimals = false): string {
  if (isNaN(amount)) return '0 ฿';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount) + ' ฿';
}

/**
 * Convert number to Thai Baht text format (e.g. 15,500 -> หนึ่งหมื่นห้าพันห้าร้อยบาทถ้วน)
 */
export function thaiBahtText(num: number): string {
  if (isNaN(num)) return 'ศูนย์บาทถ้วน';
  if (num === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const split = num.toFixed(2).split('.');
  const integerPart = split[0];
  const decimalPart = split[1];

  function convertGroup(nStr: string): string {
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr.charAt(i), 10);
      const place = len - i - 1;
      if (digit !== 0) {
        if (place === 1 && digit === 1) {
          result += 'สิบ';
        } else if (place === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (place === 0 && digit === 1 && len > 1 && parseInt(nStr.charAt(i - 1), 10) !== 0) {
          result += 'เอ็ด';
        } else {
          result += numbers[digit] + places[place];
        }
      }
    }
    return result;
  }

  let text = '';
  if (integerPart.length > 6) {
    const millionPart = integerPart.substring(0, integerPart.length - 6);
    const restPart = integerPart.substring(integerPart.length - 6);
    text = convertGroup(millionPart) + 'ล้าน' + convertGroup(restPart);
  } else {
    text = convertGroup(integerPart);
  }

  text += 'บาท';

  if (decimalPart === '00') {
    text += 'ถ้วน';
  } else {
    const satang1 = parseInt(decimalPart.charAt(0), 10);
    const satang2 = parseInt(decimalPart.charAt(1), 10);
    if (satang1 === 1) text += 'สิบ';
    else if (satang1 === 2) text += 'ยี่สิบ';
    else if (satang1 > 2) text += numbers[satang1] + 'สิบ';

    if (satang2 === 1 && satang1 > 0) text += 'เอ็ด';
    else if (satang2 > 0) text += numbers[satang2];

    text += 'สตางค์';
  }

  return text;
}

/**
 * Add days or months to a date string (YYYY-MM-DD)
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function addMonthsToDate(dateStr: string, months = 1): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}
