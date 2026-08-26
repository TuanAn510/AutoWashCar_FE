export const formatLicensePlateDisplay = (value: string) => {
  const cleaned = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  const match = cleaned.match(/^(\d{2}[A-Z]{1,2})(\d{4,5})$/);

  if (!match) {
    return value.toUpperCase();
  }

  return `${match[1]}-${match[2]}`;
};
