import React from "react";

export default function CouponCard({ coupon, index }) {
  const disp = coupon.displayOptions || {
    showLogo: true,
    showLabel: true,
    showDate: true,
    showBatch: true,
    showExp: true,
    showPrice: true,
    showMenu: true,
    showNutrition: true,
    showCode: coupon.showCode !== false,
    showNumbering: coupon.showNumbering !== false,
    showFooterText: true,
    showFooterLogos: true,
    showFooterNumber: coupon.showFooterNumber === true,
    fontBase: 16
  };

  const themeClass = `theme-${coupon.theme || "blue"}`;
  const footerLogos = coupon.footerLogos || [];
  const hasExtraLogos = disp.showFooterLogos !== false && footerLogos.length > 0;

  const hasFooter = disp.showFooterText !== false || disp.showFooterNumber;

  const labelInlineVars = {
    "--coupon-font": `${Number(disp.fontBase) || 16}px`
  };

  return (
    <article
      className={`coupon-card ${themeClass}`}
      style={labelInlineVars}
    >
      <div className="coupon-header">
        {/* Left: main logo + label text */}
        <div className="coupon-header-brand">
          {coupon.logoUrl && disp.showLogo !== false && (
            <img src={coupon.logoUrl} alt="Logo" className="coupon-logo-img" />
          )}
          <div>
            {disp.showLabel !== false && (
              <div className="coupon-label">{coupon.label || " "}</div>
            )}
            <div className="coupon-title">LABEL INFORMASI MAKANAN</div>
          </div>
        </div>

        {/* Right: extra logos + numbering */}
        <div className="coupon-header-right">
          {hasExtraLogos && (
            <div className="coupon-header-extra-logos">
              {footerLogos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Logo ${i + 1}`}
                  className="coupon-header-extra-logo-img"
                />
              ))}
            </div>
          )}
          {disp.showNumbering !== false && (
            <div className="coupon-number">#{coupon.number}</div>
          )}
        </div>
      </div>

      <div className="coupon-body">
        <div className="coupon-main-content">
          <div className="coupon-left-col">
            {(disp.showDate !== false || (disp.showBatch !== false && coupon.batch)) && (
              <div className="coupon-date-row">
                {disp.showDate !== false && (
                  <div className="coupon-date">
                    <span>Tanggal</span>
                    <strong>{coupon.dateLabel || "-"}</strong>
                  </div>
                )}
                {disp.showBatch !== false && coupon.batch && (
                  <div className="coupon-batch">
                    <span>Batch</span>
                    <strong>{coupon.batch}</strong>
                  </div>
                )}
              </div>
            )}

            {disp.showMenu !== false && (
              <div className="coupon-menu-container">
                <span className="coupon-menu-tag">MENU</span>
                {coupon.menuItems && coupon.menuItems.length > 0 ? (
                  <div className="coupon-menu-items-list">
                    {coupon.menuItems.map((item, i) => (
                      <div key={i} className="coupon-menu-item-line">
                        <span className="coupon-menu-item-name">
                          {i + 1}. {item.name}
                        </span>
                        {item.price && (
                          <span className="coupon-menu-item-price">{item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="coupon-menu-name">{coupon.menuName || "-"}</div>
                )}
              </div>
            )}

            {((disp.showExp !== false && coupon.exp) || (disp.showPrice !== false && coupon.price)) && (
              <div className="coupon-extra-row">
                {disp.showExp !== false && coupon.exp && (
                  <div className="coupon-exp">
                    <span>EXP</span>
                    <strong>{coupon.exp}</strong>
                  </div>
                )}
                {disp.showPrice !== false && coupon.price && (
                  <div className="coupon-price">
                    <span>HARGA</span>
                    <strong>{coupon.price}</strong>
                  </div>
                )}
              </div>
            )}

            {disp.showNotes !== false && coupon.notes && (
              <div className="coupon-notes-container">
                <span className="coupon-notes-tag">KETERANGAN</span>
                <div className="coupon-notes-text">{coupon.notes}</div>
              </div>
            )}
          </div>

          {disp.showNutrition !== false && (disp.showNutritionLarge !== false || disp.showNutritionSmall !== false) && (() => {
            const showLarge = disp.showNutritionLarge !== false;
            const showSmall = disp.showNutritionSmall !== false;
            const cols = showLarge && showSmall ? "1fr 1fr 1fr" : "1fr 1fr";
            const nutritionRows = [
              { key: "energy", label: "Energi", unitLarge: "kcal", unitSmall: "kcal",
                vLarge: coupon.nutrition?.large?.energy || coupon.nutrition?.energy || "0",
                vSmall: coupon.nutrition?.small?.energy || "0" },
              { key: "protein", label: "Protein", unitLarge: "g", unitSmall: "g",
                vLarge: coupon.nutrition?.large?.protein || coupon.nutrition?.protein || "0",
                vSmall: coupon.nutrition?.small?.protein || "0" },
              { key: "fat", label: "Lemak", unitLarge: "g", unitSmall: "g",
                vLarge: coupon.nutrition?.large?.fat || coupon.nutrition?.fat || "0",
                vSmall: coupon.nutrition?.small?.fat || "0" },
              { key: "carbs", label: "Karbo", unitLarge: "g", unitSmall: "g",
                vLarge: coupon.nutrition?.large?.carbs || coupon.nutrition?.carbs || "0",
                vSmall: coupon.nutrition?.small?.carbs || "0" },
              { key: "fiber", label: "Serat", unitLarge: "g", unitSmall: "g",
                vLarge: coupon.nutrition?.large?.fiber || coupon.nutrition?.fiber || "0",
                vSmall: coupon.nutrition?.small?.fiber || "0" }
            ];
            return (
              <div className="coupon-right-col">
                <span className="nutrition-header-title">NILAI GIZI</span>
                <div className="nutrition-vertical-list" style={{ "--nut-cols": cols }}>
                  <div className="nutrition-header-row" style={{ gridTemplateColumns: cols }}>
                    <span className="nutrition-col-name">Gizi</span>
                    {showLarge && <span className="nutrition-col-val title">Besar</span>}
                    {showSmall && <span className="nutrition-col-val title">Kecil</span>}
                  </div>
                  {nutritionRows.map((row) => (
                    <div key={row.key} className="nutrition-item" style={{ gridTemplateColumns: cols }}>
                      <span className="nutrition-col-name">{row.label}</span>
                      {showLarge && <b className="nutrition-col-val">{row.vLarge} <small>{row.unitLarge}</small></b>}
                      {showSmall && <b className="nutrition-col-val">{row.vSmall} <small>{row.unitSmall}</small></b>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {disp.showCode !== false && (
          <div className="coupon-code-row">
            <div>
              <small>KODE LABEL</small>
              <strong>{coupon.code}</strong>
            </div>
            <div className="fake-qr" aria-label="QR placeholder">
              <span>{coupon.code.slice(0, 4)}</span>
              <span>{coupon.code.slice(4, 8)}</span>
              <span>{coupon.code.slice(8)}</span>
            </div>
          </div>
        )}
      </div>

      {hasFooter && (
        <div className="coupon-footer">
          <div className="coupon-footer-left">
            {disp.showFooterText !== false && (
              <span>Harap dipedomani sesuai ketentuan konsumsi makanan.</span>
            )}
          </div>
          {disp.showFooterNumber && (
            <span className="footer-print-number">{index}</span>
          )}
        </div>
      )}
    </article>
  );
}