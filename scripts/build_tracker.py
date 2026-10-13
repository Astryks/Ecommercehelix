"""Builds public/downloads/helix-metrics-tracker.xlsx and .csv: a simple daily tracking sheet with formulas.
Run: python3 scripts/build_tracker.py  (needs openpyxl)
"""
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

OUT = Path(__file__).resolve().parents[1] / "public" / "downloads"
INPUT = PatternFill("solid", fgColor="FFF7E6")   # soft yellow: you type here
CALC = PatternFill("solid", fgColor="EEF6F8")    # soft blue: Helix works it out
HEAD = Font(bold=True, color="0B1F3A")
ROWS = 62  # two months of days

cols = [
    ("Date", "in", "Type the date, for example 2026-10-13"),
    ("Sales", "in", "Total sales for the day, before GST/VAT if you are registered"),
    ("Orders", "in", "How many orders"),
    ("Visits", "in", "Sessions from Shopify Analytics"),
    ("Meta ad spend", "in", "From Ads Manager, Amount spent"),
    ("Google ad spend", "in", "From Google Ads, Cost"),
    ("Product cost", "in", "What the products in those orders cost you"),
    ("Shipping cost", "in", "What you paid to ship them"),
    ("Payment fees", "in", "Shopify Payments, PayPal and so on"),
    ("Other costs", "in", "Anything else for the day (optional)"),
    ("Total ad spend", "calc", "Meta + Google"),
    ("Total costs", "calc", "Ads + product + shipping + fees + other"),
    ("Profit", "calc", "Sales minus total costs"),
    ("ROAS", "calc", "Sales for each $1 of ads"),
    ("Conversion rate", "calc", "Orders out of every 100 visits"),
    ("AOV", "calc", "Average order value: sales divided by orders"),
    ("MER", "calc", "Ad spend as a share of sales"),
]
FORMULAS = {
    "K": "=IF(A{r}=\"\",\"\",E{r}+F{r})",
    "L": "=IF(A{r}=\"\",\"\",K{r}+G{r}+H{r}+I{r}+J{r})",
    "M": "=IF(A{r}=\"\",\"\",B{r}-L{r})",
    "N": "=IF(OR(A{r}=\"\",K{r}=0),\"\",B{r}/K{r})",
    "O": "=IF(OR(A{r}=\"\",D{r}=0),\"\",C{r}/D{r})",
    "P": "=IF(OR(A{r}=\"\",C{r}=0),\"\",B{r}/C{r})",
    "Q": "=IF(OR(A{r}=\"\",B{r}=0),\"\",K{r}/B{r})",
}
FMT = {"B": "#,##0.00", "E": "#,##0.00", "F": "#,##0.00", "G": "#,##0.00", "H": "#,##0.00", "I": "#,##0.00", "J": "#,##0.00",
       "K": "#,##0.00", "L": "#,##0.00", "M": "#,##0.00", "N": "0.00\"x\"", "O": "0.0%", "P": "#,##0.00", "Q": "0.0%"}

wb = Workbook()
how = wb.active
how.title = "Start here"
steps = [
    "E-commerce Helix: your daily numbers sheet",
    "",
    "1. Click the Daily tab at the bottom.",
    "2. Each morning, fill in one row for yesterday. Only the yellow boxes.",
    "3. The blue boxes work themselves out. Don't type in them.",
    "4. Profit is the number that matters most. Green means you made money, red means you lost money.",
    "5. Once a week, open the Summary tab to see your totals.",
    "",
    "What the words mean:",
    "ROAS: sales for each $1 of ads. 3x means $3 of sales for every $1 spent.",
    "Conversion rate: out of every 100 visits, how many bought.",
    "AOV: average order value, how much one order is worth.",
    "MER: ad spend as a share of sales. Lower is better. Helix shows your safe limit in Profit.",
    "",
    "Google Sheets: File > Import > Upload this file. Excel and Numbers open it directly.",
]
for i, t in enumerate(steps, 1):
    how.cell(row=i, column=1, value=t).font = Font(bold=(i == 1), size=14 if i == 1 else 12)
how.column_dimensions["A"].width = 100

ws = wb.create_sheet("Daily")
for c, (name, kind, note) in enumerate(cols, 1):
    cell = ws.cell(row=1, column=c, value=name)
    cell.font = HEAD
    cell.alignment = Alignment(wrap_text=True)
    ws.cell(row=2, column=c, value=note).font = Font(italic=True, color="64748B", size=9)
    ws.cell(row=2, column=c).alignment = Alignment(wrap_text=True, vertical="top")
    ws.column_dimensions[cell.column_letter].width = 15
ws.row_dimensions[2].height = 48
ws.freeze_panes = "B3"
for r in range(3, 3 + ROWS):
    for c, (_, kind, _) in enumerate(cols, 1):
        cell = ws.cell(row=r, column=c)
        cell.fill = INPUT if kind == "in" else CALC
        L = cell.column_letter
        if L in FORMULAS:
            cell.value = FORMULAS[L].format(r=r)
        if L in FMT:
            cell.number_format = FMT[L]
        if L == "A":
            cell.number_format = "yyyy-mm-dd"
last = 2 + ROWS
ws.conditional_formatting.add(f"M3:M{last}", FormulaRule(formula=[f'AND(ISNUMBER(M3),M3<0)'], fill=PatternFill("solid", fgColor="FDE2E2")))
ws.conditional_formatting.add(f"M3:M{last}", FormulaRule(formula=[f'AND(ISNUMBER(M3),M3>0)'], fill=PatternFill("solid", fgColor="DCFCE7")))
dv = DataValidation(type="decimal", operator="greaterThanOrEqual", formula1="0", allow_blank=True, error="Please type a number, 0 or more.")
ws.add_data_validation(dv)
dv.add(f"B3:J{last}")

sm = wb.create_sheet("Summary")
rng = lambda L: f"Daily!{L}3:{L}{last}"
summary = [
    ("Days filled in", f"=COUNT({rng('A')})", "0"),
    ("Sales", f"=SUM({rng('B')})", "#,##0.00"),
    ("Orders", f"=SUM({rng('C')})", "#,##0"),
    ("Visits", f"=SUM({rng('D')})", "#,##0"),
    ("Ad spend", f"=SUM({rng('K')})", "#,##0.00"),
    ("Total costs", f"=SUM({rng('L')})", "#,##0.00"),
    ("Profit", f"=SUM({rng('M')})", "#,##0.00"),
    ("ROAS", "=IF(B6=0,\"\",B3/B6)", "0.00\"x\""),
    ("Conversion rate", "=IF(B5=0,\"\",B4/B5)", "0.0%"),
    ("AOV", "=IF(B4=0,\"\",B3/B4)", "#,##0.00"),
    ("MER", "=IF(B3=0,\"\",B6/B3)", "0.0%"),
    ("Profit per order", "=IF(B4=0,\"\",B8/B4)", "#,##0.00"),
]
sm.cell(row=1, column=1, value="Your totals for every day you filled in").font = HEAD
for i, (k, f, fmt) in enumerate(summary, 2):
    sm.cell(row=i, column=1, value=k).font = Font(bold=True)
    c = sm.cell(row=i, column=2, value=f)
    c.number_format = fmt
    c.fill = CALC
sm.column_dimensions["A"].width = 24
sm.column_dimensions["B"].width = 18

OUT.mkdir(parents=True, exist_ok=True)
wb.save(OUT / "helix-metrics-tracker.xlsx")

# CSV version: same columns, formulas as text for row 2 (works when imported into Google Sheets).
import csv
with open(OUT / "helix-metrics-tracker.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow([c[0] for c in cols])
    for r in range(2, 2 + 31):
        row = ["", "", "", "", "", "", "", "", "", ""]
        row += [FORMULAS[L].format(r=r) for L in "KLMNOPQ"]
        w.writerow(row)
print("ok")
