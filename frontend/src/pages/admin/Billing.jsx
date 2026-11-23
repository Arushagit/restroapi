import { useState, useEffect } from 'react';
import { Receipt, DollarSign, Printer, CheckCircle, Search, CreditCard, QrCode, Banknote, X, RefreshCw } from 'lucide-react';
import { getOrders } from '../../api/orders';
import { getPayments, createPayment, getInvoice } from '../../api/billing';
import { useToast } from '../../components/ui/Toast';

export default function BillingManagement() {
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bill Settlement Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [discount, setDiscount] = useState('0.00');
  const [amountPaid, setAmountPaid] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Printable Invoice Modal
  const [invoiceData, setInvoiceData] = useState(null);

  const toast = useToast();

  const loadData = async () => {
    try {
      const [ordRes, payRes] = await Promise.all([
        getOrders(),
        getPayments()
      ]);

      const paidOrderIds = new Set((payRes.data || []).map(p => p.order));
      // Orders ready or completed or preparing that haven't been settled
      const unbilled = (ordRes.data || []).filter(o => !paidOrderIds.has(o.id) && o.status !== 'cancelled');

      setUnpaidOrders(unbilled);
      setPayments(payRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load billing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openSettleModal = (order) => {
    setSelectedOrder(order);
    setPaymentMethod('upi');
    setDiscount('0.00');
    setAmountPaid(parseFloat(order.total_amount).toFixed(2));
  };

  const calculateFinalTotal = () => {
    if (!selectedOrder) return 0;
    const sub = parseFloat(selectedOrder.subtotal) || 0;
    const tax = parseFloat(selectedOrder.tax_amount) || 0;
    const disc = parseFloat(discount) || 0;
    return Math.max(0, sub + tax - disc);
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    const total = calculateFinalTotal();
    return Math.max(0, paid - total);
  };

  const handleSettlePayment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      const payload = {
        order: selectedOrder.id,
        payment_method: paymentMethod,
        discount_amount: parseFloat(discount) || 0,
        amount_paid: parseFloat(amountPaid) || calculateFinalTotal(),
      };

      const res = await createPayment(payload);
      toast.success(`Payment recorded! Invoice ${res.data.invoice_number} generated.`);
      setSelectedOrder(null);
      await loadData();
      // Auto open printable invoice
      handleViewInvoice(res.data.id);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.order?.[0] || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewInvoice = async (paymentId) => {
    try {
      const res = await getInvoice(paymentId);
      setInvoiceData(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch invoice.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-charcoal">Cashier & Invoicing Station</h2>
          <p className="text-xs text-gray-500">Settle guest checks, record cash/UPI payments, and print GST invoices</p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-primary text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <RefreshCw size={14} /> Refresh Billing
        </button>
      </div>

      {/* Unpaid / Ready Orders Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
          <Receipt size={16} className="text-primary" />
          Pending Checkout Orders ({unpaidOrders.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unpaidOrders.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-6 text-center text-gray-400 text-xs border border-gray-100">
              No pending orders waiting for payment settlement.
            </div>
          ) : (
            unpaidOrders.map(ord => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-5 border border-orange-200 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-black text-charcoal text-base">Order #{ord.id}</span>
                    <p className="text-xs text-gray-500 font-medium">Guest: {ord.customer_name}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-orange-50 text-orange-700 border border-orange-200">
                    {ord.order_type.replace('_', ' ')}
                    {ord.table_number && ` • Table ${ord.table_number}`}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                  {ord.items?.map(it => (
                    <div key={it.id} className="flex justify-between">
                      <span>{it.food_item_name} ×{it.quantity}</span>
                      <span className="font-semibold text-charcoal">₹{parseFloat(it.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Bill Total</span>
                    <span className="text-lg font-black text-primary">₹{parseFloat(ord.total_amount).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => openSettleModal(ord)}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    Settle & Bill
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settle Bill Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-charcoal">Generate Bill: Order #{selectedOrder.id}</h3>
                <span className="text-xs text-gray-400">Guest: {selectedOrder.customer_name}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-charcoal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSettlePayment} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI QR', icon: QrCode },
                    { id: 'cash', label: 'Cash', icon: Banknote },
                    { id: 'card', label: 'Card / POS', icon: CreditCard },
                  ].map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${paymentMethod === m.id ? 'border-primary bg-orange-50 text-primary font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-orange-200'}`}
                    >
                      <m.icon size={18} className="mb-1" />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount Input */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-bold"
                />
              </div>

              {/* Amount Paid (for cash change calculation) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount Tendered / Paid (₹) *</label>
                <input
                  type="number"
                  min={calculateFinalTotal()}
                  step="0.01"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-bold text-charcoal"
                />
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 border border-gray-100">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST (5%):</span>
                  <span>₹{parseFloat(selectedOrder.tax_amount).toFixed(2)}</span>
                </div>
                {parseFloat(discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Applied:</span>
                    <span>-₹{parseFloat(discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal font-black text-sm pt-2 border-t border-gray-200">
                  <span>Final Bill:</span>
                  <span className="text-primary text-base">₹{calculateFinalTotal().toFixed(2)}</span>
                </div>
                {paymentMethod === 'cash' && (
                  <div className="flex justify-between text-gray-700 font-bold pt-1">
                    <span>Change Returned:</span>
                    <span className="text-green-600 font-black">₹{calculateChange().toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={15} />
                  {submitting ? 'Generating Invoice...' : 'Record Payment & Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {invoiceData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Action Bar */}
            <div className="flex items-center justify-between no-print border-b border-gray-100 pb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Official Invoice Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-dark transition-colors"
                >
                  <Printer size={14} /> Print Receipt
                </button>
                <button onClick={() => setInvoiceData(null)} className="p-1.5 text-gray-400 hover:text-charcoal rounded-lg">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div id="invoice-sheet" className="space-y-6 text-charcoal">
              {/* Header */}
              <div className="text-center space-y-1 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-black tracking-tight text-charcoal">RESTRO<span className="text-primary">FLOW</span></h2>
                <p className="text-xs font-bold text-gray-600">{invoiceData.restaurant?.tagline}</p>
                <p className="text-[11px] text-gray-400">{invoiceData.restaurant?.address}</p>
                <p className="text-[11px] text-gray-400">GSTIN: {invoiceData.restaurant?.gstin} • Tel: {invoiceData.restaurant?.phone}</p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 text-xs border-b border-gray-200 pb-4 gap-2">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Invoice Number</span>
                  <span className="font-bold text-charcoal">{invoiceData.invoice_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date & Time</span>
                  <span className="font-medium text-charcoal">{new Date(invoiceData.date).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Guest Name</span>
                  <span className="font-medium text-charcoal">{invoiceData.order?.customer_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Payment Method</span>
                  <span className="font-bold uppercase text-emerald-700">{invoiceData.payment_method}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-xs text-left">
                <thead className="border-b border-gray-200 text-gray-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoiceData.order?.items?.map(it => (
                    <tr key={it.id}>
                      <td className="py-2 font-medium">{it.food_item_name}</td>
                      <td className="py-2 text-center text-gray-500">{it.quantity}</td>
                      <td className="py-2 text-right text-gray-500">₹{parseFloat(it.unit_price).toFixed(2)}</td>
                      <td className="py-2 text-right font-bold">₹{parseFloat(it.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Summary */}
              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>₹{parseFloat(invoiceData.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST ({invoiceData.tax_rate}%):</span>
                  <span>₹{parseFloat(invoiceData.tax_amount).toFixed(2)}</span>
                </div>
                {parseFloat(invoiceData.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>-₹{parseFloat(invoiceData.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-charcoal pt-2 border-t border-gray-300">
                  <span>Net Payable:</span>
                  <span>₹{parseFloat(invoiceData.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[11px] pt-1">
                  <span>Amount Paid:</span>
                  <span>₹{parseFloat(invoiceData.amount_paid).toFixed(2)}</span>
                </div>
                {parseFloat(invoiceData.change_amount) > 0 && (
                  <div className="flex justify-between text-green-700 text-[11px] font-bold">
                    <span>Change Returned:</span>
                    <span>₹{parseFloat(invoiceData.change_amount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="text-center text-[10px] text-gray-400 border-t border-dashed border-gray-300 pt-4 space-y-1">
                <p className="font-semibold text-gray-600">Thank you for dining with RESTROFLOW!</p>
                <p>Have a wonderful culinary day • GST Inclusive Invoice</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Settled Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-charcoal text-base">Settled Billing History</h3>
          <span className="text-xs text-gray-400">{payments.length} Payments Recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-5">Invoice #</th>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Method</th>
                <th className="py-3 px-5">Subtotal</th>
                <th className="py-3 px-5">Tax</th>
                <th className="py-3 px-5">Total</th>
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">No payment records yet.</td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 font-bold text-charcoal">{p.invoice_number}</td>
                    <td className="py-3 px-5 text-gray-700">Order #{p.order}</td>
                    <td className="py-3 px-5 uppercase text-gray-600 font-bold text-[10px]">{p.payment_method}</td>
                    <td className="py-3 px-5 text-gray-500">₹{parseFloat(p.subtotal).toFixed(2)}</td>
                    <td className="py-3 px-5 text-gray-500">₹{parseFloat(p.tax_amount).toFixed(2)}</td>
                    <td className="py-3 px-5 font-black text-charcoal">₹{parseFloat(p.total_amount).toFixed(2)}</td>
                    <td className="py-3 px-5 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => handleViewInvoice(p.id)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                        title="Print Invoice"
                      >
                        <Printer size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

