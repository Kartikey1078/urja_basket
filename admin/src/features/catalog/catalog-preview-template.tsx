import type { CSSProperties } from "react";

import {
  CATALOG_BG_GRADIENT,
  CATALOG_CANVAS_HEIGHT,
  CATALOG_CANVAS_WIDTH,
  CATALOG_COLUMN_WIDTH,
  CATALOG_CONTENT_WIDTH,
  CATALOG_FOOTER_HEIGHT,
  CATALOG_GRID_GAP,
  CATALOG_GRID_ROWS,
  CATALOG_HEADER_HEIGHT,
  CATALOG_HEADER_PHONE_FONT,
  CATALOG_HEADER_PILL_FONT,
  CATALOG_HEADER_PILL_HEIGHT,
  CATALOG_HEADER_PILL_MIN_WIDTH,
  CATALOG_IMAGE_SIZE,
  CATALOG_LOGO_MARK_SRC,
  CATALOG_LOGO_SLOT,
  CATALOG_LOGO_SRC,
  CATALOG_NAME_FONT_SIZE,
  CATALOG_NAME_HEIGHT,
  CATALOG_NAME_LINE_HEIGHT,
  CATALOG_NAME_TO_QTY_GAP,
  CATALOG_PHONE,
  CATALOG_PLACEHOLDER_IMAGE,
  CATALOG_PRICE_FONT_SIZE,
  CATALOG_PRICE_MIN_WIDTH,
  CATALOG_QTY_FONT_SIZE,
  CATALOG_QTY_SLOT_HEIGHT,
  CATALOG_ROW_GAP,
  CATALOG_ROW_HEIGHT,
  CATALOG_SAFE_MARGIN,
  CATALOG_TEXTURE_BG,
  CATALOG_TRUST_BADGES,
  padCatalogColumn,
  splitCatalogColumns,
  type CatalogPayload,
  type CatalogProduct,
  type CatalogTheme,
} from "@/lib/catalog/constants";
import {
  catalogImageProxyUrl,
  formatCatalogDate,
  formatCatalogRatePrice,
} from "@/lib/catalog/format";

type CatalogPreviewTemplateProps = {
  catalog: CatalogPayload;
  title: string;
  theme: CatalogTheme;
  pageIndex?: number;
  totalPages?: number;
};

function LeafIcon({ color }: { color: string }) {
  return (
    <span style={{ display: "inline-block", width: 12, height: 12, margin: "0 4px" }}>
      <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
        <path
          fill={color}
          d="M12 2C8 6 4 8 4 14c0 4 3.5 7 8 8 4.5-1 8-4 8-8 0-6-4-8-8-12z"
        />
      </svg>
    </span>
  );
}

function HeaderLogoSlot({
  src,
  alt,
  emoji,
  theme,
}: {
  src: string;
  alt: string;
  emoji: string;
  theme: CatalogTheme;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>
        {emoji}
      </span>
      <div
        style={{
          width: CATALOG_LOGO_SLOT,
          height: CATALOG_LOGO_SLOT,
          minWidth: CATALOG_LOGO_SLOT,
          borderRadius: 14,
          background: "#ffffff",
          border: `2px solid ${theme.accentGold}`,
          boxShadow: "0 3px 12px rgba(26, 77, 46, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 6,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      </div>
    </div>
  );
}

function ProductRow({
  product,
  theme,
  isLast,
  empty,
  stripe,
}: {
  product: CatalogProduct | null;
  theme: CatalogTheme;
  isLast?: boolean;
  empty?: boolean;
  stripe?: boolean;
}) {
  if (empty || !product) {
    return (
      <li
        aria-hidden
        style={{
          height: CATALOG_ROW_HEIGHT,
          minHeight: CATALOG_ROW_HEIGHT,
          listStyle: "none",
          visibility: "hidden",
        }}
      />
    );
  }

  const imgSrc = catalogImageProxyUrl(product.image) || CATALOG_PLACEHOLDER_IMAGE;
  const imageKey = `${product.id}-${product.image ?? "none"}`;
  const weightLabel = product.weight?.trim();

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: CATALOG_ROW_HEIGHT,
        minHeight: CATALOG_ROW_HEIGHT,
        maxHeight: CATALOG_ROW_HEIGHT,
        padding: "0 10px",
        boxSizing: "border-box",
        listStyle: "none",
        borderRadius: 10,
        backgroundColor: stripe ? "#faf8f4" : "#ffffff",
        borderBottom: isLast ? "none" : `1px solid ${theme.rowBorder}`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: CATALOG_IMAGE_SIZE,
          height: CATALOG_IMAGE_SIZE,
          minWidth: CATALOG_IMAGE_SIZE,
          minHeight: CATALOG_IMAGE_SIZE,
          flexShrink: 0,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#f8f4ec",
          border: `2px solid ${theme.accentGold}`,
          boxShadow: "0 2px 6px rgba(26,77,46,0.08)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={imageKey}
          src={imgSrc}
          alt={product.name}
          data-fallback={CATALOG_PLACEHOLDER_IMAGE}
          data-product-id={String(product.id)}
          width={CATALOG_IMAGE_SIZE}
          height={CATALOG_IMAGE_SIZE}
          style={{
            position: "absolute",
            inset: 0,
            width: CATALOG_IMAGE_SIZE,
            height: CATALOG_IMAGE_SIZE,
            objectFit: "cover",
            objectPosition: "center center",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: CATALOG_NAME_HEIGHT,
            maxHeight: CATALOG_NAME_HEIGHT,
            overflow: "hidden",
            fontSize: CATALOG_NAME_FONT_SIZE,
            fontWeight: 700,
            lineHeight: `${CATALOG_NAME_LINE_HEIGHT}px`,
            color: theme.forest,
            fontFamily: "Arial, Helvetica, sans-serif",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            height: CATALOG_QTY_SLOT_HEIGHT,
            minHeight: CATALOG_QTY_SLOT_HEIGHT,
            marginTop: CATALOG_NAME_TO_QTY_GAP,
            overflow: "hidden",
            fontSize: CATALOG_QTY_FONT_SIZE,
            fontWeight: 700,
            color: theme.accentGold,
            fontFamily: "Arial, Helvetica, sans-serif",
            lineHeight: `${CATALOG_QTY_SLOT_HEIGHT}px`,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {weightLabel || "\u00A0"}
        </div>
      </div>

      <span
        style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "5px 12px",
          borderRadius: 8,
          fontSize: CATALOG_PRICE_FONT_SIZE,
          fontWeight: 800,
          color: theme.forestDark,
          backgroundColor: "#fffbf0",
          border: `2px solid ${theme.accentGold}`,
          fontFamily: "Arial, Helvetica, sans-serif",
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          minWidth: CATALOG_PRICE_MIN_WIDTH,
          boxSizing: "border-box",
        }}
      >
        {formatCatalogRatePrice(product.price)}
      </span>
    </li>
  );
}

function ProductColumn({
  products,
  theme,
}: {
  products: Array<CatalogProduct | null>;
  theme: CatalogTheme;
}) {
  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        width: CATALOG_COLUMN_WIDTH,
        minWidth: CATALOG_COLUMN_WIDTH,
        display: "flex",
        flexDirection: "column",
        gap: CATALOG_ROW_GAP,
        listStyle: "none",
        boxSizing: "border-box",
      }}
    >
      {products.map((product, index) => (
        <ProductRow
          key={product ? product.id : `empty-${index}`}
          product={product}
          theme={theme}
          isLast={index === products.length - 1}
          empty={product === null}
          stripe={index % 2 === 1}
        />
      ))}
    </ul>
  );
}

export function CatalogPreviewTemplate({
  catalog,
  theme,
  pageIndex = 1,
  totalPages = 1,
}: CatalogPreviewTemplateProps) {
  const dateLabel = formatCatalogDate(catalog.generatedAt);
  const showPageBadge = totalPages > 1;
  const [leftProducts, rightProducts] = splitCatalogColumns(catalog.products);
  const leftCol = padCatalogColumn(leftProducts, CATALOG_GRID_ROWS);
  const rightCol = padCatalogColumn(rightProducts, CATALOG_GRID_ROWS);

  const rootStyle: CSSProperties = {
    width: CATALOG_CANVAS_WIDTH,
    height: CATALOG_CANVAS_HEIGHT,
    minWidth: CATALOG_CANVAS_WIDTH,
    minHeight: CATALOG_CANVAS_HEIGHT,
    maxWidth: CATALOG_CANVAS_WIDTH,
    maxHeight: CATALOG_CANVAS_HEIGHT,
    margin: "0 auto",
    overflow: "hidden",
    boxSizing: "border-box",
    position: "relative",
    background: CATALOG_BG_GRADIENT,
    backgroundImage: `${CATALOG_TEXTURE_BG}, ${CATALOG_BG_GRADIENT}`,
    backgroundSize: "28px 28px, auto",
    color: theme.forest,
    fontFamily: "Georgia, 'Times New Roman', serif",
    display: "flex",
    flexDirection: "column",
    padding: CATALOG_SAFE_MARGIN,
  };

  const headerPillBase: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: CATALOG_HEADER_PILL_MIN_WIDTH,
    minWidth: CATALOG_HEADER_PILL_MIN_WIDTH,
    height: CATALOG_HEADER_PILL_HEIGHT,
    minHeight: CATALOG_HEADER_PILL_HEIGHT,
    padding: "0 20px",
    borderRadius: 9999,
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: 800,
    letterSpacing: "0.02em",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
  };

  return (
    <div data-catalog-root style={rootStyle}>
      {/* Decorative corner emojis */}
      <span
        style={{ position: "absolute", top: 18, left: 18, fontSize: 28, opacity: 0.45 }}
        aria-hidden
      >
        🌿
      </span>
      <span
        style={{ position: "absolute", top: 18, right: 18, fontSize: 28, opacity: 0.45 }}
        aria-hidden
      >
        🍎
      </span>
      <span
        style={{ position: "absolute", bottom: 18, left: 18, fontSize: 26, opacity: 0.4 }}
        aria-hidden
      >
        🧺
      </span>
      <span
        style={{ position: "absolute", bottom: 18, right: 18, fontSize: 26, opacity: 0.4 }}
        aria-hidden
      >
        🥭
      </span>

      <header
        style={{
          width: CATALOG_CONTENT_WIDTH,
          height: CATALOG_HEADER_HEIGHT,
          minHeight: CATALOG_HEADER_HEIGHT,
          maxHeight: CATALOG_HEADER_HEIGHT,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <HeaderLogoSlot src={CATALOG_LOGO_SRC} alt="Urja Basket" emoji="🌿" theme={theme} />

          <div style={{ flex: 1, textAlign: "center", minWidth: 0, paddingBottom: 4 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 40,
                fontWeight: 700,
                color: theme.forest,
                letterSpacing: "0.02em",
                lineHeight: 1.1,
              }}
            >
              Urja Basket
            </h1>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: 13,
                color: "#64748b",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {dateLabel}
              {showPageBadge ? ` · Page ${pageIndex} of ${totalPages}` : null}
            </p>
          </div>

          <HeaderLogoSlot
            src={CATALOG_LOGO_MARK_SRC}
            alt="Urja Basket mark"
            emoji="🧺"
            theme={theme}
          />
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              ...headerPillBase,
              fontSize: CATALOG_HEADER_PILL_FONT,
              color: "#ffffff",
              backgroundColor: theme.forest,
              textTransform: "uppercase",
              boxShadow: "0 4px 14px rgba(26, 77, 46, 0.25)",
            }}
          >
            🚚&nbsp;&nbsp;Home Delivery Available
          </span>
          <span
            style={{
              ...headerPillBase,
              fontSize: CATALOG_HEADER_PHONE_FONT,
              color: theme.forestDark,
              backgroundColor: "#ffffff",
              border: `3px solid ${theme.forest}`,
              boxShadow: "0 4px 12px rgba(26, 77, 46, 0.1)",
            }}
          >
            📞&nbsp;&nbsp;{CATALOG_PHONE}
          </span>
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 9999,
              padding: "7px 28px",
              backgroundColor: theme.bannerBg,
              color: "#ffffff",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.03em",
              boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
              lineHeight: 1.2,
            }}
          >
            <LeafIcon color="#ffffff" />
            {theme.rateBanner}
            <LeafIcon color="#ffffff" />
          </div>
        </div>
      </header>

      <section
        style={{
          width: CATALOG_CONTENT_WIDTH,
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: CATALOG_GRID_GAP,
          alignItems: "flex-start",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.72)",
          borderRadius: 16,
          border: `1px solid ${theme.rowBorder}`,
          boxShadow: "0 6px 24px rgba(26, 77, 46, 0.08)",
          padding: "12px 14px",
        }}
      >
        {catalog.products.length === 0 ? (
          <p
            style={{
              margin: "auto",
              textAlign: "center",
              fontSize: 15,
              color: "#64748b",
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            No in-stock products in this category.
          </p>
        ) : (
          <>
            <ProductColumn products={leftCol} theme={theme} />
            <div
              style={{
                width: 1,
                alignSelf: "stretch",
                backgroundColor: theme.rowBorder,
                flexShrink: 0,
              }}
              aria-hidden
            />
            <ProductColumn products={rightCol} theme={theme} />
          </>
        )}
      </section>

      <footer
        style={{
          width: CATALOG_CONTENT_WIDTH,
          height: CATALOG_FOOTER_HEIGHT,
          minHeight: CATALOG_FOOTER_HEIGHT,
          maxHeight: CATALOG_FOOTER_HEIGHT,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 18,
            paddingBottom: 8,
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {CATALOG_TRUST_BADGES.map((label) => (
            <span
              key={label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                color: theme.forest,
              }}
            >
              <LeafIcon color={theme.forest} />
              {label}
            </span>
          ))}
        </div>

        <div
          style={{
            borderRadius: 10,
            padding: "12px 16px",
            backgroundColor: theme.bannerBg,
            color: "#ffffff",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.02em",
            boxShadow: "0 3px 10px rgba(26, 77, 46, 0.15)",
            lineHeight: 1.3,
          }}
        >
          Thank you for choosing Urja Basket! 🌿
        </div>
      </footer>
    </div>
  );
}
