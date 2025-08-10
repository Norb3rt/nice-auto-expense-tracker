import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import i18n from '../i18n';

const getDateLocale = () => {
  const language = i18n.language;
  return language === 'es' ? es : enUS;
};

export const formatCurrency = (amount: number): string => {
  const language = i18n.language;
  
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (value: number): string => {
  const language = i18n.language;
  
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US').format(value);
};

export const formatPercentage = (value: number): string => {
  const language = i18n.language;
  
  return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

export const formatDate = (date: Date, dateFormat: string = 'PPP'): string => {
  return format(date, dateFormat, { locale: getDateLocale() });
};

export const formatDateShort = (date: Date): string => {
  const language = i18n.language;
  const formatString = language === 'es' ? 'dd MMM yyyy' : 'MMM dd, yyyy';
  return format(date, formatString, { locale: getDateLocale() });
};

export const formatMonthYear = (date: Date): string => {
  const language = i18n.language;
  const formatString = language === 'es' ? "MMMM 'de' yyyy" : 'MMMM yyyy';
  return format(date, formatString, { locale: getDateLocale() });
};
