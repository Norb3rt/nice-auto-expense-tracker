# Internationalization (i18n) Implementation

This document describes the comprehensive Spanish localization implementation for the NiceAuto Expense Tracker application.

## Overview

The application now supports full internationalization with English and Spanish languages, including:
- ✅ Complete UI translation
- ✅ Dynamic content localization
- ✅ Localized PDF and CSV exports
- ✅ Currency and date formatting
- ✅ Language switcher with persistence
- ✅ Browser language auto-detection

## Technical Implementation

### 1. Core i18n Setup

**Library**: `react-i18next` with browser language detection
**Configuration**: [`src/i18n/index.ts`](src/i18n/index.ts)

```typescript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, es: { translation: es } },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });
```

### 2. Translation Files

**English**: [`src/i18n/locales/en.json`](src/i18n/locales/en.json)
**Spanish**: [`src/i18n/locales/es.json`](src/i18n/locales/es.json)

Translation keys are organized by feature:
- `common` - Shared terms (save, cancel, edit, etc.)
- `navigation` - Menu items and navigation
- `auth` - Authentication related text
- `dashboard` - Dashboard specific content
- `expenseForm` - Expense form labels and messages
- `expenseList` - Expense list interface
- `reports` - Reports and analytics
- `categories` - Expense categories
- `pdf` - PDF export content
- `formats` - Date and currency formats

### 3. Components Updated

All components have been updated to use the `useTranslation` hook:

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
};
```

**Updated Components**:
- ✅ Header with language switcher
- ✅ Sidebar navigation
- ✅ Login/Authentication
- ✅ Dashboard
- ✅ Expense Form (including categories)
- ✅ Expense List
- ✅ Reports and Analytics
- ✅ Report Filters
- ✅ Mobile Navigation

### 4. Language Switcher

**Component**: [`src/components/LanguageSwitcher.tsx`](src/components/LanguageSwitcher.tsx)

Features:
- Dropdown menu with flag icons
- Persistent language selection (localStorage)
- Mobile responsive design
- Hover interactions

### 5. Localized Formatting

**Utility**: [`src/utils/formatting.ts`](src/utils/formatting.ts)

```typescript
export const formatCurrency = (amount: number): string => {
  const language = i18n.language;
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
```

**Functions Available**:
- `formatCurrency()` - Localized currency display
- `formatNumber()` - Number formatting with locale
- `formatPercentage()` - Percentage formatting
- `formatDate()` - Date formatting with locale
- `formatDateShort()` - Short date format
- `formatMonthYear()` - Month/year display

### 6. PDF Export Localization

**Updated**: [`src/utils/pdfGenerator.ts`](src/utils/pdfGenerator.ts)

All PDF content is now translatable:
- Report titles and headers
- Table column headers
- Summary sections
- Chart titles
- Footer with generation date
- Monthly comparison reports

Example:
```typescript
doc.text(i18n.t('pdf.reportTitle'), 20, 25);
doc.text(i18n.t('pdf.generatedOn', { date: format(new Date(), 'MMM dd, yyyy') }));
```

## Spanish Translations

### Category Names
| English | Spanish |
|---------|---------|
| Food & Dining | Comida y Restaurantes |
| Transportation | Transporte |
| Shopping | Compras |
| Entertainment | Entretenimiento |
| Bills & Utilities | Facturas y Servicios |
| Healthcare | Salud |
| Travel | Viajes |
| Education | Educación |
| Housing | Vivienda |
| Other | Otros |

### Key Interface Elements
| English | Spanish |
|---------|---------|
| Dashboard | Panel Principal |
| Add Expense | Agregar Gasto |
| All Expenses | Todos los Gastos |
| Reports | Reportes |
| Total Expenses | Gastos Totales |
| Generate PDF Report | Generar Reporte PDF |
| Export CSV | Exportar CSV |

### Dynamic Content Examples
- "You spent $150.00 more than last month" → "Gastaste $150.00 más que el mes pasado"
- "Showing 25 expenses • Total: $1,250.00" → "Mostrando 25 gastos • Total: $1,250.00"
- "Generated on Jul 30, 2025" → "Generado el 30 jul 2025"

## Best Practices Implemented

### 1. Organized Translation Keys
```typescript
// Good: Namespaced and descriptive
t('expenseForm.addButton')
t('reports.monthlyComparison')

// Avoid: Flat or unclear keys
t('add')
t('comparison')
```

### 2. Interpolation for Dynamic Content
```typescript
// Dynamic values
t('expenseList.showingExpenses', { count: 25, total: '$1,250.00' })
t('analytics.spentMore', { amount: '$150.00' })
```

### 3. Consistent Formatting
- Currency: Always use `formatCurrency()` utility
- Dates: Use appropriate date formatting functions
- Numbers: Use `formatNumber()` for large numbers

### 4. Mobile Optimization
- Language switcher adapts to screen size
- Translated content considers text expansion
- Spanish text typically 20-30% longer than English

## Usage Examples

### Basic Translation
```typescript
const { t } = useTranslation();
return <button>{t('common.save')}</button>;
```

### With Interpolation
```typescript
const { t } = useTranslation();
const message = t('analytics.spentMore', { 
  amount: formatCurrency(150.00) 
});
```

### Language Switching
```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
};
```

## Maintenance Guidelines

### Adding New Translations
1. Add keys to both `en.json` and `es.json`
2. Use descriptive, namespaced keys
3. Test with long Spanish text
4. Update this documentation

### Best Practices for New Components
1. Import `useTranslation` hook
2. Use `t()` function for all user-visible text
3. Use interpolation for dynamic content
4. Apply formatting utilities for numbers/dates
5. Test in both languages

### Testing Checklist
- [ ] Switch between languages
- [ ] Check text expansion/overflow
- [ ] Verify PDF exports in both languages
- [ ] Test mobile responsiveness
- [ ] Validate currency and date formatting
- [ ] Confirm persistence after page reload

## Future Enhancements

### Recommended Additions
1. **Pluralization Rules**: For complex counting scenarios
2. **Additional Locales**: Support for more Spanish variants (mx, ar, co)
3. **RTL Support**: For languages like Arabic in the future
4. **Context-Aware Translations**: Different translations based on context
5. **Translation Management**: Integration with services like Crowdin or Lokalise

### Performance Optimizations
1. **Lazy Loading**: Load translations on demand
2. **Translation Caching**: Cache frequently used translations
3. **Bundle Splitting**: Separate translation bundles by language

## Support

The internationalization implementation provides:
- ✅ Complete Spanish translation coverage
- ✅ Professional localization quality
- ✅ Responsive design compatibility
- ✅ Export functionality in multiple languages
- ✅ Persistent user preferences
- ✅ Automatic browser language detection

For technical issues or translation updates, refer to the source files in `src/i18n/locales/`.
