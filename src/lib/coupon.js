export function padNumber(number, size = 6) {
  return String(number).padStart(size, "0");
}

export function randomCode(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

export function makeCoupon({
  index,
  code: passedCode,
  label,
  menuName,
  menuItems,
  date,
  batch,
  exp,
  price,
  notes,
  logoUrl,
  footerLogos,
  theme,
  nutrition,
  displayOptions
}) {
  const code = passedCode || randomCode(10);
  return {
    id: `${Date.now()}-${index}-${code}`,
    number: padNumber(index),
    code,
    label: label || "",
    menuName: menuName || "",
    menuItems: menuItems || [],
    date: date || "",
    batch: batch || "",
    exp: exp || "",
    price: price || "",
    notes: notes || "",
    logoUrl: logoUrl || "",
    footerLogos: footerLogos || [],
    theme: theme || "blue",
    nutrition,
    displayOptions: displayOptions || {
      showLogo: true,
      showLabel: true,
      showDate: true,
      showBatch: true,
      showExp: true,
      showPrice: true,
      showNotes: true,
      showMenu: true,
      showNutrition: true,
      showCode: true,
      showNumbering: true,
      showFooterText: true,
      showFooterLogos: true,
      showFooterNumber: false
    }
  };
}

export function generateCoupons({
  quantity,
  code: userCode,
  label,
  menuName,
  menuItems,
  date,
  batch,
  exp,
  price,
  notes,
  logoUrl,
  footerLogos,
  theme,
  nutrition,
  displayOptions
}) {
  const batchCode = userCode || randomCode(10);
  return Array.from({ length: quantity }, (_, i) =>
    makeCoupon({
      index: i + 1,
      code: batchCode,
      label,
      menuName,
      menuItems,
      date,
      batch,
      exp,
      price,
      notes,
      logoUrl,
      footerLogos,
      theme,
      nutrition,
      displayOptions
    })
  );
}

export function formatDateID(dateString) {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${dateString}T00:00:00`));
}