# AuraFinance™ | Personal Finance Analyzer

[![GitHub Pages Deployment](https://img.shields.io/badge/Deploy-GitHub_Pages-485B2E?style=flat&logo=github)](https://muzeemreniman113-arch.github.io/Finance-Analyzer-/)
[![License](https://img.shields.io/badge/License-MIT-C67D33?style=flat)](LICENSE)
[![Theme](https://img.shields.io/badge/Palette-Olive%20%7C%20Ivory%20%7C%20Caramel-485B2E?style=flat)](#aesthetic-design-system)
[![Status](https://img.shields.io/badge/Quality-Industrial%20Production%20Demo-3E6920?style=flat)](#)

> **Personal Finance Analyzer Using CSV/JSON Data Processing**  
> An executive-grade financial intelligence application engineered for high-precision data ingestion, automated classification, budget envelope allocation, and quantitative cash flow forecasting.

Official Repository: [https://github.com/muzeemreniman113-arch/Finance-Analyzer-](https://github.com/muzeemreniman113-arch/Finance-Analyzer-)

---

## 🌟 Executive Overview & Key Capabilities

AuraFinance is an industrial-level client-side and full-stack personal finance workbench designed to process raw banking statement feeds, enterprise expense reports, and multi-format transaction logs with zero latency and zero data leakage.

### 1. Robust CSV & JSON Data Ingestion Engine
- **Multi-Format Parsing:** Ingests CSV (comma, semicolon, tab) and JSON schemas automatically.
- **Smart Column Mapping:** Automatically infers `date`, `description`, `category`, `amount`, `type`, `account`, and `notes` columns from banking formats worldwide.
- **Data Normalization:** Sanitizes currency strings (`$1,420.50`, `-$45.00`, `(150.00)`, `€ 80,50`), handles parenthetical negatives, and standardizes dates to ISO-8601 `YYYY-MM-DD`.
- **Pre-loaded Industry Test Suites:** Instant one-click loading of realistic datasets:
  - *Personal Monthly Budget 2026*
  - *Tech Freelancer & Consultant*
  - *Configurable Synthetic Transaction Generator* (10 to 100 rows on demand).

### 2. Executive Analytics & KPI Health Scoring
- **Real-Time Financial Metrics:** Total Inflow, Total Outflow, Net Surplus, and Savings Ratio (%).
- **5-Pillar Algorithmic Financial Health Assessment:**
  - Savings Rate Target (>20% benchmark)
  - Housing & Fixed Expense Burden (<=30% benchmark)
  - Discretionary Ratio Control (<20% benchmark)
  - Liquidity and Inflow Stability
  - Overall Grade assignment (A+, A, B+, B, C, Needs Attention).

### 3. Responsive High-DPI Visualizations
- **Trajectory Canvas Area Chart:** Inflow (Olive) vs Outflow (Caramel) cash flow curves with gradient fills.
- **Category Donut Chart:** Proportional slice distribution with dynamic center total and legend.
- **Monthly Bar Comparison:** Side-by-side grouped inflow/outflow bars.
- **Spending Velocity Chart:** Expenditure distribution across days of the week (Sun – Sat).

### 4. Interactive Transaction Ledger (CRUD & Bulk Operations)
- **Instant Search:** Multi-attribute filtering across descriptions, categories, accounts, and memo notes.
- **Granular Multi-Filters:** Filter by Category, Flow Type (Income / Expense), Account, and Date Range (All Time, This Month, 30 Days, 90 Days).
- **Multi-Column Sorting:** Sort ascending or descending by Date, Description, Category, or Amount.
- **In-Place CRUD:** Add new records, edit existing transactions with modal validation, duplicate, and delete.
- **Bulk Operations:** Select all or individual records for batch deletion.
- **Configurable Pagination:** 10, 15, 25, 50, or 100 records per page.

### 5. Dynamic Budget Envelopes (50/30/20 & Custom)
- Category-level progress bars with color-coded warning states:
  - **Olive Green:** Under 80% utilization (Safe)
  - **Caramel Gold:** 80% to 100% utilization (Warning)
  - **Terracotta:** Over 100% limit (Deficit Alert)
- Direct in-line limit editing saved instantaneously to `localStorage`.
- **Auto-Calculate Envelopes:** Algorithmically sets suggested envelopes to 115% of historical average category spend.

### 6. Heuristic Intelligence & Recurring Charge Detection
- **Subscription Hunter:** Auto-detects recurring monthly and annual software subscriptions, gym memberships, utilities, and streaming services.
- **Spike & Outlier Detector:** Flags single expenses that exceed 1.8x standard deviations above the mean.
- **Actionable Financial Recommendations:** Tailored advice on cash flow optimization based on actual spending.

### 7. Data Studio & Schema Inspector
- Live JSON view with clipboard copy.
- Clean CSV stream view with one-click copy.
- Synthetic dataset generation engine for stress testing.

### 8. Export Hub
- **Clean RFC-4180 CSV Export:** Includes UTF-8 BOM for Microsoft Excel and Google Sheets.
- **Structured FinTech JSON Export:** Standardized spec with envelope metadata.
- **Printable Financial Statement:** Formatted print stylesheet for PDF or physical reporting.

---

## 🎨 Aesthetic Design System

The application defaults to a **Light Theme** crafted around the specified palette:

| Tone | Hex Code | Visual Application |
| :--- | :--- | :--- |
| **Warm Ivory** | `#FBF9F4` / `#F6F2E8` | Base background, surface canvas, warm cards |
| **Rich Olive** | `#485B2E` / `#3E4E29` | Primary action buttons, brand logo, inflow indicators, active tabs |
| **Golden Caramel** | `#C67D33` / `#DA9147` | Secondary accents, warning badges, expense highlights, data points |
| **Deep Charcoal-Olive** | `#21261B` | Ultra-high contrast, legible typography |

> An optional **Dark Luxury Mode** toggle is also available in the top navigation bar, preserving the Olive and Caramel accents while rendering deep forest background tones.

---

## 🚀 Quickstart & Local Execution

### Option A: Instant Browser Launch (Zero Setup)
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari). All features, charts, parsing, and storage operate completely offline.

### Option B: Python Demo Server (Recommended for Live Demo)
Run the included lightweight Python HTTP server:

```powershell
# Navigate to the project directory
cd c:\Users\muzee\OneDrive\Desktop\finance

# Start the server (default port 8000)
python server.py
```
Open your browser at: `http://localhost:8000`

### Option C: Command-Line Financial Processor
Process any CSV or JSON file directly from your terminal:

```powershell
# Analyze sample CSV
python cli_analyzer.py data/personal_sample.csv

# Analyze sample JSON
python cli_analyzer.py data/finances_sample.json
```

---

## 🌐 Deploy to GitHub Pages (Production Demo)

This repository includes an automated GitHub Actions deployment workflow in `.github/workflows/deploy.yml`.

### Push to your GitHub Repository:
```bash
# 1. Initialize git (if not already done)
git init

# 2. Add remote repository
git remote add origin https://github.com/muzeemreniman113-arch/Finance-Analyzer-.git

# 3. Stage and commit files
git add .
git commit -m "feat: complete industrial personal finance analyzer"

# 4. Push to main branch
git branch -M main
git push -u origin main
```

### Enable GitHub Pages in your Repository Settings:
1. Go to your GitHub repository: [muzeemreniman113-arch/Finance-Analyzer-](https://github.com/muzeemreniman113-arch/Finance-Analyzer-)
2. Navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions** (or deploy directly from branch `main` / root).
4. Your live website will be accessible at:  
   **`https://muzeemreniman113-arch.github.io/Finance-Analyzer-/`**

---

## 📂 Project Architecture

```
Finance-Analyzer-/
├── index.html                  # Single Page Application core shell
├── server.py                   # Lightweight Python HTTP server & healthcheck
├── cli_analyzer.py             # CLI terminal financial analytics tool
├── README.md                   # Comprehensive industrial documentation
├── .gitignore                  # Standard exclusions
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── css/
│   └── styles.css              # Olive, Ivory & Caramel responsive design system
├── js/
│   ├── app.js                  # Application orchestrator & DOM bindings
│   ├── parser.js               # CSV/JSON ingestion, delimiter & column mapper
│   ├── analytics.js            # Quantitative KPIs, 5-pillar health scoring & anomalies
│   ├── charts.js               # Zero-dependency Retina Canvas visualization engine
│   ├── storage.js              # LocalStorage state management & presets
│   └── export.js               # Clean CSV, JSON & PDF print exporter
└── data/
    ├── personal_sample.csv     # Sample personal monthly budget
    ├── freelancer_sample.csv   # Sample tech freelancer/consultant dataset
    └── finances_sample.json    # Standard FinTech structured JSON dataset
```

---

## 📋 Data Schema Specification

### CSV Ingestion Format:
```csv
date,description,category,amount,type,account,notes
2026-10-01,Acme Corp Salary,Income,5200.00,Income,Checking,Monthly primary payroll
2026-10-02,Whole Foods Market,Groceries,142.50,Expense,Credit Card,Pantry restock
```

### JSON Ingestion Format:
```json
{
  "version": "2.4.0",
  "currency": "USD",
  "transactions": [
    {
      "id": "tx-101",
      "date": "2026-10-01",
      "description": "TechCorp Payroll",
      "category": "Income",
      "amount": 3450.00,
      "type": "Income",
      "account": "Checking",
      "notes": "Direct deposit"
    }
  ],
  "budget_targets": {
    "Housing & Rent": 1600.00,
    "Groceries": 500.00
  }
}
```

---

## 🛡️ License & Attributions
Built with high-precision engineering for industrial demonstration and personal financial management.  
Licensed under the [MIT License](LICENSE).
