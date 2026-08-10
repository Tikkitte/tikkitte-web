import * as React from 'react';

type ButtonVariant = "primary" | "secondary" | "dark";
type ButtonSize = "sm" | "md" | "lg";
type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
    /** Visual style. `primary` is the blue brand action, `dark` is the near-black
     * high-contrast action (used against light/cream grounds), `secondary` is
     * the outline style used for a page's lower-priority action. */
    variant?: ButtonVariant;
    /** Pill padding/type size. Defaults to `md`. */
    size?: ButtonSize;
    /** Render as an anchor instead of a button (for nav/CTA links). When set,
     * `href` becomes required and the component renders an `<a>`. */
    href?: string;
};
/**
 * Tikkitte's pill-shaped call-to-action button — the primary interactive
 * element across the marketing site ("List your event", "Browse events",
 * "Sign in"). Renders as a `<button>` by default, or an `<a>` when `href`
 * is provided.
 *
 * @example
 * <Button variant="primary" size="lg">List your event for free</Button>
 * <Button variant="secondary" href="/login">Organizer sign in</Button>
 */
declare const Button: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref"> & {
    /** Visual style. `primary` is the blue brand action, `dark` is the near-black
     * high-contrast action (used against light/cream grounds), `secondary` is
     * the outline style used for a page's lower-priority action. */
    variant?: ButtonVariant;
    /** Pill padding/type size. Defaults to `md`. */
    size?: ButtonSize;
    /** Render as an anchor instead of a button (for nav/CTA links). When set,
     * `href` becomes required and the component renders an `<a>`. */
    href?: string;
} & React.RefAttributes<HTMLButtonElement>>;

type EyebrowProps = React.ComponentPropsWithoutRef<"p">;
/**
 * Small uppercase label in the brand blue, set above a section heading
 * ("FOR ORGANIZERS", "GHANA'S EVENTS"). Plain text, no background.
 *
 * @example
 * <Eyebrow>For organizers</Eyebrow>
 */
declare const Eyebrow: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;

type BadgeProps = React.ComponentPropsWithoutRef<"span"> & {
    /** Show the small brand-blue status dot before the label. Defaults to true. */
    dot?: boolean;
};
/**
 * Pill-shaped status badge with a leading dot, used for live/status
 * indicators ("● Now live in Ghana").
 *
 * @example
 * <Badge>Now live in Ghana</Badge>
 * <Badge dot={false}>Draft</Badge>
 */
declare const Badge: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "ref"> & {
    /** Show the small brand-blue status dot before the label. Defaults to true. */
    dot?: boolean;
} & React.RefAttributes<HTMLSpanElement>>;

type SectionHeadingProps = {
    /** Small label above the title, e.g. "For organizers". */
    eyebrow?: React.ReactNode;
    /** The Anton display headline. Pass a fragment with a nested `<span>` to
     * two-tone it, matching patterns like "Sell out faster. <span>Get paid
     * directly.</span>" */
    title: React.ReactNode;
    /** Supporting paragraph under the title. */
    description?: React.ReactNode;
    /** Center-align the whole block (used in hero sections). Defaults to left. */
    align?: "left" | "center";
    className?: string;
};
/**
 * The recurring hero/section pattern across tikkitte.com: an eyebrow label,
 * a bold condensed Anton headline, and a supporting paragraph. Used for
 * every major section intro (homepage hero, organizer pitch, how-it-works).
 *
 * @example
 * <SectionHeading
 *   eyebrow="For organizers"
 *   title={<>Sell out faster.<br /><span style={{ color: "var(--tikkitte-blue-bright)" }}>Get paid directly.</span></>}
 *   description="List your event in minutes and reach thousands of people actively looking for something to do."
 *   align="center"
 * />
 */
declare function SectionHeading({ eyebrow, title, description, align, className }: SectionHeadingProps): React.JSX.Element;

type CardProps = React.ComponentPropsWithoutRef<"div"> & {
    /** Use the elevated treatment (soft shadow, larger radius, no border) for
     * a card that floats over the page, e.g. a hero product preview. The
     * default `bordered` treatment is for in-flow content cards. */
    variant?: "bordered" | "elevated";
};
/**
 * Generic rounded content container. `bordered` is the workhorse card used
 * throughout the app (stat tiles, list rows, form sections); `elevated` is
 * the floating-preview treatment used in hero sections. Pair with
 * `CardBody` for consistent inner padding.
 *
 * @example
 * <Card><CardBody>Plain content card</CardBody></Card>
 * <Card variant="elevated"><CardBody>Floating preview</CardBody></Card>
 */
declare const Card: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & {
    /** Use the elevated treatment (soft shadow, larger radius, no border) for
     * a card that floats over the page, e.g. a hero product preview. The
     * default `bordered` treatment is for in-flow content cards. */
    variant?: "bordered" | "elevated";
} & React.RefAttributes<HTMLDivElement>>;
type CardBodyProps = React.ComponentPropsWithoutRef<"div">;
/**
 * Standard inner padding for `Card` content.
 *
 * @example
 * <Card><CardBody>Padded content</CardBody></Card>
 */
declare const CardBody: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;

type StatTileProps = {
    /** Small label above the value, e.g. "Tickets sold". */
    label: React.ReactNode;
    /** The headline number, in the Anton display face — e.g. "80" or "GHS 16,500". */
    value: React.ReactNode;
    /** Optional trailing unit/context rendered smaller next to the value,
     * e.g. "/80" for a sold-out-of-capacity reading. */
    valueUnit?: React.ReactNode;
    /** Optional line under the value for extra context. */
    caption?: React.ReactNode;
    className?: string;
};
/**
 * A single metric tile — label, big Anton number, optional unit and
 * caption. The building block for dashboard summary rows (tickets sold,
 * gross collected, transactions).
 *
 * @example
 * <StatTile label="Tickets sold" value="80" valueUnit="/80" />
 * <StatTile label="Gross collected" value="GHS 16,500.00" caption="Across all events" />
 */
declare function StatTile({ label, value, valueUnit, caption, className }: StatTileProps): React.JSX.Element;

type NavBarLink = {
    label: string;
    href: string;
    active?: boolean;
};
type NavBarProps = {
    /** Brand/logo slot — an image + wordmark, or any custom mark. */
    brand: React.ReactNode;
    /** Where the brand mark links to. Defaults to "/". */
    brandHref?: string;
    /** Primary nav links, shown between the brand and the action slot. */
    links?: NavBarLink[];
    /** Right-aligned action slot — typically a `Button` or two. */
    actions?: React.ReactNode;
    className?: string;
};
/**
 * The site header: brand mark, primary nav links, and a right-aligned
 * action slot (sign-in / CTA buttons).
 *
 * @example
 * <NavBar
 *   brand={<><img src="/logo.png" width={28} height={28} alt="" /><span>Tikkitte</span></>}
 *   links={[
 *     { label: "Home", href: "/", active: true },
 *     { label: "Browse events", href: "/events" },
 *     { label: "Organizers", href: "/organizers" },
 *   ]}
 *   actions={<Button variant="primary" href="/signup">List your event</Button>}
 * />
 */
declare function NavBar({ brand, brandHref, links, actions, className }: NavBarProps): React.JSX.Element;

type FooterColumn = {
    title: string;
    links: {
        label: string;
        href: string;
    }[];
};
type FooterProps = {
    /** Brand/logo slot at the top-left of the footer. */
    brand: React.ReactNode;
    /** Short tagline under the brand, e.g. "Event ticketing for Ghana." */
    tagline?: React.ReactNode;
    /** Link columns (Explore, Contact, etc.). */
    columns?: FooterColumn[];
    /** Legal line on the bottom-left, e.g. "© 2026 Company Ltd." */
    legalText: React.ReactNode;
    /** Bottom-right legal links (Terms, Privacy, Refunds). */
    legalLinks?: {
        label: string;
        href: string;
    }[];
    className?: string;
};
/**
 * Site footer: brand + tagline, a row of link columns, and a bottom legal
 * line with secondary links.
 *
 * @example
 * <Footer
 *   brand={<span>Tikkitte</span>}
 *   tagline="Event ticketing for Ghana."
 *   columns={[
 *     { title: "Explore", links: [{ label: "Browse events", href: "/events" }, { label: "Sell tickets", href: "/organizers" }] },
 *     { title: "Contact", links: [{ label: "Contact us", href: "/contact" }] },
 *   ]}
 *   legalText="© 2026 FIRSTPASS EVENTS LTD."
 *   legalLinks={[{ label: "Terms", href: "/terms" }, { label: "Privacy", href: "/privacy" }]}
 * />
 */
declare function Footer({ brand, tagline, columns, legalText, legalLinks, className }: FooterProps): React.JSX.Element;

export { Badge, type BadgeProps, Button, type ButtonProps, type ButtonSize, type ButtonVariant, Card, CardBody, type CardBodyProps, type CardProps, Eyebrow, type EyebrowProps, Footer, type FooterColumn, type FooterProps, NavBar, type NavBarLink, type NavBarProps, SectionHeading, type SectionHeadingProps, StatTile, type StatTileProps };
