#!/usr/bin/env python3
"""
AuraFinance™ Command-Line Financial Processor
Process and analyze CSV/JSON financial datasets from the command line.
"""

import sys
import os
import csv
import json
from collections import defaultdict
from datetime import datetime

# Ensure safe UTF-8 output on Windows consoles
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def parse_currency(val):
    if isinstance(val, (int, float)):
        return float(val)
    if not val:
        return 0.0
    s = str(val).strip().replace('$', '').replace('€', '').replace('£', '').replace(',', '')
    if s.startswith('(') and s.endswith(')'):
        return -float(s[1:-1])
    try:
        return float(s)
    except ValueError:
        return 0.0

def analyze_file(filepath):
    if not os.path.exists(filepath):
        print(f"Error: File not found '{filepath}'")
        sys.exit(1)

    transactions = []
    ext = os.path.splitext(filepath)[1].lower()

    if ext == '.json':
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            records = data if isinstance(data, list) else data.get('transactions', data.get('records', []))
            for r in records:
                amt = abs(parse_currency(r.get('amount', 0)))
                tx_type = r.get('type', 'Expense')
                if 'income' in r.get('category', '').lower():
                    tx_type = 'Income'
                transactions.append({
                    'date': r.get('date', 'Unknown'),
                    'description': r.get('description', 'Untitled'),
                    'category': r.get('category', 'Uncategorized'),
                    'amount': amt,
                    'type': tx_type,
                    'account': r.get('account', 'General')
                })
    else:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # normalize keys
                low_row = {k.lower().strip(): v for k, v in row.items() if k}
                desc = low_row.get('description', low_row.get('merchant', low_row.get('title', 'Untitled')))
                cat = low_row.get('category', 'Uncategorized')
                raw_amt = low_row.get('amount', low_row.get('cost', low_row.get('value', '0')))
                amt = abs(parse_currency(raw_amt))
                tx_type = low_row.get('type', 'Expense')
                if 'inc' in tx_type.lower() or 'income' in cat.lower():
                    tx_type = 'Income'
                else:
                    tx_type = 'Expense'

                transactions.append({
                    'date': low_row.get('date', 'Unknown'),
                    'description': desc,
                    'category': cat,
                    'amount': amt,
                    'type': tx_type,
                    'account': low_row.get('account', 'Checking')
                })

    if not transactions:
        print("No transactions found.")
        return

    total_income = sum(t['amount'] for t in transactions if t['type'] == 'Income')
    total_expense = sum(t['amount'] for t in transactions if t['type'] == 'Expense')
    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

    categories = defaultdict(float)
    for t in transactions:
        if t['type'] == 'Expense':
            categories[t['category']] += t['amount']

    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)

    print("\n" + "=" * 62)
    print(f"  [+] AuraFinance Analysis Report: {os.path.basename(filepath)}")
    print("=" * 62)
    print(f"  Total Transactions:  {len(transactions)}")
    print(f"  Total Inflow:        ${total_income:,.2f}")
    print(f"  Total Outflow:       ${total_expense:,.2f}")
    print(f"  Net Savings:         ${net_savings:,.2f}")
    print(f"  Savings Rate:        {savings_rate:.1f}%")
    print("-" * 62)
    print("  Expense Breakdown by Category:")
    for cat, amt in sorted_cats:
        pct = (amt / total_expense * 100) if total_expense > 0 else 0
        bar = '#' * int(pct / 4)
        print(f"    {cat:<22} ${amt:>9,.2f}  ({pct:>5.1f}%) {bar}")
    print("=" * 62 + "\n")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'data/personal_sample.csv'
    analyze_file(target)
