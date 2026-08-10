import React from "react";

export default function CouponCard({ coupon, index }) {
  return (
    <article className="coupon-card">
      <div className="coupon-header">
        <div>
          <div className="coupon-label">{coupon.label}</div>
          <div className="coupon-title">LABEL KONSUMSI</div>
        </div>
        {coupon.showNumbering !== false && (
          <div className="coupon-number">#{coupon.number}</div>
        )}
      </div>

      <div className="coupon-body">
        <div className="coupon-main-content">
          <div className="coupon-left-col">
            <div className="coupon-date">
              <span>Tanggal</span>
              <strong>{coupon.dateLabel}</strong>
            </div>

            <div className="coupon-menu-container">
              <span className="coupon-menu-tag">MENU</span>
              <div className="coupon-menu-name">{coupon.menuName || "-"}</div>
            </div>
          </div>

          <div className="coupon-right-col">
            <span className="nutrition-header-title">NILAI GIZI</span>
            <div className="nutrition-vertical-list">
              <div className="nutrition-item">
                <span>Energi</span>
                <b>{coupon.nutrition.energy} kcal</b>
              </div>
              <div className="nutrition-item">
                <span>Protein</span>
                <b>{coupon.nutrition.protein} g</b>
              </div>
              <div className="nutrition-item">
                <span>Lemak</span>
                <b>{coupon.nutrition.fat} g</b>
              </div>
              <div className="nutrition-item">
                <span>Karbohidrat</span>
                <b>{coupon.nutrition.carbs} g</b>
              </div>
              <div className="nutrition-item">
                <span>Serat</span>
                <b>{coupon.nutrition.fiber} g</b>
              </div>
            </div>
          </div>
        </div>

        {coupon.showCode !== false && (
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

      <div className="coupon-footer">
        <span>Harap dipedomani sesuai ketentuan konsumsi makanan.</span>
        {coupon.showFooterNumber !== false && (
          <span>{index}</span>
        )}
      </div>
    </article>
  );
}