import type { OrderRecord, ReconciliationEntry, ReconciliationSummary } from '../types';

// Amounts within a cent of each other are treated as matched — floating
// point arithmetic on currency values (qty × unit price) can drift by
// fractions of a cent without representing a real discrepancy.
const AMOUNT_TOLERANCE = 0.01;

export function reconcilePayments(records: OrderRecord[]): {
  entries: ReconciliationEntry[];
  summary: ReconciliationSummary;
} {
  const entries: ReconciliationEntry[] = records.map(r => {
    const orderAmt   = parseFloat(r.Order_Amount)   || 0;
    const paymentAmt = parseFloat(r.Payment_Amount) || 0;
    const hasPayment = r.Payment_ID.trim() !== '';

    let status: ReconciliationEntry['status'];
    if (!hasPayment) {
      status = 'Missing Payment';
    } else {
      const diff = Math.abs(orderAmt - paymentAmt);
      status = diff <= AMOUNT_TOLERANCE ? 'Matched' : 'Mismatch';
    }

    const difference = parseFloat((orderAmt - paymentAmt).toFixed(2));

    return {
      row_number:     r.row_number,
      Order_ID:       r.Order_ID,
      Customer_Name:  r.Customer_Name,
      Order_Date:     r.Order_Date,
      Payment_ID:     r.Payment_ID,
      Order_Amount:   orderAmt,
      Payment_Amount: paymentAmt,
      Difference:     difference,
      status,
    };
  });

  const matched        = entries.filter(e => e.status === 'Matched').length;
  const mismatched     = entries.filter(e => e.status === 'Mismatch').length;
  const missingPayment = entries.filter(e => e.status === 'Missing Payment').length;
  const totalMismatchAmount = entries
    .filter(e => e.status === 'Mismatch')
    .reduce((sum, e) => sum + Math.abs(e.Difference), 0);

  return {
    entries,
    summary: {
      total:               entries.length,
      matched,
      mismatched,
      missingPayment,
      totalMismatchAmount: parseFloat(totalMismatchAmount.toFixed(2)),
    },
  };
}
