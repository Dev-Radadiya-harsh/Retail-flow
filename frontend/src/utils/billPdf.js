import { jsPDF } from 'jspdf';
import { formatCurrency } from './helpers';

/** Build the same bill layout used everywhere */
export function buildBillPdfDoc(sale) {
  const doc = new jsPDF();
  const top = 15;
  doc.setFontSize(16);
  doc.text('RetailFlow Bill', 14, top);
  doc.setFontSize(11);
  doc.text(`Bill No: ${sale.billNumber || sale.id}`, 14, top + 10);
  doc.text(`Date: ${new Date(sale.dateTime).toLocaleString('en-IN')}`, 14, top + 17);
  doc.text(`Customer: ${sale.customerName || 'Walk-in'}`, 14, top + 24);
  doc.text(`Phone: ${sale.customerPhone || '-'}`, 14, top + 31);

  let y = top + 42;
  doc.setFontSize(12);
  doc.text('Items', 14, y);
  y += 8;
  doc.setFontSize(10);
  sale.items.forEach((item) => {
    doc.text(`${item.productName} x${item.quantity}`, 14, y);
    doc.text(formatCurrency(item.total), 175, y, { align: 'right' });
    y += 6;
  });
  y += 4;
  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(sale.totalAmount ?? sale.total ?? 0)}`, 14, y);
  return doc;
}

export function getBillFilename(sale) {
  const base = sale.billNumber || sale.id;
  return `${String(base).replace(/[/\\?%*:|"<>]/g, '-')}.pdf`;
}

export function downloadBillPdf(sale) {
  const doc = buildBillPdfDoc(sale);
  doc.save(getBillFilename(sale));
}

export function getBillPdfBlob(sale) {
  const doc = buildBillPdfDoc(sale);
  const filename = getBillFilename(sale);
  const blob = doc.output('blob');
  return { blob, filename };
}

/** Digits only for wa.me (e.g. 919876543210) */
export function normalizeWhatsAppDigits(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

/**
 * Share bill PDF to customer via WhatsApp:
 * - Mobile / capable browsers: system share sheet with PDF attached (pick WhatsApp).
 * - Otherwise: download PDF + open WhatsApp chat (no long text — user attaches file if needed).
 */
export async function shareBillPdfOnWhatsApp(sale, { toast } = {}) {
  const digits = normalizeWhatsAppDigits(sale.customerPhone);
  if (!digits) {
    toast?.warning?.('Customer WhatsApp number is missing for this bill');
    return;
  }

  const { blob, filename } = getBillPdfBlob(sale);
  const file = new File([blob], filename, { type: 'application/pdf' });

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({
        files: [file],
        title: 'RetailFlow bill',
        text: 'Your bill from RetailFlow',
      });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('navigator.share failed, using fallback', err);
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast?.info?.('PDF saved. WhatsApp opened — attach the downloaded file to send it to the customer.');
  window.open(`https://wa.me/${digits}`, '_blank', 'noopener,noreferrer');
}
