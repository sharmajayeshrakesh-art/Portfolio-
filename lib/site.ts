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
