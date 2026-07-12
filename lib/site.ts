/**
 * Single source of truth for editable content.
 * Replace these placeholders with your real details, then the whole site
 * updates. Names/roles here are PLACEHOLDERS — swap them.
 */
export const site = {
  studio: "Meridian",
  studioFull: "Meridian Studio",
  person: {
    name: "Rakesh Sharma",
    initials: "RS",
    role: "Founder · Design Engineer",
    location: "Independent studio",
    // Drop a transparent PNG at /public/portrait.png to replace the placeholder.
    portrait: "/portrait.png",
    idNo: "MS-01",
  },
  tagline: "Websites worth paying for.",
  subline:
    "An independent studio designing and building sites that feel expensive in the first five seconds.",
  primaryCta: { label: "Start a project", href: "#contact" },
  email: "hello@meridian.studio",
  socials: [
    { label: "GitHub", href: "#" },
    { label: "Dribbble", href: "#" },
    { label: "LinkedIn", href: "#" },
  ],
} as const;

/**
 * PLACEHOLDER projects — replace with real case studies (real screenshots at
 * /public and real live URLs). Images use picsum seeds until then. A portfolio
 * lives or dies on real work; these are scaffolding, not the finished showcase.
 */
export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  blurb: string;
  tag: string;
  href: string;
  image: string; // 1600x1000 mockup image
  placeholder: boolean;
};

export const projects: Project[] = [
  {
    slug: "halcyon",
    title: "Halcyon",
    category: "Fintech · Marketing site",
    year: "2025",
    blurb: "A calm, confident presence for a company moving money at scale.",
    tag: "Design + Build",
    href: "#",
    image: "/mockups/halcyon.svg",
    placeholder: true,
  },
  {
    slug: "aperture",
    title: "Aperture",
    category: "Studio · Portfolio",
    year: "2025",
    blurb: "An image-first portfolio where the work is the interface.",
    tag: "Art direction",
    href: "#",
    image: "/mockups/aperture.svg",
    placeholder: true,
  },
  {
    slug: "northwind",
    title: "Northwind",
    category: "SaaS · Product site",
    year: "2024",
    blurb: "Turning a dense product into a story a buyer finishes.",
    tag: "Design + Build",
    href: "#",
    image: "/mockups/northwind.svg",
    placeholder: true,
  },
  {
    slug: "sable",
    title: "Sable and Co.",
    category: "Commerce · Luxury",
    year: "2024",
    blurb: "A storefront that feels like the boutique it represents.",
    tag: "Design + Build",
    href: "#",
    image: "/mockups/sable.svg",
    placeholder: true,
  },
];

/** Types of websites we build together — drives the "What we build" section. */
export type Service = {
  key: string;
  title: string;
  line: string;
  includes: string[];
};

export const services: Service[] = [
  {
    key: "landing",
    title: "Landing pages",
    line: "One page with one job: turn a visitor into a lead.",
    includes: ["Conversion-first structure", "Motion that guides the eye", "Sub-second load"],
  },
  {
    key: "brand",
    title: "Brand & marketing sites",
    line: "A multi-page presence that makes a company look bigger than it is.",
    includes: ["Design system", "Editable content", "SEO foundations"],
  },
  {
    key: "commerce",
    title: "E-commerce",
    line: "Storefronts that make the product feel worth the price.",
    includes: ["Considered product pages", "Fast checkout", "Shopify or headless"],
  },
  {
    key: "saas",
    title: "SaaS product sites",
    line: "Turn a dense product into a story a buyer actually finishes.",
    includes: ["Feature narrative", "Pricing that converts", "Docs-ready"],
  },
  {
    key: "portfolio",
    title: "Portfolios",
    line: "Show the work like it matters, because it does.",
    includes: ["Explorable case studies", "Image-first galleries", "Editable content"],
  },
  {
    key: "interactive",
    title: "3D & interactive",
    line: "When a site needs to feel like the future, not a template.",
    includes: ["Real-time WebGL", "Scroll storytelling", "Custom motion systems"],
  },
];
