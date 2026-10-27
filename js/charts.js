/**
 * AuraFinance™ Canvas Charting Engine
 * Pure Vanilla Canvas Interactive Visualizations
 * Olive, Ivory & Caramel Aesthetic - Zero External Dependencies
 */

const FinanceCharts = (() => {
  'use strict';

  // Aesthetic Palette for Charts
  const PALETTE = {
    olivePrimary: '#485B2E',
    oliveLight: '#76934E',
    oliveTint: 'rgba(72, 91, 46, 0.18)',
    oliveGradientStart: 'rgba(72, 91, 46, 0.35)',
    oliveGradientEnd: 'rgba(72, 91, 46, 0.0)',

    caramelPrimary: '#C67D33',
    caramelLight: '#DA9147',
    caramelTint: 'rgba(198, 125, 51, 0.18)',
    caramelGradientStart: 'rgba(198, 125, 51, 0.35)',
    caramelGradientEnd: 'rgba(198, 125, 51, 0.0)',

    expenseRed: '#BD5338',
    textDark: '#21261B',
    textMuted: '#848D79',
    gridLine: '#E8E1D3',
    cardBg: '#FFFFFF',

    donutColors: [
      '#485B2E', // Deep Olive
      '#C67D33', // Caramel
      '#6B8E23', // Olive Drab
      '#DA9147', // Warm Caramel
      '#8C4E19', // Burnt Caramel
      '#3E6920', // Forest Olive
      '#B07238', // Amber Wood
      '#5C743B', // Muted Olive
      '#D4A373', // Caramel Sand
      '#6E7D52'  // Sage Olive
    ]
  };

  /**
   * Setup HiDPI Canvas
   */
  function setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    const displayWidth = rect.width > 0 ? rect.width : (canvas.parentElement ? canvas.parentElement.clientWidth : 400);
    const displayHeight = rect.height > 0 ? rect.height : (canvas.parentElement ? canvas.parentElement.clientHeight : 280);

    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    return { ctx, width: displayWidth, height: displayHeight };
  }

  /**
   * Render Cash Flow Area / Multi-line Chart
   */
  function renderCashFlowChart(canvas, timelineData, currency = '$') {
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    if (!timelineData || timelineData.length === 0) {
      renderEmptyState(ctx, width, height, 'No timeline transactions recorded');
      return;
    }

    const padding = { top: 30, right: 30, bottom: 45, left: 65 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Determine max value
    const maxVal = Math.max(
      ...timelineData.map(d => Math.max(d.income, d.expense)),
      1000
    ) * 1.15;

    // Draw horizontal grid lines & Y-axis labels
    const gridSteps = 4;
    ctx.strokeStyle = PALETTE.gridLine;
    ctx.lineWidth = 1;
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = PALETTE.textMuted;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartHeight / gridSteps) * i;
      const val = maxVal - (maxVal / gridSteps) * i;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(`${currency}${Math.round(val).toLocaleString()}`, padding.left - 10, y);
    }

    // Step calculation for X-axis
    const stepX = timelineData.length > 1 ? chartWidth / (timelineData.length - 1) : chartWidth / 2;

    // Helper for coordinate mapping
    const getX = (idx) => timelineData.length > 1 ? padding.left + (idx * stepX) : padding.left + chartWidth / 2;
    const getY = (val) => padding.top + chartHeight - (val / maxVal) * chartHeight;

    // Draw Income Gradient Area (Olive)
    ctx.beginPath();
    timelineData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.income);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(getX(timelineData.length - 1), padding.top + chartHeight);
    ctx.lineTo(getX(0), padding.top + chartHeight);
    ctx.closePath();

    const gradIncome = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradIncome.addColorStop(0, PALETTE.oliveGradientStart);
    gradIncome.addColorStop(1, PALETTE.oliveGradientEnd);
    ctx.fillStyle = gradIncome;
    ctx.fill();

    // Draw Income Stroke (Olive)
    ctx.beginPath();
    timelineData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.income);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = PALETTE.olivePrimary;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Expense Stroke (Caramel)
    ctx.beginPath();
    timelineData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.expense);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = PALETTE.caramelPrimary;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Data Point Circles & X-axis Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    timelineData.forEach((d, i) => {
      const x = getX(i);
      const yIncome = getY(d.income);
      const yExpense = getY(d.expense);

      // Income point
      ctx.beginPath();
      ctx.arc(x, yIncome, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = PALETTE.olivePrimary;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Expense point
      ctx.beginPath();
      ctx.arc(x, yExpense, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = PALETTE.caramelPrimary;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // X-axis month label
      ctx.fillStyle = PALETTE.textDark;
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(d.month, x, padding.top + chartHeight + 12);
    });

    // Draw Chart Legend in top right corner
    drawChartLegend(ctx, width - padding.right - 180, 10, [
      { label: 'Inflow (Income)', color: PALETTE.olivePrimary },
      { label: 'Outflow (Expenses)', color: PALETTE.caramelPrimary }
    ]);
  }

  /**
   * Render Category Expense Donut Chart with Legend
   */
  function renderCategoryDonut(canvas, categoryData, currency = '$') {
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    if (!categoryData || !categoryData.items || categoryData.items.length === 0) {
      renderEmptyState(ctx, width, height, 'No expense categories recorded');
      return;
    }

    const { items, total } = categoryData;
    const centerX = Math.min(width * 0.38, 160);
    const centerY = height / 2;
    const outerRadius = Math.min(centerX - 20, centerY - 20, 95);
    const innerRadius = outerRadius * 0.62;

    let startAngle = -Math.PI / 2;

    items.forEach((item, index) => {
      const sliceAngle = (item.amount / total) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;
      const color = PALETTE.donutColors[index % PALETTE.donutColors.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      // Outer separation stroke
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TOTAL EXPENSES', centerX, centerY - 10);

    ctx.fillStyle = PALETTE.textDark;
    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${currency}${Math.round(total).toLocaleString()}`, centerX, centerY + 10);

    // Render Side Legend
    const legendLeft = centerX + outerRadius + 28;
    const legendTop = Math.max(20, (height - (Math.min(items.length, 6) * 24)) / 2);

    items.slice(0, 6).forEach((item, idx) => {
      const y = legendTop + (idx * 24);
      const color = PALETTE.donutColors[idx % PALETTE.donutColors.length];

      // Color swatch pill
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(legendLeft + 5, y + 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Category Name & %
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.textDark;
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      const label = item.name.length > 15 ? item.name.substring(0, 14) + '…' : item.name;
      ctx.fillText(label, legendLeft + 18, y + 6);

      ctx.textAlign = 'right';
      ctx.fillStyle = PALETTE.textMuted;
      ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${item.percentage.toFixed(1)}%`, width - 20, y + 6);
    });
  }

  /**
   * Render Monthly Income vs Expense Comparison Bar Chart
   */
  function renderIncomeVsExpenseBar(canvas, timelineData, currency = '$') {
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    if (!timelineData || timelineData.length === 0) {
      renderEmptyState(ctx, width, height, 'No timeline data');
      return;
    }

    const padding = { top: 25, right: 25, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxVal = Math.max(...timelineData.map(d => Math.max(d.income, d.expense)), 1000) * 1.15;

    // Draw horizontal grid lines
    const gridSteps = 3;
    ctx.strokeStyle = PALETTE.gridLine;
    ctx.lineWidth = 1;
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = PALETTE.textMuted;
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartHeight / gridSteps) * i;
      const val = maxVal - (maxVal / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${currency}${Math.round(val).toLocaleString()}`, padding.left - 8, y + 4);
    }

    const groupWidth = chartWidth / timelineData.length;
    const barWidth = Math.min(22, (groupWidth - 16) / 2);

    timelineData.forEach((d, i) => {
      const groupX = padding.left + (i * groupWidth);
      const incomeHeight = (d.income / maxVal) * chartHeight;
      const expenseHeight = (d.expense / maxVal) * chartHeight;

      // Income Bar (Olive)
      const xIncome = groupX + (groupWidth / 2) - barWidth - 2;
      const yIncome = padding.top + chartHeight - incomeHeight;
      ctx.fillStyle = PALETTE.olivePrimary;
      drawRoundedRect(ctx, xIncome, yIncome, barWidth, incomeHeight, 4);

      // Expense Bar (Caramel)
      const xExpense = groupX + (groupWidth / 2) + 2;
      const yExpense = padding.top + chartHeight - expenseHeight;
      ctx.fillStyle = PALETTE.caramelPrimary;
      drawRoundedRect(ctx, xExpense, yExpense, barWidth, expenseHeight, 4);

      // X-axis label
      ctx.fillStyle = PALETTE.textDark;
      ctx.textAlign = 'center';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(d.month, groupX + (groupWidth / 2), padding.top + chartHeight + 16);
    });
  }

  /**
   * Render Spending Velocity by Day-of-Week
   */
  function renderSpendingVelocityBar(canvas, velocityData, currency = '$') {
    const setup = setupCanvas(canvas);
    if (!setup) return;
    const { ctx, width, height } = setup;

    ctx.clearRect(0, 0, width, height);

    if (!velocityData || velocityData.length === 0) {
      renderEmptyState(ctx, width, height, 'No velocity metrics');
      return;
    }

    const padding = { top: 25, right: 20, bottom: 35, left: 55 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxVal = Math.max(...velocityData.map(v => v.total), 100) * 1.15;
    const colWidth = chartWidth / velocityData.length;
    const barWidth = Math.min(28, colWidth - 12);

    // Draw grid lines
    ctx.strokeStyle = PALETTE.gridLine;
    ctx.lineWidth = 1;
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = PALETTE.textMuted;
    ctx.textAlign = 'right';

    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (chartHeight / 3) * i;
      const val = maxVal - (maxVal / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${currency}${Math.round(val)}`, padding.left - 6, y + 4);
    }

    velocityData.forEach((item, idx) => {
      const x = padding.left + (idx * colWidth) + (colWidth - barWidth) / 2;
      const bHeight = (item.total / maxVal) * chartHeight;
      const y = padding.top + chartHeight - bHeight;

      // Draw subtle bar
      ctx.fillStyle = idx === 0 || idx === 6 ? PALETTE.caramelPrimary : PALETTE.oliveMedium || PALETTE.olivePrimary;
      drawRoundedRect(ctx, x, y, barWidth, bHeight, 4);

      // Label
      ctx.fillStyle = PALETTE.textDark;
      ctx.textAlign = 'center';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(item.day, x + (barWidth / 2), padding.top + chartHeight + 16);
    });
  }

  /**
   * Helper: Rounded Rect on 2D context
   */
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height <= 0) return;
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Helper: Draw chart legend
   */
  function drawChartLegend(ctx, startX, startY, items) {
    let currentX = startX;
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.textBaseline = 'middle';

    items.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(currentX, startY + 6, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.textDark;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, currentX + 10, startY + 6);
      currentX += ctx.measureText(item.label).width + 24;
    });
  }

  /**
   * Helper: Empty state for charts
   */
  function renderEmptyState(ctx, width, height, message) {
    ctx.fillStyle = PALETTE.textMuted;
    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, width / 2, height / 2);
  }

  return {
    renderCashFlowChart,
    renderCategoryDonut,
    renderIncomeVsExpenseBar,
    renderSpendingVelocityBar
  };
})();
