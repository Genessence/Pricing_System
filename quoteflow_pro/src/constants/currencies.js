// Comprehensive list of world currencies
export const WORLD_CURRENCIES = [
  // Major Currencies
  { value: "USD", label: "USD - US Dollar", symbol: "$", country: "United States" },
  { value: "EUR", label: "EUR - Euro", symbol: "€", country: "European Union" },
  { value: "GBP", label: "GBP - British Pound", symbol: "£", country: "United Kingdom" },
  { value: "JPY", label: "JPY - Japanese Yen", symbol: "¥", country: "Japan" },
  { value: "CHF", label: "CHF - Swiss Franc", symbol: "Fr", country: "Switzerland" },
  { value: "CAD", label: "CAD - Canadian Dollar", symbol: "C$", country: "Canada" },
  { value: "AUD", label: "AUD - Australian Dollar", symbol: "A$", country: "Australia" },
  
  // Asia Pacific
  { value: "CNY", label: "CNY - Chinese Yuan", symbol: "¥", country: "China" },
  { value: "INR", label: "INR - Indian Rupee", symbol: "₹", country: "India" },
  { value: "KRW", label: "KRW - South Korean Won", symbol: "₩", country: "South Korea" },
  { value: "SGD", label: "SGD - Singapore Dollar", symbol: "S$", country: "Singapore" },
  { value: "HKD", label: "HKD - Hong Kong Dollar", symbol: "HK$", country: "Hong Kong" },
  { value: "MYR", label: "MYR - Malaysian Ringgit", symbol: "RM", country: "Malaysia" },
  { value: "THB", label: "THB - Thai Baht", symbol: "฿", country: "Thailand" },
  { value: "IDR", label: "IDR - Indonesian Rupiah", symbol: "Rp", country: "Indonesia" },
  { value: "PHP", label: "PHP - Philippine Peso", symbol: "₱", country: "Philippines" },
  { value: "VND", label: "VND - Vietnamese Dong", symbol: "₫", country: "Vietnam" },
  { value: "TWD", label: "TWD - Taiwan Dollar", symbol: "NT$", country: "Taiwan" },
  
  // Middle East & Africa
  { value: "AED", label: "AED - UAE Dirham", symbol: "د.إ", country: "UAE" },
  { value: "SAR", label: "SAR - Saudi Riyal", symbol: "﷼", country: "Saudi Arabia" },
  { value: "QAR", label: "QAR - Qatari Riyal", symbol: "﷼", country: "Qatar" },
  { value: "KWD", label: "KWD - Kuwaiti Dinar", symbol: "د.ك", country: "Kuwait" },
  { value: "BHD", label: "BHD - Bahraini Dinar", symbol: ".د.ب", country: "Bahrain" },
  { value: "OMR", label: "OMR - Omani Rial", symbol: "﷼", country: "Oman" },
  { value: "ILS", label: "ILS - Israeli Shekel", symbol: "₪", country: "Israel" },
  { value: "EGP", label: "EGP - Egyptian Pound", symbol: "£", country: "Egypt" },
  { value: "ZAR", label: "ZAR - South African Rand", symbol: "R", country: "South Africa" },
  { value: "TRY", label: "TRY - Turkish Lira", symbol: "₺", country: "Turkey" },
  
  // Europe
  { value: "NOK", label: "NOK - Norwegian Krone", symbol: "kr", country: "Norway" },
  { value: "SEK", label: "SEK - Swedish Krona", symbol: "kr", country: "Sweden" },
  { value: "DKK", label: "DKK - Danish Krone", symbol: "kr", country: "Denmark" },
  { value: "PLN", label: "PLN - Polish Zloty", symbol: "zł", country: "Poland" },
  { value: "CZK", label: "CZK - Czech Koruna", symbol: "Kč", country: "Czech Republic" },
  { value: "HUF", label: "HUF - Hungarian Forint", symbol: "Ft", country: "Hungary" },
  { value: "RON", label: "RON - Romanian Leu", symbol: "lei", country: "Romania" },
  { value: "BGN", label: "BGN - Bulgarian Lev", symbol: "лв", country: "Bulgaria" },
  { value: "RUB", label: "RUB - Russian Ruble", symbol: "₽", country: "Russia" },
  { value: "UAH", label: "UAH - Ukrainian Hryvnia", symbol: "₴", country: "Ukraine" },
  
  // Americas
  { value: "MXN", label: "MXN - Mexican Peso", symbol: "$", country: "Mexico" },
  { value: "BRL", label: "BRL - Brazilian Real", symbol: "R$", country: "Brazil" },
  { value: "ARS", label: "ARS - Argentine Peso", symbol: "$", country: "Argentina" },
  { value: "CLP", label: "CLP - Chilean Peso", symbol: "$", country: "Chile" },
  { value: "COP", label: "COP - Colombian Peso", symbol: "$", country: "Colombia" },
  { value: "PEN", label: "PEN - Peruvian Sol", symbol: "S/", country: "Peru" },
  
  // Other Notable Currencies
  { value: "NZD", label: "NZD - New Zealand Dollar", symbol: "NZ$", country: "New Zealand" },
  { value: "XOF", label: "XOF - West African Franc", symbol: "Fr", country: "West Africa" },
  { value: "XAF", label: "XAF - Central African Franc", symbol: "Fr", country: "Central Africa" }
];

// Get currency options formatted for Select component
export const getCurrencyOptions = () => {
  return WORLD_CURRENCIES?.map(currency => ({
    value: currency?.value,
    label: currency?.label,
    description: `${currency?.symbol} - ${currency?.country}`
  }));
};

// Get currency symbol by code
export const getCurrencySymbol = (currencyCode) => {
  const currency = WORLD_CURRENCIES?.find(c => c?.value === currencyCode);
  return currency?.symbol || '$';
};