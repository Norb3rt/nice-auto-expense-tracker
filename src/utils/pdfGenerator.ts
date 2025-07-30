import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { Expense } from '../types';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface ReportOptions {
  period: 'monthly' | 'yearly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  includeCharts?: boolean;
  groupBy?: 'category' | 'date' | 'amount';
}

export const generatePDFReport = async (expenses: Expense[], options: ReportOptions): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Filter expenses based on period
  let filteredExpenses = filterExpensesByPeriod(expenses, options);
  
  // Filter by categories if specified
  if (options.categories && options.categories.length > 0) {
    filteredExpenses = filteredExpenses.filter(expense => 
      options.categories!.includes(expense.category)
    );
  }

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue color
  doc.text('NiceAuto Expense Report', 20, 25);
  
  // Report period
  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99); // Gray color
  const periodText = getPeriodText(options);
  doc.text(periodText, 20, 35);
  
  // Summary statistics
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;
  const categoryCount = new Set(filteredExpenses.map(e => e.category)).size;
  
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39); // Dark gray
  doc.text('Summary', 20, 50);
  
  doc.setFontSize(11);
  doc.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 20, 60);
  doc.text(`Number of Transactions: ${filteredExpenses.length}`, 20, 68);
  doc.text(`Average Transaction: $${avgAmount.toFixed(2)}`, 20, 76);
  doc.text(`Categories: ${categoryCount}`, 20, 84);
  
  // Category breakdown
  const categoryTotals = getCategoryTotals(filteredExpenses);
  const categoryData = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Top 10 categories
  
  if (categoryData.length > 0) {
    doc.setFontSize(14);
    doc.text('Top Categories', 20, 100);
    
    const categoryTableData = categoryData.map(([category, amount]) => [
      category,
      `$${amount.toFixed(2)}`,
      `${((amount / totalAmount) * 100).toFixed(1)}%`
    ]);
    
    autoTable(doc, {
      startY: 105,
      head: [['Category', 'Amount', 'Percentage']],
      body: categoryTableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      }
    });
  }
  
  // Detailed transactions table
  if (filteredExpenses.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || 140;
    
    doc.setFontSize(14);
    doc.text('Detailed Transactions', 20, finalY + 20);
    
    const transactionData = filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50) // Limit to 50 most recent transactions
      .map(expense => [
        format(new Date(expense.date), 'MMM dd, yyyy'),
        expense.description,
        expense.category,
        `$${expense.amount.toFixed(2)}`
      ]);
    
    autoTable(doc, {
      startY: finalY + 25,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: transactionData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { halign: 'right', cellWidth: 25 }
      }
    });
  }

  // Add charts if requested
  if (options.includeCharts) {
    doc.addPage();
    doc.setFontSize(20);
    doc.text('Charts', 20, 25);

    const pieChartElement = document.getElementById('pie-chart-container');
    if (pieChartElement) {
      const canvas = await html2canvas(pieChartElement);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 40, 170, 100);
    }

    const barChartElement = document.getElementById('bar-chart-container');
    if (barChartElement) {
      const canvas = await html2canvas(barChartElement);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 150, 170, 100);
    }

    const lineChartElement = document.getElementById('line-chart-container');
    if (lineChartElement) {
      doc.addPage();
      const canvas = await html2canvas(lineChartElement);
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 40, 170, 100);
    }
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generated on ${format(new Date(), 'MMM dd, yyyy')} - Page ${i} of ${pageCount}`,
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    );
  }
  
  // Save the PDF
  const fileName = `expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

const filterExpensesByPeriod = (expenses: Expense[], options: ReportOptions): Expense[] => {
  const now = new Date();
  
  switch (options.period) {
    case 'monthly':
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
      
    case 'yearly':
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= yearStart && expenseDate <= yearEnd;
      });
      
    case 'custom':
      if (options.startDate && options.endDate) {
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= options.startDate! && expenseDate <= options.endDate!;
        });
      }
      return expenses;
      
    default:
      return expenses;
  }
};

const getPeriodText = (options: ReportOptions): string => {
  const now = new Date();
  
  switch (options.period) {
    case 'monthly':
      return `Monthly Report - ${format(now, 'MMMM yyyy')}`;
    case 'yearly':
      return `Yearly Report - ${format(now, 'yyyy')}`;
    case 'custom':
      if (options.startDate && options.endDate) {
        return `Custom Report - ${format(options.startDate, 'MMM dd, yyyy')} to ${format(options.endDate, 'MMM dd, yyyy')}`;
      }
      return 'Custom Report';
    default:
      return 'Expense Report';
  }
};

const getCategoryTotals = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
};

export const generateMonthlyComparison = (expenses: Expense[]): void => {
  const doc = new jsPDF();
  const now = new Date();
  
  // Get last 12 months of data
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    monthlyData.push({
      month: format(month, 'MMM yyyy'),
      total,
      count: monthExpenses.length
    });
  }
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('Monthly Expense Comparison', 20, 25);
  
  // Monthly comparison table
  const tableData = monthlyData.map(data => [
    data.month,
    data.count.toString(),
    `$${data.total.toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: 40,
    head: [['Month', 'Transactions', 'Total Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    styles: { fontSize: 11 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' }
    }
  });
  
  doc.save(`monthly-comparison-${format(now, 'yyyy-MM-dd')}.pdf`);
};