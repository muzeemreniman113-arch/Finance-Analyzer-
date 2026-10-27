/**
 * AuraFinance™ Data Storage & Sample Datasets
 * LocalStorage state persistence and curated production demo datasets
 */

const FinanceStorage = (() => {
  'use strict';

  const STORAGE_KEYS = {
    TRANSACTIONS: 'aurafinance_tx_v2',
    BUDGETS: 'aurafinance_budgets_v2',
    CURRENCY: 'aurafinance_currency_v2',
    THEME: 'aurafinance_theme_v2'
  };

  // Sample Dataset 1: Personal Monthly Budget
  const SAMPLE_PERSONAL = [
    { id: 'tx-1', date: '2026-10-01', description: 'Acme Corp Monthly Salary', category: 'Income', amount: 5200.00, type: 'Income', account: 'Checking', notes: 'Primary payroll' },
    { id: 'tx-2', date: '2026-10-02', description: 'Whole Foods Market', category: 'Groceries', amount: 142.50, type: 'Expense', account: 'Credit Card', notes: 'Organic pantry restock' },
    { id: 'tx-3', date: '2026-10-03', description: 'Metropolitan Water & Electric', category: 'Utilities', amount: 118.20, type: 'Expense', account: 'Checking', notes: 'Monthly utility bill' },
    { id: 'tx-4', date: '2026-10-04', description: 'Blue Bottle Coffee Roasters', category: 'Dining & Drinks', amount: 14.75, type: 'Expense', account: 'Credit Card', notes: 'Espresso & treat' },
    { id: 'tx-5', date: '2026-10-05', description: 'Downtown Residences Lease', category: 'Housing & Rent', amount: 1850.00, type: 'Expense', account: 'Checking', notes: 'Monthly rent' },
    { id: 'tx-6', date: '2026-10-06', description: 'Shell Fuel Station', category: 'Transportation', amount: 54.30, type: 'Expense', account: 'Credit Card', notes: 'Commute gas' },
    { id: 'tx-7', date: '2026-10-07', description: 'Netflix Ultra HD Subscription', category: 'Entertainment', amount: 19.99, type: 'Expense', account: 'Credit Card', notes: 'Streaming service' },
    { id: 'tx-8', date: '2026-10-08', description: 'Spotify Family Music', category: 'Entertainment', amount: 16.99, type: 'Expense', account: 'Credit Card', notes: 'Music streaming' },
    { id: 'tx-9', date: '2026-10-09', description: 'Vanguard S&P 500 Index ETF', category: 'Investment', amount: 600.00, type: 'Expense', account: 'Checking', notes: 'Automated wealth investment' },
    { id: 'tx-10', date: '2026-10-10', description: 'Trader Joe\'s Grocery', category: 'Groceries', amount: 88.40, type: 'Expense', account: 'Credit Card', notes: 'Weekly produce' },
    { id: 'tx-11', date: '2026-10-12', description: 'CVS Pharmacy Health', category: 'Health & Medical', amount: 34.15, type: 'Expense', account: 'Credit Card', notes: 'Supplements' },
    { id: 'tx-12', date: '2026-10-13', description: 'Sweetgreen Salad', category: 'Dining & Drinks', amount: 21.50, type: 'Expense', account: 'Credit Card', notes: 'Work lunch' },
    { id: 'tx-13', date: '2026-10-14', description: 'Equinox Fitness Club', category: 'Health & Medical', amount: 165.00, type: 'Expense', account: 'Credit Card', notes: 'Monthly gym membership' },
    { id: 'tx-14', date: '2026-10-15', description: 'Quarterly ETF Dividends', category: 'Income', amount: 145.80, type: 'Income', account: 'Investment', notes: 'Dividend return' },
    { id: 'tx-15', date: '2026-10-16', description: 'Amazon Home Office Desk', category: 'Shopping', amount: 79.95, type: 'Expense', account: 'Credit Card', notes: 'Ergonomic mouse & pad' },
    { id: 'tx-16', date: '2026-10-17', description: 'Uber Airport Ride', category: 'Transportation', amount: 28.60, type: 'Expense', account: 'Credit Card', notes: 'Travel rideshare' },
    { id: 'tx-17', date: '2026-10-18', description: 'Target Home Goods', category: 'Shopping', amount: 64.20, type: 'Expense', account: 'Credit Card', notes: 'Cookware' },
    { id: 'tx-18', date: '2026-10-19', description: 'Olive Garden Bistro', category: 'Dining & Drinks', amount: 86.00, type: 'Expense', account: 'Credit Card', notes: 'Dinner with friends' },
    { id: 'tx-19', date: '2026-10-20', description: 'HYSA Accrued Interest', category: 'Income', amount: 48.25, type: 'Income', account: 'Savings', notes: 'High yield interest deposit' },
    { id: 'tx-20', date: '2026-10-21', description: 'Costco Wholesale Club', category: 'Groceries', amount: 215.80, type: 'Expense', account: 'Credit Card', notes: 'Bulk pantry provisions' },
    { id: 'tx-21', date: '2026-10-22', description: 'Apple iCloud Premier', category: 'Software & Tech', amount: 12.99, type: 'Expense', account: 'Credit Card', notes: 'Cloud backup' },
    { id: 'tx-22', date: '2026-10-23', description: 'Verizon Wireless Unlimited', category: 'Utilities', amount: 85.00, type: 'Expense', account: 'Checking', notes: '5G Mobile plan' },
    { id: 'tx-23', date: '2026-10-24', description: 'Delta Air Lines Flight', category: 'Travel', amount: 340.00, type: 'Expense', account: 'Credit Card', notes: 'Flight ticket' },
    { id: 'tx-24', date: '2026-10-25', description: 'Freelance UI/UX Advisory', category: 'Income', amount: 750.00, type: 'Income', account: 'Checking', notes: 'Consulting client payment' },
    { id: 'tx-25', date: '2026-10-26', description: 'Local Farmer\'s Market', category: 'Groceries', amount: 45.00, type: 'Expense', account: 'Cash', notes: 'Fresh honey and artisanal bread' },
    { id: 'tx-26', date: '2026-10-27', description: 'Home Depot Hardware', category: 'Housing & Maintenance', amount: 92.40, type: 'Expense', account: 'Credit Card', notes: 'LED lighting fixtures' }
  ];

  // Sample Dataset 2: Tech Freelancer / Consultant
  const SAMPLE_FREELANCER = [
    { id: 'fl-1', date: '2026-10-02', description: 'FinTech App Advisory Retainer', category: 'Income', amount: 4500.00, type: 'Income', account: 'Business Checking', notes: 'Advisory retainer' },
    { id: 'fl-2', date: '2026-10-04', description: 'WeWork Private Office', category: 'Housing & Office', amount: 550.00, type: 'Expense', account: 'Credit Card', notes: 'Coworking desk' },
    { id: 'fl-3', date: '2026-10-06', description: 'Amazon Web Services Cloud', category: 'Software & Tech', amount: 165.20, type: 'Expense', account: 'Credit Card', notes: 'Server infrastructure' },
    { id: 'fl-4', date: '2026-10-08', description: 'Figma Organization Seat', category: 'Software & Tech', amount: 45.00, type: 'Expense', account: 'Credit Card', notes: 'Design tool' },
    { id: 'fl-5', date: '2026-10-12', description: 'Design Sprint Project Delivery', category: 'Income', amount: 3800.00, type: 'Income', account: 'Business Checking', notes: 'Milestone payment' },
    { id: 'fl-6', date: '2026-10-14', description: 'Blue Bottle Client Coffee', category: 'Dining & Drinks', amount: 22.50, type: 'Expense', account: 'Credit Card', notes: 'Client kickoff meeting' },
    { id: 'fl-7', date: '2026-10-15', description: 'Quarterly Federal Estimated Tax', category: 'Taxes', amount: 1850.00, type: 'Expense', account: 'Business Checking', notes: 'Quarterly tax payment' },
    { id: 'fl-8', date: '2026-10-18', description: 'Hardware Upgrade - 4K Monitor', category: 'Equipment', amount: 549.99, type: 'Expense', account: 'Credit Card', notes: 'Desk monitor' },
    { id: 'fl-9', date: '2026-10-21', description: 'Google Workspace Enterprise', category: 'Software & Tech', amount: 28.00, type: 'Expense', account: 'Credit Card', notes: 'Business email & docs' },
    { id: 'fl-10', date: '2026-10-23', description: 'GitHub Copilot Enterprise', category: 'Software & Tech', amount: 19.00, type: 'Expense', account: 'Credit Card', notes: 'AI dev tooling' },
    { id: 'fl-11', date: '2026-10-25', description: 'Brand Identity Design Kickoff', category: 'Income', amount: 2600.00, type: 'Income', account: 'Business Checking', notes: 'New client deposit' }
  ];

  // Default Budget Targets
  const DEFAULT_BUDGETS = {
    'Housing & Rent': 1900.00,
    'Groceries': 550.00,
    'Dining & Drinks': 250.00,
    'Utilities': 220.00,
    'Transportation': 150.00,
    'Entertainment': 100.00,
    'Shopping': 200.00,
    'Health & Medical': 220.00,
    'Investment': 700.00,
    'Software & Tech': 60.00,
    'Travel': 400.00
  };

  /**
   * Save transactions to LocalStorage
   */
  function saveTransactions(transactions) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Could not save transactions to localStorage', e);
    }
  }

  /**
   * Load transactions from LocalStorage or default sample
   */
  function loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_PERSONAL));
  }

  /**
   * Save Budget targets
   */
  function saveBudgets(budgets) {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.warn('Could not save budgets to localStorage', e);
    }
  }

  /**
   * Load Budget targets
   */
  function loadBudgets() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error loading budgets', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_BUDGETS));
  }

  /**
   * Currency preference
   */
  function saveCurrency(currency) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
    } catch (e) {}
  }

  function loadCurrency() {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'USD';
    } catch (e) {
      return 'USD';
    }
  }

  return {
    saveTransactions,
    loadTransactions,
    saveBudgets,
    loadBudgets,
    saveCurrency,
    loadCurrency,
    SAMPLE_PERSONAL,
    SAMPLE_FREELANCER,
    DEFAULT_BUDGETS
  };
})();
