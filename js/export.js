/**
 * AuraFinance™ Data Export Engine
 * Export cleaned CSV, structured FinTech JSON, and Print-ready Financial Statements
 */

const FinanceExport = (() => {
  'use strict';

  /**
   * Export transactions to CSV format with UTF-8 BOM
   */
  function exportToCSV(transactions, filename = 'aurafinance_export.csv') {
    if (!transactions || transactions.length === 0) {
      throw new Error('No transactions available to export.');
    }

    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Account', 'Notes'];
    const rows = transactions.map(t => [
      escapeCSV(t.date),
      escapeCSV(t.description),
      escapeCSV(t.category),
      t.amount.toFixed(2),
      escapeCSV(t.type),
      escapeCSV(t.account),
      escapeCSV(t.notes || '')
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadBlob(csvContent, 'text/csv;charset=utf-8;', filename);
  }

  /**
   * Escape CSV cell values
   */
  function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s}"`;
    }
    return `"${s}"`;
  }

  /**
   * Export structured FinTech JSON file
   */
  function exportToJSON(transactions, budgets, currency = 'USD', filename = 'aurafinance_export.json') {
    const payload = {
      spec: 'AuraFinance-Standard-v2',
      exported_at: new Date().toISOString(),
      currency: currency,
      metadata: {
        total_records: transactions.length,
        generator: 'AuraFinance Industrial Data Studio'
      },
      budget_targets: budgets || {},
      transactions: transactions
    };

    const jsonString = JSON.stringify(payload, null, 2);
    downloadBlob(jsonString, 'application/json;charset=utf-8;', filename);
  }

  /**
   * Helper: Trigger browser download for a Blob
   */
  function downloadBlob(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Trigger print dialog for the financial report
   */
  function printFinancialStatement() {
    window.print();
  }

  return {
    exportToCSV,
    exportToJSON,
    printFinancialStatement
  };
})();
