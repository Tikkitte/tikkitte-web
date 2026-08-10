"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Badge: () => Badge,
  Button: () => Button,
  Card: () => Card,
  CardBody: () => CardBody,
  Eyebrow: () => Eyebrow,
  Footer: () => Footer,
  NavBar: () => NavBar,
  SectionHeading: () => SectionHeading,
  StatTile: () => StatTile
});
module.exports = __toCommonJS(index_exports);

// src/components/Button.tsx
var React = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
var Button = React.forwardRef(
  ({ variant = "primary", size = "md", className, href, children, ...props }, ref) => {
    const classes = [
      "tk-button",
      `tk-button--${variant}`,
      size !== "md" ? `tk-button--${size}` : "",
      className ?? ""
    ].filter(Boolean).join(" ");
    if (href) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href, className: classes, children });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { ref, className: classes, ...props, children });
  }
);
Button.displayName = "Button";

// src/components/Eyebrow.tsx
var React2 = __toESM(require("react"), 1);
var import_jsx_runtime2 = require("react/jsx-runtime");
var Eyebrow = React2.forwardRef(
  ({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { ref, className: ["tk-eyebrow", className ?? ""].filter(Boolean).join(" "), ...props, children })
);
Eyebrow.displayName = "Eyebrow";

// src/components/Badge.tsx
var React3 = __toESM(require("react"), 1);
var import_jsx_runtime3 = require("react/jsx-runtime");
var Badge = React3.forwardRef(
  ({ dot = true, className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { ref, className: ["tk-badge", className ?? ""].filter(Boolean).join(" "), ...props, children: [
    dot && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "tk-badge__dot", "aria-hidden": "true" }),
    children
  ] })
);
Badge.displayName = "Badge";

// src/components/SectionHeading.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function SectionHeading({ eyebrow, title, description, align = "left", className }) {
  const classes = [
    "tk-section-heading",
    align === "center" ? "tk-section-heading--center" : "",
    className ?? ""
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: classes, children: [
    eyebrow && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Eyebrow, { children: eyebrow }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "tk-section-heading__title", children: title }),
    description && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "tk-section-heading__description", children: description })
  ] });
}

// src/components/Card.tsx
var React4 = __toESM(require("react"), 1);
var import_jsx_runtime5 = require("react/jsx-runtime");
var Card = React4.forwardRef(
  ({ variant = "bordered", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
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
  ({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { ref, className: ["tk-card__body", className ?? ""].filter(Boolean).join(" "), ...props, children })
);
CardBody.displayName = "CardBody";

// src/components/StatTile.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function StatTile({ label, value, valueUnit, caption, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: ["tk-stat-tile", className ?? ""].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "tk-stat-tile__label", children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("p", { className: "tk-stat-tile__value", children: [
      value,
      valueUnit && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "tk-stat-tile__value-unit", children: valueUnit })
    ] }),
    caption && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "tk-stat-tile__caption", children: caption })
  ] });
}

// src/components/NavBar.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function NavBar({ brand, brandHref = "/", links = [], actions, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("nav", { className: ["tk-navbar", className ?? ""].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("a", { href: brandHref, className: "tk-navbar__brand", children: brand }),
    links.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ul", { className: "tk-navbar__links", children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "a",
      {
        href: link.href,
        className: ["tk-navbar__link", link.active ? "tk-navbar__link--active" : ""].filter(Boolean).join(" "),
        children: link.label
      }
    ) }, link.href)) }),
    actions && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "tk-navbar__actions", children: actions })
  ] });
}

// src/components/Footer.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function Footer({ brand, tagline, columns = [], legalText, legalLinks = [], className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("footer", { className: ["tk-footer", className ?? ""].filter(Boolean).join(" "), children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tk-footer__top", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tk-footer__brand-col", children: [
        brand,
        tagline && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "tk-footer__tagline", children: tagline })
      ] }),
      columns.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tk-footer__columns", children: columns.map((col) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tk-footer__col", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "tk-footer__col-title", children: col.title }),
        col.links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("a", { href: link.href, children: link.label }, link.href))
      ] }, col.title)) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "tk-footer__legal", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "tk-footer__legal-text", children: legalText }),
      legalLinks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "tk-footer__legal-links", children: legalLinks.map((link) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("a", { href: link.href, children: link.label }, link.href)) })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Badge,
  Button,
  Card,
  CardBody,
  Eyebrow,
  Footer,
  NavBar,
  SectionHeading,
  StatTile
});
//# sourceMappingURL=index.cjs.map