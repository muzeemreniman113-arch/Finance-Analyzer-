/**
 * AuraFinance™ Data Processing Engine
 * Industrial-grade CSV and JSON Ingestion, Normalization & Validation
 */

const FinanceParser = (() => {
  'use strict';

  // Recognized column header patterns for automatic schema inference
  const HEADER_PATTERNS = {
    date: [/date/i, /timestamp/i, /time/i, /tx_date/i, /trans_date/i, /posted/i],
    description: [/description/i, /merchant/i, /payee/i, /name/i, /title/i, /memo/i, /details/i, /narrative/i],
    category: [/category/i, /cat/i, /classification/i, /group/i, /tag/i, /type_name/i],
    amount: [/amount/i, /value/i, /sum/i, /cost/i, /price/i, /total/i, /net/i],
    type: [/type/i, /tx_type/i, /inflow_outflow/i, /direction/i, /dr_cr/i, /flow/i],
    account: [/account/i, /acct/i, /wallet/i, /source/i, /bank/i, /card/i],
    notes: [/notes/i, /note/i, /comment/i, /remarks/i, /reference/i]
  };

  /**
   * Parse a raw CSV string with robust quote and delimiter handling
   */
  function parseCSV(csvString) {
    if (!csvString || typeof csvString !== 'string') {
      throw new Error('CSV input is empty or invalid.');
    }

    const lines = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;

    // Detect delimiter: comma, semicolon, or tab
    const firstLine = csvString.split(/\r\n|\n|\r/)[0] || '';
    let delimiter = ',';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semiCount = (firstLine.match(/;/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';
    else if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';

    const text = csvString.trim();
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++; // Skip \n in \r\n
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    // Push trailing cell if present
    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        lines.push(currentRow);
      }
    }

    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }

    const headers = lines[0].map(h => h.replace(/^["']|["']$/g, '').trim());
    const rawRows = lines.slice(1);

    // Auto-map column indices
    const mapping = inferColumnMapping(headers);

    const diagnostics = {
      totalRows: rawRows.length,
      validRows: 0,
      skippedRows: 0,
      delimiterDetected: delimiter,
      mappedColumns: mapping,
      warnings: []
    };

    const transactions = [];

    rawRows.forEach((row, index) => {
      try {
        const tx = mapRowToTransaction(row, mapping, headers, index + 1);
        if (tx) {
          transactions.push(tx);
          diagnostics.validRows++;
        } else {
          diagnostics.skippedRows++;
        }
      } catch (err) {
        diagnostics.skippedRows++;
        diagnostics.warnings.push(`Row ${index + 2}: ${err.message}`);
      }
    });

    return { transactions, diagnostics, headers, rawRowsCount: rawRows.length };
  }

  /**
   * Determine matching standard column key for CSV headers
   */
  function inferColumnMapping(headers) {
    const mapping = {
      date: -1,
      description: -1,
      category: -1,
      amount: -1,
      type: -1,
      account: -1,
      notes: -1
    };

    headers.forEach((header, idx) => {
      const cleanHeader = header.toLowerCase().replace(/[^a-z0-9_]/g, '');
      for (const [key, patterns] of Object.entries(HEADER_PATTERNS)) {
        if (mapping[key] === -1) {
          for (const pattern of patterns) {
            if (pattern.test(cleanHeader)) {
              mapping[key] = idx;
              break;
            }
          }
        }
      }
    });

    return mapping;
  }

  /**
   * Map raw row into normalized Transaction structure
   */
  function mapRowToTransaction(row, mapping, headers, rowNumber) {
    if (row.length === 0 || row.every(val => !val)) return null;

    // Extract raw values or fallback to default indices
    const dateRaw = mapping.date !== -1 ? row[mapping.date] : (row[0] || '');
    const descRaw = mapping.description !== -1 ? row[mapping.description] : (row[1] || 'Unlabeled Transaction');
    const catRaw = mapping.category !== -1 ? row[mapping.category] : (row[2] || 'Uncategorized');
    const amtRaw = mapping.amount !== -1 ? row[mapping.amount] : (row[3] || '0');
    const typeRaw = mapping.type !== -1 ? row[mapping.type] : (row[4] || '');
    const acctRaw = mapping.account !== -1 ? row[mapping.account] : (row[5] || 'General Account');
    const notesRaw = mapping.notes !== -1 ? row[mapping.notes] : (row[6] || '');

    // Parse and normalize amount
    const parsedAmount = parseAmount(amtRaw);
    if (isNaN(parsedAmount.numeric) || parsedAmount.numeric === 0) {
      // Allow zero only if description exists
      if (!descRaw) return null;
    }

    // Determine transaction direction (Income vs Expense)
    let determinedType = 'Expense';
    if (typeRaw) {
      const t = typeRaw.toLowerCase().trim();
      if (t.includes('inc') || t.includes('cr') || t.includes('credit') || t.includes('dep') || t.includes('inflow')) {
        determinedType = 'Income';
      } else if (t.includes('exp') || t.includes('dr') || t.includes('debit') || t.includes('outflow')) {
        determinedType = 'Expense';
      }
    } else {
      if (parsedAmount.isNegative) {
        determinedType = 'Expense';
      } else if (catRaw.toLowerCase().includes('income') || catRaw.toLowerCase().includes('salary')) {
        determinedType = 'Income';
      }
    }

    // Normalize Date to YYYY-MM-DD
    const normalizedDate = normalizeDate(dateRaw);

    return {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      date: normalizedDate,
      description: descRaw.trim() || 'Untitled Transaction',
      category: cleanCategory(catRaw),
      amount: Math.abs(parsedAmount.numeric),
      type: determinedType,
      account: acctRaw.trim() || 'Checking',
      notes: notesRaw.trim()
    };
  }

  /**
   * Parse currency strings with support for $, €, £, ¥, ₹, commas, parenthetical negatives
   */
  function parseAmount(val) {
    if (typeof val === 'number') {
      return { numeric: val, isNegative: val < 0 };
    }
    if (!val) return { numeric: 0, isNegative: false };

    let s = val.toString().trim();
    let isNegative = false;

    // Check parenthetical negative e.g. (150.00)
    if (s.startsWith('(') && s.endsWith(')')) {
      isNegative = true;
      s = s.slice(1, -1);
    }

    if (s.startsWith('-')) {
      isNegative = true;
      s = s.substring(1);
    }

    // Strip currency symbols and whitespace
    s = s.replace(/[\$\€\£\¥\₹\s]/g, '');

    // Handle European decimal formats e.g. 1.250,50
    if (/^\d{1,3}(\.\d{3})*,\d+$/.test(s)) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }

    const num = parseFloat(s);
    return {
      numeric: isNaN(num) ? 0 : (isNegative ? -Math.abs(num) : Math.abs(num)),
      isNegative: isNegative || num < 0
    };
  }

  /**
   * Normalize various date formats to ISO YYYY-MM-DD
   */
  function normalizeDate(rawDate) {
    if (!rawDate) return new Date().toISOString().split('T')[0];
    const s = rawDate.trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      return s.substring(0, 10);
    }

    // MM/DD/YYYY or DD/MM/YYYY
    const slashParts = s.split(/[\/\-\.]/);
    if (slashParts.length === 3) {
      let [p1, p2, p3] = slashParts;
      if (p3.length === 4) {
        // MM/DD/YYYY or DD/MM/YYYY
        let month = parseInt(p1, 10);
        let day = parseInt(p2, 10);
        const year = p3;
        if (month > 12 && day <= 12) {
          // It's DD/MM/YYYY
          const tmp = month;
          month = day;
          day = tmp;
        }
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      } else if (p1.length === 4) {
        return `${p1}-${String(p2).padStart(2, '0')}-${String(p3).padStart(2, '0')}`;
      }
    }

    const timestamp = Date.parse(s);
    if (!isNaN(timestamp)) {
      return new Date(timestamp).toISOString().split('T')[0];
    }

    return new Date().toISOString().split('T')[0];
  }

  /**
   * Format & standardize Category strings
   */
  function cleanCategory(cat) {
    if (!cat || typeof cat !== 'string') return 'Uncategorized';
    const c = cat.trim();
    if (!c) return 'Uncategorized';

    // Standardize title-case
    return c.charAt(0).toUpperCase() + c.slice(1);
  }

  /**
   * Parse a JSON input string or object
   */
  function parseJSON(jsonInput) {
    let data;
    if (typeof jsonInput === 'string') {
      try {
        data = JSON.parse(jsonInput);
      } catch (err) {
        throw new Error('Invalid JSON format: ' + err.message);
      }
    } else {
      data = jsonInput;
    }

    let records = [];
    let customBudgets = null;
    let metadata = {};

    if (Array.isArray(data)) {
      records = data;
    } else if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data.transactions)) records = data.transactions;
      else if (Array.isArray(data.records)) records = data.records;
      else if (Array.isArray(data.data)) records = data.data;
      else if (Array.isArray(data.items)) records = data.items;
      else {
        // Search first array property
        const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
        if (arrayKey) records = data[arrayKey];
      }

      if (data.budget_targets) customBudgets = data.budget_targets;
      metadata = {
        version: data.version || '1.0',
        generated_at: data.generated_at || new Date().toISOString(),
        currency: data.currency || 'USD'
      };
    }

    if (!records || records.length === 0) {
      throw new Error('No transactions array found in JSON payload.');
    }

    const transactions = [];
    const diagnostics = {
      totalRows: records.length,
      validRows: 0,
      skippedRows: 0,
      warnings: []
    };

    records.forEach((rec, idx) => {
      try {
        const amt = parseAmount(rec.amount || rec.value || rec.cost || 0);
        let txType = rec.type || (amt.isNegative ? 'Expense' : 'Expense');
        if (rec.category && rec.category.toLowerCase().includes('income')) {
          txType = 'Income';
        }

        const tx = {
          id: rec.id || ('tx-' + Math.random().toString(36).substring(2, 9)),
          date: normalizeDate(rec.date || rec.timestamp || rec.created_at),
          description: rec.description || rec.payee || rec.merchant || rec.title || 'Untitled Transaction',
          category: cleanCategory(rec.category || rec.cat || 'Uncategorized'),
          amount: Math.abs(amt.numeric),
          type: (txType.toLowerCase() === 'income') ? 'Income' : 'Expense',
          account: rec.account || rec.wallet || 'Checking',
          notes: rec.notes || rec.memo || ''
        };

        transactions.push(tx);
        diagnostics.validRows++;
      } catch (err) {
        diagnostics.skippedRows++;
        diagnostics.warnings.push(`Record ${idx}: ${err.message}`);
      }
    });

    return {
      transactions,
      diagnostics,
      customBudgets,
      metadata
    };
  }

  /**
   * Generate Synthetic Financial Dataset for Instant Simulation & Testing
   */
  function generateSyntheticDataset(count = 30) {
    const categories = [
      { name: 'Groceries', type: 'Expense', range: [35, 185], merchants: ['Whole Foods', 'Trader Joes', 'Costco', 'Safeway', 'Local Market'] },
      { name: 'Dining & Drinks', type: 'Expense', range: [12, 95], merchants: ['Blue Bottle', 'Starbucks', 'Sweetgreen', 'Chipotle', 'Bistro Roma', 'Olive Garden'] },
      { name: 'Utilities', type: 'Expense', range: [65, 180], merchants: ['Metropolitan Power', 'Water District', 'Verizon Wireless', 'City Gas Co.'] },
      { name: 'Housing & Rent', type: 'Expense', range: [1400, 2200], merchants: ['Downtown Apartments', 'Property Management LLC'] },
      { name: 'Transportation', type: 'Expense', range: [15, 65], merchants: ['Uber', 'Lyft', 'Shell Gas', 'Metro Transit', 'Chevron'] },
      { name: 'Entertainment', type: 'Expense', range: [12, 55], merchants: ['Netflix', 'Spotify', 'HBO Max', 'Cinema City', 'Steam Games'] },
      { name: 'Shopping', type: 'Expense', range: [25, 220], merchants: ['Amazon', 'Target', 'Apple Store', 'IKEA', 'Uniqlo'] },
      { name: 'Health & Medical', type: 'Expense', range: [25, 160], merchants: ['CVS Pharmacy', 'Walgreens', 'Equinox Gym', 'Dental Clinic'] },
      { name: 'Investment', type: 'Expense', range: [250, 750], merchants: ['Vanguard Index DCA', 'Fidelity S&P 500', 'Schwab Total Market'] }
    ];

    const incomeSources = [
      { name: 'Tech Enterprise Salary', range: [3200, 4800], acct: 'Checking' },
      { name: 'Freelance Design Retainer', range: [600, 1400], acct: 'Checking' },
      { name: 'Dividend Payout', range: [45, 180], acct: 'Investment' },
      { name: 'HYSA High Yield Interest', range: [35, 85], acct: 'Savings' }
    ];

    const accounts = ['Checking', 'Credit Card', 'Savings', 'Investment'];
    const transactions = [];

    const now = new Date();

    // Insert 2 guaranteed payrolls
    transactions.push({
      id: 'syn-inc-1',
      date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      description: 'Tech Enterprise Salary',
      category: 'Income',
      amount: 4500.00,
      type: 'Income',
      account: 'Checking',
      notes: 'Direct deposit base salary'
    });

    transactions.push({
      id: 'syn-inc-2',
      date: new Date(now.getFullYear(), now.getMonth(), 15).toISOString().split('T')[0],
      description: 'Tech Enterprise Salary',
      category: 'Income',
      amount: 4500.00,
      type: 'Income',
      account: 'Checking',
      notes: 'Mid-month payroll distribution'
    });

    // Generate random daily expense & income flow
    for (let i = 1; i <= count; i++) {
      const day = Math.max(1, Math.min(28, Math.floor(Math.random() * 27) + 1));
      const txDate = new Date(now.getFullYear(), now.getMonth(), day).toISOString().split('T')[0];

      if (Math.random() < 0.12) {
        // Additional income transaction
        const inc = incomeSources[Math.floor(Math.random() * incomeSources.length)];
        const amt = +(inc.range[0] + Math.random() * (inc.range[1] - inc.range[0])).toFixed(2);
        transactions.push({
          id: `syn-${i}`,
          date: txDate,
          description: inc.name,
          category: 'Income',
          amount: amt,
          type: 'Income',
          account: inc.acct,
          notes: 'Automated synthetic credit'
        });
      } else {
        // Expense transaction
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const merchant = cat.merchants[Math.floor(Math.random() * cat.merchants.length)];
        const amt = +(cat.range[0] + Math.random() * (cat.range[1] - cat.range[0])).toFixed(2);
        transactions.push({
          id: `syn-${i}`,
          date: txDate,
          description: merchant,
          category: cat.name,
          amount: amt,
          type: 'Expense',
          account: accounts[Math.floor(Math.random() * (accounts.length - 1))],
          notes: `Verified transaction at ${merchant}`
        });
      }
    }

    // Sort chronologically
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return transactions;
  }

  return {
    parseCSV,
    parseJSON,
    inferColumnMapping,
    parseAmount,
    normalizeDate,
    generateSyntheticDataset
  };
})();
