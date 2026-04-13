import React, { useRef, useState } from 'react';
import { X, Download, MapPin } from 'lucide-react';
import { MarketListing, User as UserType, useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BillModalProps {
  listing: MarketListing;
  customer: UserType;
  onClose: () => void;
}

const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  let nStr = num.toString();
  if (nStr.length > 9) return 'overflow';
  
  const n = ('000000000' + nStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Only' : 'Only';
  return str;
};

export const BillModal: React.FC<BillModalProps> = ({ listing, customer, onClose }) => {
  const { accounts } = useAppContext();
  const { t } = useTranslations();
  const billRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const today = new Date().toLocaleDateString('en-GB');
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const invoiceNo = `${orderNumber}/2026-27`;

  // Look up seller details
  const seller = accounts[listing.ownerPhone];
  const sellerAddress = listing.address || seller?.address || 'Mangaluru, Karnataka';

  // Parse price (assuming format "Rs 2,200/qtl" -> 2200)
  const numericPriceTotal = parseInt(listing.price.replace(/[^0-9]/g, '')) || 2200;

  const handleDownloadPDF = async () => {
    if (!billRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      const source = billRef.current;
      const canvas = await html2canvas(source, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (el) =>
          el.classList?.contains('no-print') || el.tagName.toLowerCase() === 'iframe',
        onclone: (clonedDoc) => {
          const clonedBill = clonedDoc.querySelector('.bill-container') as HTMLElement | null;
          if (clonedBill) {
            clonedBill.style.maxHeight = 'none';
            clonedBill.style.overflow = 'visible';
          }
          clonedDoc.querySelectorAll('.no-print').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });
        },
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: false,
      });

      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();
      const marginMm = 6;
      const contentWidthMm = pageWidthMm - marginMm * 2;
      const contentHeightMm = pageHeightMm - marginMm * 2;
      const pxPerMm = canvas.width / contentWidthMm;
      const pageHeightPx = Math.max(1, Math.floor(contentHeightMm * pxPerMm));

      let yPx = 0;
      let page = 0;

      while (yPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - yPx);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;

        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to create PDF page context');
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          yPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          sliceCanvas.width,
          sliceCanvas.height
        );

        const img = sliceCanvas.toDataURL('image/png');
        const renderedHeightMm = sliceHeightPx / pxPerMm;

        if (page > 0) {
          pdf.addPage();
        }

        pdf.addImage(img, 'PNG', marginMm, marginMm, contentWidthMm, renderedHeightMm, undefined, 'FAST');

        yPx += sliceHeightPx;
        page += 1;
      }

      // Use jsPDF native save to ensure proper .pdf file type and filename.
      pdf.save(`Kisan_Bandhu_Invoice_${orderNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('bill.pdfFailed'));
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="no-print"
          style={{ 
            position: 'absolute', 
            top: '1.25rem', 
            right: '1.25rem', 
            background: '#f1f5f9', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#64748b',
            zIndex: 10,
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <div ref={billRef} className="bill-container">
            <div className="invoice-header">
              <div className="company-details">
                <h1>Mangalore Farming Industry</h1>
                <p>Plot 14, Baikampady Industrial Area, Mangaluru, Karnataka - 575011</p>
                <p>e-mail : support@mfi.co.in, Ph. 0824-2456789</p>
                <p>State Name : Karnataka, State Code : KA</p>
              </div>
              <div className="tax-invoice-badge">{t('bill.invoice')}</div>
            </div>

            <div className="invoice-info-grid">
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">{t('bill.clientName')}</span>
                  <span className="info-value">: {customer.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('bill.address')}</span>
                  <span className="info-value">: {customer.address}</span>
                </div>
              </div>
              <div className="info-box">
                <div className="info-row">
                  <span className="info-label">{t('bill.date')}</span>
                  <span className="info-value">: {today}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">{t('bill.invoiceNo')}</span>
                  <span className="info-value">: {invoiceNo}</span>
                </div>
              </div>
            </div>

            <div className="delivery-address">
              <div style={{ fontWeight: 800, textDecoration: 'underline', marginBottom: '0.5rem' }}>{t('bill.deliveryAddress')}</div>
              <div className="info-row">
                <span className="info-label" style={{ width: '120px' }}>{t('bill.clientName')}</span>
                <span className="info-value">: {customer.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label" style={{ width: '120px' }}>{t('bill.address')}</span>
                <span className="info-value">: {customer.address}</span>
              </div>
              <div style={{ position: 'absolute', right: '3.5rem', top: '12.5rem' }}>
                <p>State Name: Karnataka</p>
                <p>State Code: KA</p>
              </div>
            </div>

            <table className="tax-table">
              <thead>
                <tr>
                  <th className="col-sno">S.No</th>
                  <th className="col-desc">Description</th>
                  <th className="col-hsn">Code</th>
                  <th className="col-qty">Quantity</th>
                  <th className="col-rate">Unit Price</th>
                  <th className="col-amount">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="col-sno">1</td>
                  <td className="col-desc">
                    <div style={{ fontWeight: 800 }}>{listing.crop}</div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>Cultivated by: {listing.farmer}</div>
                    <div style={{ fontSize: '0.75rem' }}>Type: {listing.details.split('.')[0]}</div>
                  </td>
                  <td className="col-hsn">KH-{listing.id}</td>
                  <td className="col-qty">{listing.qty}</td>
                  <td className="col-rate">{(numericPriceTotal / (parseInt(listing.qty) || 1)).toFixed(2)}</td>
                  <td className="col-amount">{numericPriceTotal.toFixed(2)}</td>
                </tr>
                <tr className="table-filler-row">
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              </tbody>
            </table>

            <div className="footer-total-section">
              <div className="amount-in-words">
                <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>{t('bill.amountInWords')}</div>
                <div style={{ fontWeight: 600 }}>{numberToWords(numericPriceTotal)}</div>
              </div>
              <div className="totals-grid">
                <div className="grand-total-row">
                  <div className="grand-total-label">{t('bill.grandTotal')}</div>
                  <div className="grand-total-value">₹ {numericPriceTotal.toLocaleString('en-IN')}.00</div>
                </div>
              </div>
            </div>

            <div className="no-print" style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                <MapPin size={20} />
                <span>{t('bill.sellerLocationTracker')}</span>
              </div>
              <div style={{ width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(sellerAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
              <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                {t('bill.pickupLocationFor')} <strong>{sellerAddress}</strong>
              </p>
            </div>

            <div className="signature-section" style={{ marginTop: '3rem' }}>
              <div style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
                {t('bill.computerGenerated')}
              </div>
              <div className="signature-box">
                <p>For MANGALORE FARMING INDUSTRY</p>
                <div className="auth-sign-text">{t('bill.authorisedSignature')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="no-print" style={{ padding: '1.5rem 3rem 2.5rem', display: 'flex', gap: '1rem', background: '#f8fafc' }}>
          <button className="btn" style={{ flex: 2 }} onClick={handleDownloadPDF} disabled={isDownloading}>
            <Download size={16} /> {isDownloading ? t('bill.generatingPdf') : t('bill.downloadPdf')}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            {t('bill.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
