import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { computeFarmAnalytics } from '../services/financialAnalytics';
import { 
  MessageCircle, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Calendar, 
  Sparkles, 
  Phone, 
  CheckSquare, 
  Square, 
  TrendingUp, 
  Milk, 
  Users, 
  Warehouse, 
  CloudSun 
} from 'lucide-react';

export default function WhatsAppDigestModal({ isOpen, onClose }) {
  const { data } = useFarm();
  const currency = data?.farmInfo?.currency || '₹';
  const farmName = data?.farmInfo?.name || 'Samagra Organic Farm';
  const ownerName = data?.farmInfo?.owner || 'Farm Owner';

  const todayStr = new Date().toISOString().split('T')[0];
  const [digestDate, setDigestDate] = useState(todayStr);
  const [phoneNo, setPhoneNo] = useState('');
  const [copied, setCopied] = useState(false);

  // Digest Section Toggles
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeDairy, setIncludeDairy] = useState(true);
  const [includeLabor, setIncludeLabor] = useState(true);
  const [includeInventory, setIncludeInventory] = useState(true);

  if (!isOpen) return null;

  // Compute Single-Day / Period Metrics for Selected Date
  const analytics = computeFarmAnalytics(data, 'CUSTOM', digestDate, digestDate);

  // 1. Dairy Details for Date
  const milkLogsForDate = (data?.dairyMilkLogs || []).filter(l => l.date === digestDate);
  const totalLitersDate = milkLogsForDate.reduce((acc, curr) => acc + Number(curr.liters || 0), 0);
  const milkIncomeDate = milkLogsForDate.reduce((acc, curr) => acc + Number(curr.totalAmount || (Number(curr.liters || 0) * 50) || 0), 0);

  // 2. Labor Details for Date
  const attForDate = (data?.attendance || []).filter(a => a.date === digestDate);
  const totalWagesDate = attForDate.reduce((acc, curr) => acc + Number(curr.wageEarned || 0), 0);

  // 3. Low Stock Items
  const lowStockItems = (data?.inventoryItems || []).filter(i => (Number(i.quantity) || 0) <= (Number(i.minAlertQuantity) || 0));

  // Build Formatted WhatsApp Message
  const generateDigestText = () => {
    let text = `📱 *${farmName.toUpperCase()} - DAILY EXECUTIVE DIGEST*\n`;
    text += `👤 *Owner:* ${ownerName} | 🗓️ *Date:* ${digestDate}\n`;
    text += `───────────────\n\n`;

    if (includeFinancials) {
      text += `📊 *FINANCIAL SUMMARY (Today):*\n`;
      text += `  • 💵 Gross Revenue: ${currency}${(Number(analytics.totalIncome) || 0).toLocaleString('en-IN')}\n`;
      text += `  • 💸 Gross Expenses: ${currency}${(Number(analytics.totalExpenses) || 0).toLocaleString('en-IN')}\n`;
      text += `  • 💰 Net Profit / Loss: ${currency}${(Number(analytics.netProfit) || 0).toLocaleString('en-IN')}\n\n`;
    }

    if (includeDairy) {
      text += `🥛 *DAIRY & MILK ENTERPRISE:*\n`;
      text += `  • Total Yield Today: ${totalLitersDate} Liters\n`;
      text += `  • Today's Milk Revenue: ${currency}${(Number(milkIncomeDate) || 0).toLocaleString('en-IN')}\n\n`;
    }

    if (includeLabor) {
      text += `👷 *WORKERS & FIELD LABOR:*\n`;
      text += `  • Active Laborers Present: ${attForDate.length} Workers\n`;
      text += `  • Wages Accrued Today: ${currency}${(Number(totalWagesDate) || 0).toLocaleString('en-IN')}\n\n`;
    }

    if (includeInventory && lowStockItems.length > 0) {
      text += `🚨 *LOW STOCK INPUT WARNINGS (${lowStockItems.length}):*\n`;
      lowStockItems.slice(0, 4).forEach(item => {
        text += `  • ⚠️ ${item.name}: ${item.quantity} ${item.unit} left (Alert Min: ${item.minAlertQuantity})\n`;
      });
      text += `\n`;
    }

    text += `Sent automatically via Samagra Farm Manager 3D.`;
    return text;
  };

  const digestText = generateDigestText();

  // Copy to Clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(digestText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Send via WhatsApp Deep Link
  const handleSendWhatsApp = () => {
    let rawPhone = phoneNo.replace(/[^0-9]/g, '');
    if (rawPhone.length === 10) rawPhone = '91' + rawPhone;

    const phoneParam = rawPhone.length >= 10 ? `phone=${rawPhone}&` : '';
    const encoded = encodeURIComponent(digestText);
    window.open(`https://api.whatsapp.com/send?${phoneParam}text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Daily WhatsApp Executive Digest</h3>
              <p className="text-xs text-slate-500">Generate 1-click formatted daily farm summary for management</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date & Phone Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Summary Date</label>
            <input
              type="date"
              value={digestDate}
              onChange={(e) => setDigestDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Recipient WhatsApp Phone (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Include Section Checkboxes */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Include Sections in Report:</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
              <input 
                type="checkbox" 
                checked={includeFinancials} 
                onChange={(e) => setIncludeFinancials(e.target.checked)} 
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Financial P&L</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
              <input 
                type="checkbox" 
                checked={includeDairy} 
                onChange={(e) => setIncludeDairy(e.target.checked)} 
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Dairy Milk Yield</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
              <input 
                type="checkbox" 
                checked={includeLabor} 
                onChange={(e) => setIncludeLabor(e.target.checked)} 
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Worker Attendance</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-slate-700">
              <input 
                type="checkbox" 
                checked={includeInventory} 
                onChange={(e) => setIncludeInventory(e.target.checked)} 
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Stock Reorder Warnings</span>
            </label>
          </div>
        </div>

        {/* Real-time Message Live Preview Container */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>WhatsApp Text Preview:</span>
            <button
              onClick={handleCopyText}
              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
          </div>

          <pre className="font-mono bg-slate-900 text-slate-200 p-4 rounded-2xl text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 border border-slate-800">
            {digestText}
          </pre>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
          >
            Close
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" /> Send via WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}
