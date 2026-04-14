import React, { useRef, useState } from 'react';
import { X, Download, MapPin, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MarketListing, User as UserType, useAppContext } from '../context/AppContext';
import { useTranslations } from '../i18n';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface BillModalProps {
  listing: MarketListing;
  customer: UserType;
  selectedQty: string;
  razorpayPaymentId?: string;
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

export const BillModal: React.FC<BillModalProps> = ({ listing, customer, selectedQty, razorpayPaymentId, onClose }) => {
  const { accounts } = useAppContext();
  const { t } = useTranslations();
  const billRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const today = new Date().toLocaleDateString('en-GB');
  const orderNumber = Math.floor(100000 + Math.random() * 900000);
  const invoiceNo = `${orderNumber}/2026-27`;

  const seller = accounts[listing.ownerPhone];
  const sellerAddress = listing.address || seller?.address || 'Mangaluru, Karnataka';

  const unitPrice = parseInt(listing.price.replace(/[^0-9]/g, '')) || 1000;
  const qtyNumeric = parseInt(selectedQty) || 1;
  const totalAmount = unitPrice * qtyNumeric;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const el = billRef.current;
    if (!el || isDownloading) return;

    setIsDownloading(true);
    try {
      const safeInvoiceNo = invoiceNo.replace(/[^\w.-]+/g, '_');
      const filename = `Invoice_${safeInvoiceNo}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      // html2pdf() returns a chainable worker; save() triggers a direct PDF download.
      await (html2pdf() as any).set(opt).from(el).save();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: 'min(900px, 95%)', padding: '0', overflow: 'hidden' }}>
        <div className="no-print" style={{ 
          padding: '1rem 1.5rem', 
          background: 'white', 
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={20} /> Checkout Bill
          </h2>
          <div className="flex gap-2">
            <button
              className="btn"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.85rem',
                background: '#2f6f3e',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isDownloading ? 0.75 : 1,
                cursor: isDownloading ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={16} /> {isDownloading ? 'Preparing PDF…' : t('bill.downloadPdf')}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={{ maxHeight: 'calc(90vh - 60px)', overflowY: 'auto', padding: '2rem', background: '#f1f5f9' }}>
          <div ref={billRef} className="bill-container" style={{ 
            background: 'white', 
            padding: '0', 
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            borderRadius: '12px',
            color: '#1e293b',
            fontSize: '12px',
            lineHeight: '1.4',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Premium Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #1a3d24, #2f6f3e)', 
              color: 'white', 
              padding: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.02em', color: '#74a63b' }}>KISAN BANDHU</h1>
                <p style={{ margin: 0, opacity: 0.85, fontSize: '13px' }}>Digital Empowerment for Modern Agriculture</p>
                <div style={{ marginTop: '15px' }}>
                  <p style={{ margin: '2px 0' }}>Plot 14, Baikampady Industrial Area, Mangaluru, KA - 575011</p>
                  <p style={{ margin: '2px 0' }}>support@kisanbandhu.com | +91 824 245 6789</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '8px 16px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'inline-block'
                }}>
                  <p style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Tax Invoice</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>#{orderNumber}</p>
                </div>
                <p style={{ marginTop: '10px', fontSize: '13px' }}>Date: <strong>{today}</strong></p>
              </div>
            </div>

            <div style={{ padding: '40px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '24px', 
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  position: 'relative'
                }}>
                  <div style={{ color: '#2f6f3e', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px', borderLeft: '4px solid #74a63b', paddingLeft: '10px' }}>Bill To Customer</div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>{customer.name}</h2>
                  <p style={{ margin: '2px 0', color: '#64748b' }}>{customer.address}</p>
                  <p style={{ margin: '8px 0 0 0', fontWeight: 600 }}>Ph: {customer.phone}</p>
                  
                  {razorpayPaymentId && (
                    <div style={{ 
                      marginTop: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      background: 'white',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      width: 'fit-content'
                    }}>
                      <div style={{ color: '#22c55e' }}><CheckCircle2 size={18} /></div>
                      <span style={{ fontWeight: 800, color: '#166534', fontSize: '11px' }}>PAYMENT SECURED • PAID</span>
                    </div>
                  )}
                </div>

                <div style={{ border: '1px solid #f1f5f9', padding: '15px' }}>
                  <div style={{ color: '#64748b', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>Transaction Info</div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div className="flex justify-between">
                      <span style={{ color: '#94a3b8' }}>Invoice No:</span>
                      <span style={{ fontWeight: 700 }}>{invoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#94a3b8' }}>Payment Mode:</span>
                      <span style={{ fontWeight: 700 }}>UPI (kushanthgowda261@okaxis)</span>
                    </div>
                    {razorpayPaymentId && (
                      <div className="flex justify-between">
                        <span style={{ color: '#94a3b8' }}>Transaction ID:</span>
                        <span style={{ fontWeight: 700, color: '#2f6f3e' }}>{razorpayPaymentId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ overflow: 'hidden', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1a3d24', color: 'white' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Item Description</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>HSN Code</th>
                      <th style={{ padding: '15px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '15px', textAlign: 'right' }}>Price/Unit</th>
                      <th style={{ padding: '15px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 15px' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{listing.crop}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Produced by: {listing.farmer}</div>
                      </td>
                      <td style={{ padding: '20px 15px', textAlign: 'center', color: '#64748b' }}>1006.19</td>
                      <td style={{ padding: '20px 15px', textAlign: 'center', fontWeight: 700 }}>{selectedQty}</td>
                      <td style={{ padding: '20px 15px', textAlign: 'right' }}>₹{unitPrice.toLocaleString('en-IN')}.00</td>
                      <td style={{ padding: '20px 15px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{totalAmount.toLocaleString('en-IN')}.00</td>
                    </tr>
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={3} style={{ padding: '15px' }}>
                        <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Amount in Words</div>
                        <div style={{ fontWeight: 700, fontStyle: 'italic', color: '#1a3d24' }}>INR {numberToWords(totalAmount)} Only</div>
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', color: '#64748b', fontWeight: 700 }}>Grand Total</td>
                      <td style={{ padding: '15px', textAlign: 'right', fontSize: '20px', fontWeight: 900, color: '#2f6f3e' }}>₹{totalAmount.toLocaleString('en-IN')}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2f6f3e', marginBottom: '10px' }}>
                    <ShieldCheck size={16} />
                    <span style={{ fontWeight: 800, fontSize: '11px' }}>VERIFIED TRANSACTION</span>
                  </div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', maxWidth: '300px' }}>
                    This is an electronically generated invoice valid for the purchase made on Kisan Bandhu. Digital signature not required.
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    borderBottom: '2px solid #e2e8f0', 
                    width: '180px', 
                    height: '60px', 
                    margin: '0 auto 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Caveat", cursive',
                    fontSize: '24px',
                    color: '#2f6f3e',
                    opacity: 0.8
                  }}>Kisan Bandhu</div>
                  <p style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', fontSize: '10px', color: '#64748b' }}>Authorised Seal</p>
                </div>
              </div>
            </div>

            {/* Footer Stripe */}
            <div style={{ background: '#f8fafc', padding: '15px 40px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                <MapPin size={14} />
                <span style={{ fontSize: '10px' }}>Pickup: {sellerAddress}</span>
              </div>
              <p style={{ margin: 0, fontSize: '10px', color: '#cbd5e1' }}>© 2026 Kisan Bandhu Industries Ltd.</p>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bill-container, .bill-container * { visibility: visible; }
          .bill-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
