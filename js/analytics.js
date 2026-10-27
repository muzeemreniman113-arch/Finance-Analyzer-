/**
 * AuraFinance™ Analytics Engine
 * Quantitative Financial Analysis, KPI Metrics, Health Scoring & Trend Detection
 */

const FinanceAnalytics = (() => {
  'use strict';

  /**
   * Compute comprehensive executive metrics from a list of transactions
   */
  function calculateMetrics(transactions) {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        savingsRate: 0,
        dailyAverageSpend: 0,
        activeDaysCount: 0,
        largestExpense: null,
        topExpenseCategory: 'None',
        topExpenseCategoryAmount: 0,
        healthScore: 0,
        healthGrade: 'N/A',
        transactionCount: 0
      };
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    let largestExpense = null;
    const categoryTotals = {};
    const dateSet = new Set();

    transactions.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'Income') {
        totalIncome += amt;
      } else {
        totalExpenses += amt;
        dateSet.add(tx.date);

        // Track category totals
        const cat = tx.category || 'Uncategorized';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

        // Track largest single expense
        if (!largestExpense || amt > largestExpense.amount) {
          largestExpense = tx;
        }
      }
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const activeDaysCount = Math.max(1, dateSet.size);
    const dailyAverageSpend = totalExpenses / activeDaysCount;

    // Determine top expense category
    let topExpenseCategory = 'None';
    let topExpenseCategoryAmount = 0;
    for (const [cat, sum] of Object.entries(categoryTotals)) {
      if (sum > topExpenseCategoryAmount) {
        topExpenseCategoryAmount = sum;
        topExpenseCategory = cat;
      }
    }

    // Compute Financial Health Score (0 - 100)
    const health = computeFinancialHealth(totalIncome, totalExpenses, savingsRate, categoryTotals);

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      dailyAverageSpend,
      activeDaysCount,
      largestExpense,
      topExpenseCategory,
      topExpenseCategoryAmount,
      healthScore: health.score,
      healthGrade: health.grade,
      healthFactors: health.factors,
      transactionCount: transactions.length
    };
  }

  /**
   * Algorithmic 5-pillar Financial Health Assessment
   */
  function computeFinancialHealth(income, expenses, savingsRate, categoryTotals) {
    if (income === 0 && expenses === 0) {
      return { score: 50, grade: 'Neutral', factors: [] };
    }

    let score = 50;
    const factors = [];

    // Pillar 1: Savings Rate (Up to 30 pts)
    if (savingsRate >= 25) {
      score += 25;
      factors.push({ label: 'Savings Rate > 25%', impact: '+25', status: 'positive' });
    } else if (savingsRate >= 15) {
      score += 15;
      factors.push({ label: 'Healthy Savings Rate (15-24%)', impact: '+15', status: 'positive' });
    } else if (savingsRate > 0) {
      score += 5;
      factors.push({ label: 'Modest Positive Savings Rate', impact: '+5', status: 'neutral' });
    } else {
      score -= 20;
      factors.push({ label: 'Deficit Cashflow (Expenses exceed Income)', impact: '-20', status: 'negative' });
    }

    // Pillar 2: Housing & Fixed Burden (Up to 20 pts)
    const housingSpend = (categoryTotals['Housing & Rent'] || categoryTotals['Housing'] || categoryTotals['Rent'] || 0);
    const housingRatio = income > 0 ? (housingSpend / income) * 100 : 0;
    if (housingRatio <= 30 && housingRatio > 0) {
      score += 15;
      factors.push({ label: 'Housing within ideal 30% rule', impact: '+15', status: 'positive' });
    } else if (housingRatio > 40) {
      score -= 10;
      factors.push({ label: 'Housing exceeds 40% of income', impact: '-10', status: 'warning' });
    }

    // Pillar 3: Discretionary / Dining ratio
    const diningSpend = (categoryTotals['Dining & Drinks'] || categoryTotals['Dining'] || 0) + (categoryTotals['Entertainment'] || 0);
    const discretionaryRatio = expenses > 0 ? (diningSpend / expenses) * 100 : 0;
    if (discretionaryRatio <= 20) {
      score += 10;
      factors.push({ label: 'Controlled Discretionary Spend (< 20%)', impact: '+10', status: 'positive' });
    } else if (discretionaryRatio > 35) {
      score -= 10;
      factors.push({ label: 'Elevated Discretionary Spend (> 35%)', impact: '-10', status: 'warning' });
    }

    score = Math.max(10, Math.min(100, Math.round(score)));

    let grade = 'B';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B+';
    else if (score >= 60) grade = 'B';
    else if (score >= 50) grade = 'C';
    else grade = 'Needs Attention';

    return { score, grade, factors };
  }

  /**
   * Group transactions by Category for Donut & Bar Charts
   */
  function getCategoryBreakdown(transactions, type = 'Expense') {
    const map = {};
    let total = 0;

    transactions.forEach(tx => {
      if (tx.type === type) {
        const cat = tx.category || 'Uncategorized';
        const amt = Number(tx.amount) || 0;
        map[cat] = (map[cat] || 0) + amt;
        total += amt;
      }
    });

    const items = Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }));

    // Sort descending by amount
    items.sort((a, b) => b.amount - a.amount);
    return { items, total };
  }

  /**
   * Aggregate Cash Flow by Timeline (Monthly or Daily)
   */
  function getTimelineCashFlow(transactions) {
    const monthlyData = {};

    transactions.forEach(tx => {
      const monthKey = tx.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0, net: 0 };
      }

      const amt = Number(tx.amount) || 0;
      if (tx.type === 'Income') {
        monthlyData[monthKey].income += amt;
      } else {
        monthlyData[monthKey].expense += amt;
      }
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    return sortedMonths.map(k => monthlyData[k]);
  }

  /**
   * Detect recurring subscriptions and predictable bills
   */
  function detectRecurringSubscriptions(transactions) {
    const merchantMap = {};

    transactions.forEach(tx => {
      if (tx.type === 'Expense') {
        const descKey = tx.description.toLowerCase().trim();
        if (!merchantMap[descKey]) {
          merchantMap[descKey] = {
            description: tx.description,
            category: tx.category,
            amounts: [],
            dates: []
          };
        }
        merchantMap[descKey].amounts.push(tx.amount);
        merchantMap[descKey].dates.push(tx.date);
      }
    });

    const recurring = [];
    const knownSubs = ['netflix', 'spotify', 'apple', 'gym', 'amazon prime', 'electric', 'water', 'internet', 'rent', 'github', 'hulu', 'google', 'cloud', 'verizon'];

    for (const [key, data] of Object.entries(merchantMap)) {
      const isKnown = knownSubs.some(sub => key.includes(sub));
      const hasMultiple = data.dates.length >= 2;
      const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;

      if (isKnown || (hasMultiple && avgAmount > 0)) {
        recurring.push({
          description: data.description,
          category: data.category,
          frequency: 'Monthly',
          averageAmount: avgAmount,
          annualized: avgAmount * 12,
          occurrences: data.dates.length
        });
      }
    }

    recurring.sort((a, b) => b.averageAmount - a.averageAmount);
    return recurring;
  }

  /**
   * Detect statistical anomalies and significant spending spikes
   */
  function detectAnomalies(transactions) {
    const expenses = transactions.filter(t => t.type === 'Expense');
    if (expenses.length < 5) return [];

    const amounts = expenses.map(t => Number(t.amount) || 0);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const threshold = mean + (1.8 * stdDev);
    const anomalies = expenses.filter(tx => Number(tx.amount) > threshold);

    return anomalies.map(tx => ({
      ...tx,
      deviationMultiplier: (Number(tx.amount) / mean).toFixed(1)
    })).sort((a, b) => b.amount - a.amount);
  }

  /**
   * Analyze spending by Day of the Week (Mon - Sun)
   */
  function getSpendingVelocity(transactions) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const velocity = days.map(day => ({ day, total: 0, count: 0 }));

    transactions.forEach(tx => {
      if (tx.type === 'Expense') {
        const d = new Date(tx.date);
        if (!isNaN(d.getTime())) {
          const dayIdx = d.getDay();
          velocity[dayIdx].total += Number(tx.amount) || 0;
          velocity[dayIdx].count += 1;
        }
      }
    });

    return velocity;
  }

  return {
    calculateMetrics,
    computeFinancialHealth,
    getCategoryBreakdown,
    getTimelineCashFlow,
    detectRecurringSubscriptions,
    detectAnomalies,
    getSpendingVelocity
  };
})();
