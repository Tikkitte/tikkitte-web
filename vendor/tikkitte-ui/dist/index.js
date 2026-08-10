// src/components/Button.tsx
import * as React from "react";
import { jsx } from "react/jsx-runtime";
var Button = React.forwardRef(
  ({ variant = "primary", size = "md", className, href, children, ...props }, ref) => {
    const classes = [
      "tk-button",
      `tk-button--${variant}`,
      size !== "md" ? `tk-button--${size}` : "",
      className ?? ""
    ].filter(Boolean).join(" ");
    if (href) {
      return /* @__PURE__ */ jsx("a", { href, className: classes, children });
    }
    return /* @__PURE__ */ jsx("button", { ref, className: classes, ...props, children });
  }
);
Button.displayName = "Button";

// src/components/Eyebrow.tsx
import * as React2 from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var Eyebrow = React2.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ jsx2("p", { ref, className: ["tk-eyebrow", className ?? ""].filter(Boolean).join(" "), ...props, children })
);
Eyebrow.displayName = "Eyebrow";

// src/components/Badge.tsx
import * as React3 from "react";
import { jsx as jsx3, jsxs } from "react/jsx-runtime";
var Badge = React3.forwardRef(
  ({ dot = true, className, children, ...props }, ref) => /* @__PURE__ */ jsxs("span", { ref, className: ["tk-badge", className ?? ""].filter(Boolean).join(" "), ...props, children: [
    dot && /* @__PURE__ */ jsx3("span", { className: "tk-badge__dot", "aria-hidden": "true" }),
    children
  ] })
);
Badge.displayName = "Badge";

// src/components/SectionHeading.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function SectionHeading({ eyebrow, title, description, align = "left", className }) {
  const classes = [
    "tk-section-heading",
    align === "center" ? "tk-section-heading--center" : "",
    className ?? ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxs2("div", { className: classes, children: [
    eyebrow && /* @__PURE__ */ jsx4(Eyebrow, { children: eyebrow }),
    /* @__PURE__ */ jsx4("h2", { className: "tk-section-heading__title", children: title }),
    description && /* @__PURE__ */ jsx4("p", { className: "tk-section-heading__description", children: description })
  ] });
}

// src/components/Card.tsx
import * as React4 from "react";
import { jsx as jsx5 } from "react/jsx-runtime";
var Card = React4.forwardRef(
  ({ variant = "bordered", className, children, ...props }, ref) => /* @__PURE__ */ jsx5(
    "div",
    {
      ref,
      className: [
        "tk-card",
        variant === "elevated" ? "tk-card--elevated" : "",
        className ?? ""
      ].filter(Boolean).join(" "),
      ...props,
      children
    }
  )
);
Card.displayName = "Card";
var CardBody = React4.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ jsx5("div", { ref, className: ["tk-card__body", className ?? ""].filter(Boolean).join(" "), ...props, children })
);
CardBody.displayName = "CardBody";

// src/components/StatTile.tsx
import { jsx as jsx6, jsxs as jsxs3 } from "react/jsx-runtime";
function StatTile({ label, value, valueUnit, caption, className }) {
  return /* @__PURE__ */ jsxs3("div", { className: ["tk-stat-tile", className ?? ""].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ jsx6("p", { className: "tk-stat-tile__label", children: label }),
    /* @__PURE__ */ jsxs3("p", { className: "tk-stat-tile__value", children: [
      value,
      valueUnit && /* @__PURE__ */ jsx6("span", { className: "tk-stat-tile__value-unit", children: valueUnit })
    ] }),
    caption && /* @__PURE__ */ jsx6("p", { className: "tk-stat-tile__caption", children: caption })
  ] });
}

// src/components/NavBar.tsx
import { jsx as jsx7, jsxs as jsxs4 } from "react/jsx-runtime";
function NavBar({ brand, brandHref = "/", links = [], actions, className }) {
  return /* @__PURE__ */ jsxs4("nav", { className: ["tk-navbar", className ?? ""].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ jsx7("a", { href: brandHref, className: "tk-navbar__brand", children: brand }),
    links.length > 0 && /* @__PURE__ */ jsx7("ul", { className: "tk-navbar__links", children: links.map((link) => /* @__PURE__ */ jsx7("li", { children: /* @__PURE__ */ jsx7(
      "a",
      {
        href: link.href,
        className: ["tk-navbar__link", link.active ? "tk-navbar__link--active" : ""].filter(Boolean).join(" "),
        children: link.label
      }
    ) }, link.href)) }),
    actions && /* @__PURE__ */ jsx7("div", { className: "tk-navbar__actions", children: actions })
  ] });
}

// src/components/Footer.tsx
import { jsx as jsx8, jsxs as jsxs5 } from "react/jsx-runtime";
function Footer({ brand, tagline, columns = [], legalText, legalLinks = [], className }) {
  return /* @__PURE__ */ jsxs5("footer", { className: ["tk-footer", className ?? ""].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ jsxs5("div", { className: "tk-footer__top", children: [
      /* @__PURE__ */ jsxs5("div", { className: "tk-footer__brand-col", children: [
        brand,
        tagline && /* @__PURE__ */ jsx8("p", { className: "tk-footer__tagline", children: tagline })
      ] }),
      columns.length > 0 && /* @__PURE__ */ jsx8("div", { className: "tk-footer__columns", children: columns.map((col) => /* @__PURE__ */ jsxs5("div", { className: "tk-footer__col", children: [
        /* @__PURE__ */ jsx8("p", { className: "tk-footer__col-title", children: col.title }),
        col.links.map((link) => /* @__PURE__ */ jsx8("a", { href: link.href, children: link.label }, link.href))
      ] }, col.title)) })
    ] }),
    /* @__PURE__ */ jsxs5("div", { className: "tk-footer__legal", children: [
      /* @__PURE__ */ jsx8("p", { className: "tk-footer__legal-text", children: legalText }),
      legalLinks.length > 0 && /* @__PURE__ */ jsx8("div", { className: "tk-footer__legal-links", children: legalLinks.map((link) => /* @__PURE__ */ jsx8("a", { href: link.href, children: link.label }, link.href)) })
    ] })
  ] });
}
export {
  Badge,
  Button,
  Card,
  CardBody,
  Eyebrow,
  Footer,
  NavBar,
  SectionHeading,
  StatTile
};
//# sourceMappingURL=index.js.map