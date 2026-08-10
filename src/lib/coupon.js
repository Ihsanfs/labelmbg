export function padNumber(number, size = 6) {
  return String(number).padStart(size, "0");
}

export function randomCode(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

export function makeCoupon({ index, label, menuName, date, nutrition, showCode, showNumbering, showFooterNumber }) {
  const code = randomCode(10);
  return {
    id: `${Date.now()}-${index}-${code}`,
    number: padNumber(index),
    code,
    label,
    menuName,
    date,
    nutrition,
    showCode,
    showNumbering,
    showFooterNumber
  };
}

export function generateCoupons({ quantity, label, menuName, date, nutrition, showCode, showNumbering }) {
  return Array.from({ length: quantity }, (_, i) =>
    makeCoupon({
      index: i + 1,
      label,
      menuName,
      date,
      nutrition,
      showCode,
      showNumbering
    })
  );
}

export function formatDateID(dateString) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).forma