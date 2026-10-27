/**
 * AuraFinance™ Application Controller
 * High-performance state coordination, event bindings, and UI updates
 */

const FinanceApp = (() => {
  'use strict';

  // Application State
  const state = {
    transactions: [],
    budgets: {},
    currency: 'USD',
    currencySymbol: '$',
    activeTab: 'dashboard',
    searchQuery: '',
    categoryFilter: 'ALL',
    typeFilter: 'ALL',
    accountFilter: 'ALL',
    dateFilter: 'ALL',
    sortColumn: 'date',
    sortDirection: 'desc',
    currentPage: 1,
    pageSize: 15,
    selectedTxIds: new Set(),
    editingTxId: null,
    goals: [
      { id: 'g-1', title: 'Emergency Cushion (6 Months)', target: 15000, current: 8400, icon: 'shield' },
      { id: 'g-2', title: 'Index Fund DCA Investment', target: 10000, current: 6200, icon: 'trending-up' },
      { id: 'g-3', title: 'Workstation & Hardware Refresh', target: 2500, current: 1800, icon: 'monitor' }
    ]
  };

  const CURRENCY_SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
  };

  /**
   * Initialize App on DOM Ready
   */
  function init() {
    // Load persisted state
    state.transactions = FinanceStorage.loadTransactions();
    state.budgets = FinanceStorage.loadBudgets();
    state.currency = FinanceStorage.loadCurrency();
    state.currencySymbol = CURRENCY_SYMBOLS[state.currency] || '$';

    // Set currency selector value
    const currSelect = document.getElementById('currencySelect');
    if (currSelect) currSelect.value = state.currency;

    // Attach all event listeners
    bindEvents();

    // Populate category and account filter dropdowns
    populateFilterOptions();

    // Initial render
    renderAll();

    showToast('AuraFinance ready. Loaded ' + state.transactions.length + ' transactions.', 'success');
  }

  /**
   * Bind all DOM UI event handlers
   */
  function bindEvents() {
    // Currency selector
    const currSelect = document.getElementById('currencySelect');
    if (currSelect) {
      currSelect.addEventListener('change', (e) => {
        state.currency = e.target.value;
        state.currencySymbol = CURRENCY_SYMBOLS[state.currency] || '$';
        FinanceStorage.saveCurrency(state.currency);
        renderAll();
        showToast(`Currency changed to ${state.currency} (${state.currencySymbol})`, 'info');
      });
    }

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeBtn.setAttribute('title', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
        renderCharts();
        showToast(isDark ? 'Dark luxury mode enabled' : 'Default light theme restored', 'info');
      });
    }

    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // File Ingestion Dropzone & File Input
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseFileBtn');

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleIncomingFile(e.target.files[0]);
        }
      });
    }

    if (dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('drag-over');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleIncomingFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Sample Preset Chips
    const presetPersonal = document.getElementById('presetPersonal');
    if (presetPersonal) {
      presetPersonal.addEventListener('click', () => {
        state.transactions = JSON.parse(JSON.stringify(FinanceStorage.SAMPLE_PERSONAL));
        FinanceStorage.saveTransactions(state.transactions);
        populateFilterOptions();
        renderAll();
        showToast('Loaded Personal Budget 2026 dataset.', 'success');
      });
    }

    const presetFreelancer = document.getElementById('presetFreelancer');
    if (presetFreelancer) {
      presetFreelancer.addEventListener('click', () => {
        state.transactions = JSON.parse(JSON.stringify(FinanceStorage.SAMPLE_FREELANCER));
        FinanceStorage.saveTransactions(state.transactions);
        populateFilterOptions();
        renderAll();
        showToast('Loaded Tech Freelancer & Consultant dataset.', 'success');
      });
    }

    const presetGenerate = document.getElementById('presetGenerate');
    if (presetGenerate) {
      presetGenerate.addEventListener('click', () => {
        openSyntheticModal();
      });
    }

    // Table Search & Filters
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        state.currentPage = 1;
        renderTransactionsTable();
      });
    }

    const catFilter = document.getElementById('categoryFilter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        state.categoryFilter = e.target.value;
        state.currentPage = 1;
        renderTransactionsTable();
      });
    }

    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        state.typeFilter = e.target.value;
        state.currentPage = 1;
        renderTransactionsTable();
      });
    }

    const acctFilter = document.getElementById('accountFilter');
    if (acctFilter) {
      acctFilter.addEventListener('change', (e) => {
        state.accountFilter = e.target.value;
        state.currentPage = 1;
        renderTransactionsTable();
      });
    }

    // Date Range Presets
    const dateRangePills = document.querySelectorAll('.date-filter-pill');
    dateRangePills.forEach(pill => {
      pill.addEventListener('click', () => {
        dateRangePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.dateFilter = pill.getAttribute('data-range');
        state.currentPage = 1;
        renderTransactionsTable();
      });
    });

    // Table Header Sorting
    const sortableHeaders = document.querySelectorAll('th.sortable');
    sortableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (state.sortColumn === col) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortColumn = col;
          state.sortDirection = 'desc';
        }
        renderTransactionsTable();
      });
    });

    // Pagination buttons
    const prevPageBtn = document.getElementById('prevPageBtn');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
          state.currentPage--;
          renderTransactionsTable();
        }
      });
    }

    const nextPageBtn = document.getElementById('nextPageBtn');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        const totalFiltered = getFilteredTransactions().length;
        const maxPages = Math.ceil(totalFiltered / state.pageSize) || 1;
        if (state.currentPage < maxPages) {
          state.currentPage++;
          renderTransactionsTable();
        }
      });
    }

    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        state.pageSize = parseInt(e.target.value, 10);
        state.currentPage = 1;
        renderTransactionsTable();
      });
    }

    // Select All Checkbox
    const selectAllCheckbox = document.getElementById('selectAllTx');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const visibleRows = getPaginatedTransactions();
        if (e.target.checked) {
          visibleRows.forEach(tx => state.selectedTxIds.add(tx.id));
        } else {
          visibleRows.forEach(tx => state.selectedTxIds.delete(tx.id));
        }
        updateBulkDeleteButton();
        renderTransactionsTable(false);
      });
    }

    // Bulk Delete
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', () => {
        if (state.selectedTxIds.size === 0) return;
        if (confirm(`Delete ${state.selectedTxIds.size} selected transaction(s)?`)) {
          state.transactions = state.transactions.filter(t => !state.selectedTxIds.has(t.id));
          state.selectedTxIds.clear();
          FinanceStorage.saveTransactions(state.transactions);
          populateFilterOptions();
          renderAll();
          showToast('Selected transactions deleted.', 'success');
        }
      });
    }

    // Add Transaction Modal Trigger
    const addTxBtn = document.getElementById('addTxBtn');
    if (addTxBtn) {
      addTxBtn.addEventListener('click', () => openTxModal());
    }

    const addTxTableBtn = document.getElementById('addTxTableBtn');
    if (addTxTableBtn) {
      addTxTableBtn.addEventListener('click', () => openTxModal());
    }

    // Modal Form Submit
    const txForm = document.getElementById('txForm');
    if (txForm) {
      txForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTxFromModal();
      });
    }

    // Close Modal Buttons
    const closeTxModalBtn = document.getElementById('closeTxModalBtn');
    const cancelTxModalBtn = document.getElementById('cancelTxModalBtn');
    if (closeTxModalBtn) closeTxModalBtn.addEventListener('click', closeTxModal);
    if (cancelTxModalBtn) cancelTxModalBtn.addEventListener('click', closeTxModal);

    // Export Hub Trigger & Modal
    const exportHubBtn = document.getElementById('exportHubBtn');
    const exportModal = document.getElementById('exportModal');
    const closeExportModalBtn = document.getElementById('closeExportModalBtn');

    if (exportHubBtn && exportModal) {
      exportHubBtn.addEventListener('click', () => exportModal.classList.add('open'));
    }
    if (closeExportModalBtn && exportModal) {
      closeExportModalBtn.addEventListener('click', () => exportModal.classList.remove('open'));
    }

    // Quick Export Actions
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        FinanceExport.exportToCSV(state.transactions, `Finance_Transactions_${formatDateFile(new Date())}.csv`);
        showToast('Exported CSV successfully.', 'success');
        if (exportModal) exportModal.classList.remove('open');
      });
    }

    const exportJsonBtn = document.getElementById('exportJsonBtn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        FinanceExport.exportToJSON(state.transactions, state.budgets, state.currency, `Finance_Data_${formatDateFile(new Date())}.json`);
        showToast('Exported JSON successfully.', 'success');
        if (exportModal) exportModal.classList.remove('open');
      });
    }

    const printReportBtn = document.getElementById('printReportBtn');
    if (printReportBtn) {
      printReportBtn.addEventListener('click', () => {
        if (exportModal) exportModal.classList.remove('open');
        FinanceExport.printFinancialStatement();
      });
    }

    // Reset Data Trigger
    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        if (confirm('Reset to the default sample dataset? Any unsaved edits will be replaced.')) {
          state.transactions = JSON.parse(JSON.stringify(FinanceStorage.SAMPLE_PERSONAL));
          state.budgets = JSON.parse(JSON.stringify(FinanceStorage.DEFAULT_BUDGETS));
          FinanceStorage.saveTransactions(state.transactions);
          FinanceStorage.saveBudgets(state.budgets);
          populateFilterOptions();
          renderAll();
          showToast('Dataset reset to default.', 'info');
        }
      });
    }

    // Auto-calculate suggested budget envelopes
    const autoBudgetBtn = document.getElementById('autoBudgetBtn');
    if (autoBudgetBtn) {
      autoBudgetBtn.addEventListener('click', () => {
        const breakdown = FinanceAnalytics.getCategoryBreakdown(state.transactions, 'Expense');
        const newBudgets = {};
        breakdown.items.forEach(item => {
          // Set suggested budget to 115% of current spend, rounded to nearest 50
          const suggested = Math.ceil((item.amount * 1.15) / 50) * 50;
          newBudgets[item.name] = Math.max(50, suggested);
        });
        state.budgets = newBudgets;
        FinanceStorage.saveBudgets(state.budgets);
        renderBudgets();
        showToast('Calculated smart budget envelopes based on historical data.', 'success');
      });
    }

    // Add Category Budget Envelope
    const addBudgetBtn = document.getElementById('addBudgetBtn');
    if (addBudgetBtn) {
      addBudgetBtn.addEventListener('click', () => {
        const catName = prompt('Enter category name for new budget envelope:');
        if (catName && catName.trim()) {
          const limitStr = prompt(`Enter monthly budget target for "${catName.trim()}":`, '300');
          const limit = parseFloat(limitStr) || 300;
          state.budgets[catName.trim()] = limit;
          FinanceStorage.saveBudgets(state.budgets);
          renderBudgets();
          showToast(`Budget envelope added for ${catName.trim()}`, 'success');
        }
      });
    }

    // Synthetic Data Generator Modal controls
    const closeSyntheticModalBtn = document.getElementById('closeSyntheticModalBtn');
    const cancelSyntheticBtn = document.getElementById('cancelSyntheticBtn');
    const generateSyntheticBtn = document.getElementById('generateSyntheticBtn');
    const syntheticSlider = document.getElementById('syntheticRowCount');
    const syntheticCountDisplay = document.getElementById('syntheticCountDisplay');

    if (syntheticSlider && syntheticCountDisplay) {
      syntheticSlider.addEventListener('input', (e) => {
        syntheticCountDisplay.textContent = e.target.value;
      });
    }

    if (closeSyntheticModalBtn) closeSyntheticModalBtn.addEventListener('click', closeSyntheticModal);
    if (cancelSyntheticBtn) cancelSyntheticBtn.addEventListener('click', closeSyntheticModal);

    if (generateSyntheticBtn) {
      generateSyntheticBtn.addEventListener('click', () => {
        const count = parseInt(syntheticSlider ? syntheticSlider.value : 35, 10);
        const syntheticData = FinanceParser.generateSyntheticDataset(count);
        state.transactions = syntheticData;
        FinanceStorage.saveTransactions(state.transactions);
        closeSyntheticModal();
        populateFilterOptions();
        renderAll();
        showToast(`Generated & loaded ${syntheticData.length} synthetic records.`, 'success');
      });
    }

    // Copy JSON / CSV Buttons in Data Studio
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    if (copyJsonBtn) {
      copyJsonBtn.addEventListener('click', () => {
        const jsonText = JSON.stringify(state.transactions, null, 2);
        navigator.clipboard.writeText(jsonText).then(() => {
          showToast('JSON copied to clipboard.', 'success');
        }).catch(() => {
          showToast('Failed to copy. Please manually select and copy.', 'warning');
        });
      });
    }

    const copyCsvBtn = document.getElementById('copyCsvBtn');
    if (copyCsvBtn) {
      copyCsvBtn.addEventListener('click', () => {
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Account', 'Notes'];
        const rows = state.transactions.map(t => [
          t.date,
          `"${t.description.replace(/"/g, '""')}"`,
          `"${t.category.replace(/"/g, '""')}"`,
          t.amount.toFixed(2),
          t.type,
          `"${t.account.replace(/"/g, '""')}"`,
          `"${(t.notes || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        navigator.clipboard.writeText(csvContent).then(() => {
          showToast('CSV copied to clipboard.', 'success');
        }).catch(() => {
          showToast('Failed to copy CSV.', 'warning');
        });
      });
    }

    // Keyboard support: Escape closes modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeTxModal();
        closeSyntheticModal();
        if (exportModal) exportModal.classList.remove('open');
      }
    });

    // Window resize debounced re-render of canvas charts
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderCharts();
      }, 150);
    });
  }

  /**
   * Handle incoming dropped or selected CSV/JSON file
   */
  function handleIncomingFile(file) {
    if (!file) return;

    const fileStatusText = document.getElementById('fileStatusText');
    const fileStatusBadge = document.getElementById('fileStatusBadge');
    if (fileStatusText) fileStatusText.textContent = `Processing ${file.name}...`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const fileNameLower = file.name.toLowerCase();

      try {
        let result;
        if (fileNameLower.endsWith('.json') || content.trim().startsWith('{') || content.trim().startsWith('[')) {
          // JSON Parse
          result = FinanceParser.parseJSON(content);
          if (result.customBudgets) {
            state.budgets = { ...state.budgets, ...result.customBudgets };
            FinanceStorage.saveBudgets(state.budgets);
          }
          if (result.metadata && result.metadata.currency) {
            state.currency = result.metadata.currency;
            state.currencySymbol = CURRENCY_SYMBOLS[state.currency] || '$';
            const currSelect = document.getElementById('currencySelect');
            if (currSelect) currSelect.value = state.currency;
          }
        } else {
          // CSV Parse
          result = FinanceParser.parseCSV(content);
        }

        if (!result.transactions || result.transactions.length === 0) {
          throw new Error('No valid financial records could be parsed from this file.');
        }

        state.transactions = result.transactions;
        FinanceStorage.saveTransactions(state.transactions);
        state.selectedTxIds.clear();
        state.currentPage = 1;

        populateFilterOptions();
        renderAll();

        if (fileStatusText) {
          fileStatusText.textContent = `Active File: ${file.name} (${result.transactions.length} rows processed)`;
        }
        if (fileStatusBadge) {
          fileStatusBadge.textContent = 'Active File';
          fileStatusBadge.className = 'badge-tag positive';
        }

        showToast(`Successfully imported ${result.transactions.length} transactions from ${file.name}!`, 'success');
      } catch (err) {
        if (fileStatusText) fileStatusText.textContent = `Parse Error: ${err.message}`;
        if (fileStatusBadge) {
          fileStatusBadge.textContent = 'Error';
          fileStatusBadge.className = 'badge-tag negative';
        }
        showToast(`Ingestion Error: ${err.message}`, 'warning');
      }
    };

    reader.onerror = () => {
      showToast('Error reading file from disk.', 'warning');
    };

    reader.readAsText(file);
  }

  /**
   * Switch Active Tab
   */
  function switchTab(tabId) {
    state.activeTab = tabId;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      if (pane.id === `pane-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    if (tabId === 'dashboard') {
      setTimeout(renderCharts, 50);
    } else if (tabId === 'transactions') {
      renderTransactionsTable();
    } else if (tabId === 'budgets') {
      renderBudgets();
    } else if (tabId === 'insights') {
      renderInsights();
    } else if (tabId === 'datastudio') {
      renderDataStudio();
    } else if (tabId === 'goals') {
      renderGoals();
    }
  }

  /**
   * Render All Panels & Views
   */
  function renderAll() {
    renderKPIs();
    renderCharts();
    renderTransactionsTable();
    renderBudgets();
    renderInsights();
    renderDataStudio();
    renderGoals();
  }

  /**
   * Render Top KPI Cards
   */
  function renderKPIs() {
    const metrics = FinanceAnalytics.calculateMetrics(state.transactions);

    const incomeEl = document.getElementById('kpiIncome');
    const expenseEl = document.getElementById('kpiExpense');
    const savingsEl = document.getElementById('kpiSavings');
    const rateEl = document.getElementById('kpiRate');
    const healthEl = document.getElementById('kpiHealth');

    if (incomeEl) incomeEl.textContent = formatCurrency(metrics.totalIncome);
    if (expenseEl) expenseEl.textContent = formatCurrency(metrics.totalExpenses);

    if (savingsEl) {
      savingsEl.textContent = formatCurrency(metrics.netSavings);
      savingsEl.style.color = metrics.netSavings >= 0 ? 'var(--olive-700)' : 'var(--color-expense)';
    }

    if (rateEl) rateEl.textContent = `${metrics.savingsRate.toFixed(1)}%`;

    if (healthEl) {
      healthEl.textContent = `${metrics.healthScore}/100`;
      const healthSub = document.getElementById('kpiHealthSub');
      if (healthSub) {
        healthSub.innerHTML = `<span class="badge-tag ${metrics.healthScore >= 70 ? 'positive' : 'neutral'}">Grade: ${metrics.healthGrade}</span>`;
      }
    }

    const txCountBadge = document.getElementById('totalTxCountBadge');
    if (txCountBadge) txCountBadge.textContent = `${metrics.transactionCount} Records`;
  }

  /**
   * Render All Canvas Visualizations
   */
  function renderCharts() {
    const timelineData = FinanceAnalytics.getTimelineCashFlow(state.transactions);
    const categoryData = FinanceAnalytics.getCategoryBreakdown(state.transactions, 'Expense');
    const velocityData = FinanceAnalytics.getSpendingVelocity(state.transactions);

    const cashFlowCanvas = document.getElementById('cashFlowChart');
    if (cashFlowCanvas) {
      FinanceCharts.renderCashFlowChart(cashFlowCanvas, timelineData, state.currencySymbol);
    }

    const categoryDonutCanvas = document.getElementById('categoryDonutChart');
    if (categoryDonutCanvas) {
      FinanceCharts.renderCategoryDonut(categoryDonutCanvas, categoryData, state.currencySymbol);
    }

    const monthlyBarCanvas = document.getElementById('monthlyBarChart');
    if (monthlyBarCanvas) {
      FinanceCharts.renderIncomeVsExpenseBar(monthlyBarCanvas, timelineData, state.currencySymbol);
    }

    const velocityCanvas = document.getElementById('velocityChart');
    if (velocityCanvas) {
      FinanceCharts.renderSpendingVelocityBar(velocityCanvas, velocityData, state.currencySymbol);
    }
  }

  /**
   * Filter Transactions based on current search and filter criteria
   */
  function getFilteredTransactions() {
    return state.transactions.filter(tx => {
      // Search
      if (state.searchQuery) {
        const q = state.searchQuery;
        const matchDesc = (tx.description || '').toLowerCase().includes(q);
        const matchCat = (tx.category || '').toLowerCase().includes(q);
        const matchAcct = (tx.account || '').toLowerCase().includes(q);
        const matchNotes = (tx.notes || '').toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchAcct && !matchNotes) return false;
      }

      // Category
      if (state.categoryFilter !== 'ALL' && tx.category !== state.categoryFilter) {
        return false;
      }

      // Type
      if (state.typeFilter !== 'ALL' && tx.type !== state.typeFilter) {
        return false;
      }

      // Account
      if (state.accountFilter !== 'ALL' && tx.account !== state.accountFilter) {
        return false;
      }

      // Date Range Presets
      if (state.dateFilter !== 'ALL') {
        const txDate = new Date(tx.date);
        const now = new Date();
        if (state.dateFilter === '30D') {
          const past30 = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
          if (txDate < past30) return false;
        } else if (state.dateFilter === '90D') {
          const past90 = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
          if (txDate < past90) return false;
        } else if (state.dateFilter === 'MONTH') {
          if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Sort filtered transactions
   */
  function getSortedTransactions(filteredList) {
    const list = [...filteredList];
    const col = state.sortColumn;
    const dir = state.sortDirection === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      if (col === 'date') {
        return (new Date(a.date) - new Date(b.date)) * dir;
      } else if (col === 'amount') {
        return ((a.amount || 0) - (b.amount || 0)) * dir;
      } else if (col === 'description') {
        return (a.description || '').localeCompare(b.description || '') * dir;
      } else if (col === 'category') {
        return (a.category || '').localeCompare(b.category || '') * dir;
      }
      return 0;
    });

    return list;
  }

  /**
   * Paginate list
   */
  function getPaginatedTransactions() {
    const filtered = getFilteredTransactions();
    const sorted = getSortedTransactions(filtered);
    const start = (state.currentPage - 1) * state.pageSize;
    return sorted.slice(start, start + state.pageSize);
  }

  /**
   * Render Transactions Table
   */
  function renderTransactionsTable(rebuildRows = true) {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;

    const filtered = getFilteredTransactions();
    const paginated = getPaginatedTransactions();

    if (rebuildRows) {
      tbody.innerHTML = '';

      if (paginated.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
              No transactions match the current filter criteria.
            </td>
          </tr>
        `;
      } else {
        paginated.forEach(tx => {
          const tr = document.createElement('tr');
          const isSelected = state.selectedTxIds.has(tx.id);
          const isIncome = tx.type === 'Income';

          tr.innerHTML = `
            <td>
              <input type="checkbox" class="tx-row-select" data-id="${tx.id}" ${isSelected ? 'checked' : ''}>
            </td>
            <td style="font-family: var(--font-mono); font-size: 0.8rem; white-space: nowrap;">${tx.date}</td>
            <td>
              <strong>${escapeHtml(tx.description)}</strong>
              ${tx.notes ? `<div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(tx.notes)}</div>` : ''}
            </td>
            <td>
              <span class="category-tag">${escapeHtml(tx.category)}</span>
            </td>
            <td>
              <span class="account-badge">${escapeHtml(tx.account || 'Checking')}</span>
            </td>
            <td class="${isIncome ? 'amount-income' : 'amount-expense'}" style="text-align: right;">
              ${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}
            </td>
            <td>
              <span class="badge-tag ${isIncome ? 'positive' : 'neutral'}">${tx.type}</span>
            </td>
            <td style="text-align: right; white-space: nowrap;">
              <button class="row-actions-btn edit-tx-btn" data-id="${tx.id}" title="Edit Transaction">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="row-actions-btn delete-btn delete-tx-btn" data-id="${tx.id}" title="Delete Transaction">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </td>
          `;

          // Row checkbox event
          const chk = tr.querySelector('.tx-row-select');
          chk.addEventListener('change', (e) => {
            if (e.target.checked) state.selectedTxIds.add(tx.id);
            else state.selectedTxIds.delete(tx.id);
            updateBulkDeleteButton();
          });

          // Row Edit event
          const editBtn = tr.querySelector('.edit-tx-btn');
          editBtn.addEventListener('click', () => openTxModal(tx.id));

          // Row Delete event
          const delBtn = tr.querySelector('.delete-tx-btn');
          delBtn.addEventListener('click', () => {
            if (confirm(`Delete "${tx.description}"?`)) {
              deleteTransaction(tx.id);
            }
          });

          tbody.appendChild(tr);
        });
      }
    }

    // Update Pagination Info
    const totalCount = filtered.length;
    const maxPages = Math.ceil(totalCount / state.pageSize) || 1;
    const startIdx = totalCount > 0 ? (state.currentPage - 1) * state.pageSize + 1 : 0;
    const endIdx = Math.min(totalCount, state.currentPage * state.pageSize);

    const pageInfo = document.getElementById('tablePageInfo');
    if (pageInfo) pageInfo.textContent = `Showing ${startIdx} to ${endIdx} of ${totalCount} records`;

    const pageNumberDisplay = document.getElementById('pageNumberDisplay');
    if (pageNumberDisplay) pageNumberDisplay.textContent = `Page ${state.currentPage} of ${maxPages}`;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) prevBtn.disabled = state.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = state.currentPage >= maxPages;

    updateBulkDeleteButton();
  }

  /**
   * Update Bulk Delete Button State
   */
  function updateBulkDeleteButton() {
    const btn = document.getElementById('bulkDeleteBtn');
    const selectAllCheckbox = document.getElementById('selectAllTx');
    if (!btn) return;

    if (state.selectedTxIds.size > 0) {
      btn.style.display = 'inline-flex';
      btn.textContent = `Delete Selected (${state.selectedTxIds.size})`;
    } else {
      btn.style.display = 'none';
      if (selectAllCheckbox) selectAllCheckbox.checked = false;
    }
  }

  /**
   * Delete single transaction
   */
  function deleteTransaction(txId) {
    state.transactions = state.transactions.filter(t => t.id !== txId);
    state.selectedTxIds.delete(txId);
    FinanceStorage.saveTransactions(state.transactions);
    populateFilterOptions();
    renderAll();
    showToast('Transaction removed.', 'info');
  }

  /**
   * Render Budget Envelopes
   */
  function renderBudgets() {
    const container = document.getElementById('budgetCardsContainer');
    if (!container) return;

    container.innerHTML = '';

    const expensesByCategory = {};
    state.transactions.forEach(tx => {
      if (tx.type === 'Expense') {
        const cat = tx.category || 'Uncategorized';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + tx.amount;
      }
    });

    // Merge categories from state.budgets and spent
    const allCategories = Array.from(new Set([
      ...Object.keys(state.budgets),
      ...Object.keys(expensesByCategory)
    ])).sort();

    if (allCategories.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--text-muted);">No budget envelopes defined yet.</div>`;
      return;
    }

    allCategories.forEach(cat => {
      const spent = expensesByCategory[cat] || 0;
      const limit = state.budgets[cat] || 250;
      const percentage = limit > 0 ? (spent / limit) * 100 : 100;

      let statusClass = '';
      let badgeLabel = 'On Track';
      let badgeClass = 'positive';

      if (percentage >= 100) {
        statusClass = 'overbudget';
        badgeLabel = 'Overbudget';
        badgeClass = 'negative';
      } else if (percentage >= 80) {
        statusClass = 'warning';
        badgeLabel = 'Near Limit';
        badgeClass = 'neutral';
      }

      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <div class="budget-card-header">
          <div class="budget-category-name">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            ${escapeHtml(cat)}
          </div>
          <span class="badge-tag ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="budget-numbers-row">
          <div class="budget-spent">${formatCurrency(spent)}</div>
          <div class="budget-limit-edit">
            <span>of</span>
            <input type="number" class="budget-limit-input" data-category="${escapeHtml(cat)}" value="${limit}" min="1" step="10">
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-bar ${statusClass}" style="width: ${Math.min(100, percentage)}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
          <span>${percentage.toFixed(0)}% utilized</span>
          <span>${limit >= spent ? formatCurrency(limit - spent) + ' left' : formatCurrency(spent - limit) + ' over'}</span>
        </div>
      `;

      // Budget limit input change listener
      const limitInput = card.querySelector('.budget-limit-input');
      limitInput.addEventListener('change', (e) => {
        const newLim = parseFloat(e.target.value) || 0;
        state.budgets[cat] = newLim;
        FinanceStorage.saveBudgets(state.budgets);
        renderBudgets();
        showToast(`Budget for ${cat} updated to ${formatCurrency(newLim)}`, 'success');
      });

      container.appendChild(card);
    });
  }

  /**
   * Render Smart Insights & Recurring Charges
   */
  function renderInsights() {
    const recurringListEl = document.getElementById('recurringList');
    const anomaliesListEl = document.getElementById('anomaliesList');
    const recommendationsListEl = document.getElementById('recommendationsList');

    // Recurring subscriptions
    if (recurringListEl) {
      const recurring = FinanceAnalytics.detectRecurringSubscriptions(state.transactions);
      recurringListEl.innerHTML = '';
      if (recurring.length === 0) {
        recurringListEl.innerHTML = `<p style="color: var(--text-muted); font-size: 0.8rem;">No recurring patterns detected yet.</p>`;
      } else {
        recurring.forEach(item => {
          const div = document.createElement('div');
          div.className = 'insight-item';
          div.innerHTML = `
            <div class="insight-icon caramel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            </div>
            <div class="insight-content" style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h4>${escapeHtml(item.description)}</h4>
                <strong style="color: var(--caramel-700);">${formatCurrency(item.averageAmount)} / mo</strong>
              </div>
              <p>${escapeHtml(item.category)} • Projected Annual: <strong>${formatCurrency(item.annualized)}</strong></p>
            </div>
          `;
          recurringListEl.appendChild(div);
        });
      }
    }

    // Anomalies & Outliers
    if (anomaliesListEl) {
      const anomalies = FinanceAnalytics.detectAnomalies(state.transactions);
      anomaliesListEl.innerHTML = '';
      if (anomalies.length === 0) {
        anomaliesListEl.innerHTML = `<p style="color: var(--text-muted); font-size: 0.8rem;">No spending anomalies detected in the current dataset.</p>`;
      } else {
        anomalies.slice(0, 5).forEach(item => {
          const div = document.createElement('div');
          div.className = 'insight-item';
          div.innerHTML = `
            <div class="insight-icon alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="insight-content" style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h4>${escapeHtml(item.description)}</h4>
                <strong style="color: var(--color-expense);">${formatCurrency(item.amount)}</strong>
              </div>
              <p>Occurred on ${item.date} (${item.deviationMultiplier}x above mean transaction size)</p>
            </div>
          `;
          anomaliesListEl.appendChild(div);
        });
      }
    }

    // Algorithmic Recommendations
    if (recommendationsListEl) {
      const metrics = FinanceAnalytics.calculateMetrics(state.transactions);
      recommendationsListEl.innerHTML = '';

      const items = [];
      if (metrics.savingsRate < 20) {
        items.push({
          title: 'Elevate Savings Ratio towards 20% Benchmark',
          desc: `Current savings rate is ${metrics.savingsRate.toFixed(1)}%. Reallocating non-essential discretionary expenses could increase monthly surplus.`,
          icon: 'caramel'
        });
      } else {
        items.push({
          title: 'Strong Surplus Generation',
          desc: `Your savings rate is healthy at ${metrics.savingsRate.toFixed(1)}%. Consider allocating extra surplus into long-term DCA investments.`,
          icon: 'olive'
        });
      }

      if (metrics.topExpenseCategory !== 'None') {
        items.push({
          title: `Primary Outflow Vector: ${metrics.topExpenseCategory}`,
          desc: `${metrics.topExpenseCategory} represents ${formatCurrency(metrics.topExpenseCategoryAmount)}. Review envelope limits to prevent budget creep.`,
          icon: 'olive'
        });
      }

      items.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'insight-item';
        div.innerHTML = `
          <div class="insight-icon ${rec.icon}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <div class="insight-content">
            <h4>${rec.title}</h4>
            <p>${rec.desc}</p>
          </div>
        `;
        recommendationsListEl.appendChild(div);
      });
    }
  }

  /**
   * Render Data Studio (Live JSON & CSV Inspect)
   */
  function renderDataStudio() {
    const jsonPre = document.getElementById('jsonViewerContent');
    const csvPre = document.getElementById('csvViewerContent');

    if (jsonPre) {
      const sampleJSON = {
        spec: 'AuraFinance-Standard-v2',
        record_count: state.transactions.length,
        currency: state.currency,
        transactions: state.transactions.slice(0, 8)
      };
      jsonPre.textContent = JSON.stringify(sampleJSON, null, 2);
    }

    if (csvPre) {
      const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Account'];
      const rows = state.transactions.slice(0, 8).map(t =>
        `${t.date},"${t.description.replace(/"/g, '""')}",${t.category},${t.amount.toFixed(2)},${t.type},${t.account}`
      );
      csvPre.textContent = [headers.join(','), ...rows].join('\n') + `\n... [${state.transactions.length - 8} more rows]`;
    }
  }

  /**
   * Render Financial Goals & Projection Simulator
   */
  function renderGoals() {
    const goalsContainer = document.getElementById('goalsListContainer');
    if (!goalsContainer) return;

    goalsContainer.innerHTML = '';
    state.goals.forEach((goal, idx) => {
      const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
      const card = document.createElement('div');
      card.className = 'budget-card';
      card.innerHTML = `
        <div class="budget-card-header">
          <strong style="color: var(--olive-800);">${escapeHtml(goal.title)}</strong>
          <span class="badge-tag positive">${pct}% Saved</span>
        </div>
        <div class="budget-numbers-row">
          <span style="font-size: 1.25rem; font-weight: 700;">${formatCurrency(goal.current)}</span>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Target: ${formatCurrency(goal.target)}</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width: ${pct}%"></div>
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <button class="btn btn-secondary contribute-goal-btn" data-index="${idx}" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;">
            + Add Contribution
          </button>
        </div>
      `;

      const btn = card.querySelector('.contribute-goal-btn');
      btn.addEventListener('click', () => {
        const addStr = prompt(`Add contribution to "${goal.title}":`, '500');
        const addAmt = parseFloat(addStr) || 0;
        if (addAmt > 0) {
          goal.current += addAmt;
          renderGoals();
          showToast(`Added ${formatCurrency(addAmt)} to ${goal.title}`, 'success');
        }
      });

      goalsContainer.appendChild(card);
    });

    // 12-Month Projection Calculator
    const projectionSpan = document.getElementById('projectedAnnualSurplus');
    if (projectionSpan) {
      const metrics = FinanceAnalytics.calculateMetrics(state.transactions);
      const monthlyRunRate = metrics.netSavings;
      const annualProjected = monthlyRunRate * 12;
      projectionSpan.textContent = formatCurrency(annualProjected);
      projectionSpan.style.color = annualProjected >= 0 ? 'var(--olive-700)' : 'var(--color-expense)';
    }
  }

  /**
   * Populate Filter Dropdowns
   */
  function populateFilterOptions() {
    const catFilter = document.getElementById('categoryFilter');
    const acctFilter = document.getElementById('accountFilter');

    if (catFilter) {
      const currentVal = catFilter.value;
      const categories = Array.from(new Set(state.transactions.map(t => t.category || 'Uncategorized'))).sort();
      catFilter.innerHTML = '<option value="ALL">All Categories</option>';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catFilter.appendChild(opt);
      });
      catFilter.value = categories.includes(currentVal) ? currentVal : 'ALL';
    }

    if (acctFilter) {
      const currentVal = acctFilter.value;
      const accounts = Array.from(new Set(state.transactions.map(t => t.account || 'Checking'))).sort();
      acctFilter.innerHTML = '<option value="ALL">All Accounts</option>';
      accounts.forEach(acct => {
        const opt = document.createElement('option');
        opt.value = acct;
        opt.textContent = acct;
        acctFilter.appendChild(opt);
      });
      acctFilter.value = accounts.includes(currentVal) ? currentVal : 'ALL';
    }
  }

  /**
   * Open Add/Edit Transaction Modal
   */
  function openTxModal(txId = null) {
    state.editingTxId = txId;
    const modal = document.getElementById('txModal');
    const modalTitle = document.getElementById('txModalTitle');
    if (!modal) return;

    if (txId) {
      const tx = state.transactions.find(t => t.id === txId);
      if (!tx) return;
      if (modalTitle) modalTitle.textContent = 'Edit Transaction';
      document.getElementById('txDate').value = tx.date;
      document.getElementById('txDesc').value = tx.description;
      document.getElementById('txCategory').value = tx.category;
      document.getElementById('txAmount').value = tx.amount;
      document.getElementById('txType').value = tx.type;
      document.getElementById('txAccount').value = tx.account || 'Checking';
      document.getElementById('txNotes').value = tx.notes || '';
    } else {
      if (modalTitle) modalTitle.textContent = 'Add Transaction';
      document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('txDesc').value = '';
      document.getElementById('txCategory').value = 'Groceries';
      document.getElementById('txAmount').value = '';
      document.getElementById('txType').value = 'Expense';
      document.getElementById('txAccount').value = 'Checking';
      document.getElementById('txNotes').value = '';
    }

    modal.classList.add('open');
  }

  function closeTxModal() {
    const modal = document.getElementById('txModal');
    if (modal) modal.classList.remove('open');
    state.editingTxId = null;
  }

  function saveTxFromModal() {
    const date = document.getElementById('txDate').value;
    const desc = document.getElementById('txDesc').value.trim();
    const cat = document.getElementById('txCategory').value.trim();
    const amount = parseFloat(document.getElementById('txAmount').value);
    const type = document.getElementById('txType').value;
    const acct = document.getElementById('txAccount').value.trim();
    const notes = document.getElementById('txNotes').value.trim();

    if (!desc) {
      showToast('Please enter a description.', 'warning');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a positive numeric amount.', 'warning');
      return;
    }

    if (state.editingTxId) {
      // Update existing
      const idx = state.transactions.findIndex(t => t.id === state.editingTxId);
      if (idx !== -1) {
        state.transactions[idx] = {
          ...state.transactions[idx],
          date,
          description: desc,
          category: cat,
          amount,
          type,
          account: acct,
          notes
        };
        showToast('Transaction updated.', 'success');
      }
    } else {
      // Add new
      const newTx = {
        id: 'tx-' + Math.random().toString(36).substring(2, 9),
        date,
        description: desc,
        category: cat,
        amount,
        type,
        account: acct,
        notes
      };
      state.transactions.unshift(newTx);
      showToast('Transaction added successfully.', 'success');
    }

    FinanceStorage.saveTransactions(state.transactions);
    closeTxModal();
    populateFilterOptions();
    renderAll();
  }

  /**
   * Synthetic Data Generator Modal
   */
  function openSyntheticModal() {
    const modal = document.getElementById('syntheticModal');
    if (modal) modal.classList.add('open');
  }

  function closeSyntheticModal() {
    const modal = document.getElementById('syntheticModal');
    if (modal) modal.classList.remove('open');
  }

  /**
   * Toast notification system
   */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  /**
   * Helper: Format Currency
   */
  function formatCurrency(val) {
    const num = Number(val) || 0;
    return `${state.currencySymbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDateFile(d) {
    return d.toISOString().split('T')[0];
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  return {
    init,
    showToast
  };
})();

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  FinanceApp.init();
});
