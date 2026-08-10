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
    showFooterNumber: coupon.showFooterNumber === true
  };

  const themeClass = `theme-${coupon.theme || "blue"}`;

  return (
    <article className={`coupon-card ${themeClass}`}>
      <div className="coupon-header">
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
        {disp.showNumbering !== false && (
          <div className="coupon-number">#{coupon.number}</div>
        )}
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
                <div className="coupon-menu-name">{coupon.menuName || "-"}</div>
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

          {disp.showNutrition !== false && (
            <div className="coupon-right-col">
              <span className="nutrition-header-title">NILAI GIZI</span>
              <div className="nutrition-vertical-list">
                <div className="nutrition-item">
                  <span>Energi</span>
                  <b>{coupon.nutrition?.energy || "0"} kcal</b>
                </div>
                <div className="nutrition-item">
                  <span>Protein</span>
                  <b>{coupon.nutrition?.protein || "0"} g</b>
                </div>
                <div className="nutrition-item">
                  <span>Lemak</span>
                  <b>{coupon.nutrition?.fat || "0"} g</b>
                </div>
                <div className="nutrition-item">
                  <span>Karbohidrat</span>
                  <b>{coupon.nutrition?.carbs || "0"} g</b>
                </div>
                <div className="nutrition-item">
                  <span>Serat</span>
                  <b>{coupon.nutrition?.fiber || "0"} g</b>
                </div>
              </div>
            </div>
          )}
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

      {(disp.showFooterText !== false || disp.showFooterNumber) && (
        <div className="coupon-footer">
          {disp.showFooterText !== false ? (
            <span>Harap dipedomani sesuai ketentuan konsumsi makanan.</span>
          ) : (
            <span></span>
          )}
          {disp.showFooterNumber && (
            <span>{index}</span>
          )}
        </div>
      )}
    </article>
  );
}