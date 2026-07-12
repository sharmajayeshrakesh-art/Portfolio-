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
