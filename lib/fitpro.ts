/**
 * FITPRO GYM — single source of every business fact.
 * Verified on Google (28 Jul 2026). Unverified values are `null` and every
 * component must render sensibly (e.g. "Ask on WhatsApp") when a value is null.
 */

export const VERIFIED_AS_OF = "28 July 2026";

export const fitpro = {
  name: "FITPRO GYM",
  locality: "Hinjewadi Phase 1 / Marunji, Pune",
  address:
    "5th & 6th Floor, Hinjawadi–Marunji Rd, Phase 1, Rajiv Gandhi Infotech Park, Hinjawadi, Marunji, Maharashtra 411057",
  floors: "Two floors · 5th & 6th",
  phoneDisplay: "+91 93595 91529",
  phoneTel: "+919359591529",
  whatsapp: "https://wa.me/919359591529",
  instagram: "https://instagram.com/fitpro_pune",
  instagramHandle: "@fitpro_pune",
  mapUrl: null as string | null, // UNVERIFIED — no embed URL yet
  hours: { open: "06:00", close: "22:00", days: "All 7 days" },
  hoursLabel: "6:00 AM – 10:00 PM · All 7 days",
  googleRating: "5.0",
  googleReviewCount: 159,
  nearby: "Under 1 km from the Phase 1 IT offices",
};

/* Why people train here — no invented statistics */
export type Why = { title: string; blurb: string; icon: "eye" | "stack" | "pulse" | "clock" };
export const why: Why[] = [
  { title: "Trainers who watch your form", blurb: "The most repeated line in their reviews. Someone is always correcting, never just counting reps.", icon: "eye" },
  { title: "Two full floors", blurb: "The 5th and 6th, so the room never feels crowded. Cardio, strength and class space all get room to breathe.", icon: "stack" },
  { title: "Classes actually running", blurb: "Zumba, CrossFit and yoga happen here for real, not just a line on a poster.", icon: "pulse" },
  { title: "Open every single day", blurb: "6 AM to 10 PM, all seven days. Early grind or late unwind, the lights are on.", icon: "clock" },
];

/* Classes — the classes are confirmed; the days/times are not */
export type ClassItem = { name: string; img: string; schedule: string | null; blurb: string };
export const classes: ClassItem[] = [
  { name: "Zumba", img: "/fitpro/class-zumba.jpg", schedule: null, blurb: "High-energy dance cardio under the lights." },
  { name: "CrossFit", img: "/fitpro/floor-strength2.jpg", schedule: null, blurb: "Functional strength and conditioning, coached." },
  { name: "Yoga", img: "/fitpro/class-zumba.jpg", schedule: null, blurb: "Breathe, stretch, reset. Mobility that lasts." },
  { name: "Strength Floor", img: "/fitpro/floor-strength.jpg", schedule: null, blurb: "Plate-loaded machines, racks and cable stations." },
  { name: "Cardio Floor", img: "/fitpro/floor-cardio.jpg", schedule: null, blurb: "Treadmills and bikes with a view over the hills." },
];

/* The space — gallery across both floors */
export const gallery = [
  { src: "/fitpro/dumbbell-rack.jpg", label: "The dumbbell rack" },
  { src: "/fitpro/floor-dumbbell2.jpg", label: "Free weights under the lights" },
  { src: "/fitpro/floor-cardio.jpg", label: "Cardio floor & the view" },
  { src: "/fitpro/floor-strength.jpg", label: "Plate-loaded strength" },
  { src: "/fitpro/reception.jpg", label: "Reception & the wall" },
  { src: "/fitpro/view-window.jpg", label: "Hills & city, out the window" },
];

/* Plans — three tiers. Prices UNVERIFIED → cards render "Ask on WhatsApp". */
export type Plan = { name: string; period: string; price: string | null; note: string };
export const plans: Plan[] = [
  { name: "Monthly", period: "per month", price: null, note: "Full access to both floors and all equipment." },
  { name: "Quarterly", period: "3 months", price: null, note: "The same access, better value over three months." },
  { name: "Annual", period: "12 months", price: null, note: "Best value for a full year of training." },
];
export const planIncludes = [
  "Access to both the 5th & 6th floors",
  "All strength, cardio & functional equipment",
  "Open 6 AM – 10 PM, every day",
  "Group classes: Zumba, CrossFit & Yoga",
];

/* Reviews — real Google reviews ONLY. Empty until supplied verbatim; the
   Reviews section does not render while this is empty. */
export type Review = { name: string; text: string };
export const reviews: Review[] = [
  { name: "Vivek Shinde", text: "This is the best gym in Hinjewadi and Marunji. Regular activities like Yoga, Zumba and CrossFit make the difference from other gyms." },
  { name: "Nitya Barwi", text: "Great place to work out. Machines are well maintained. The trainers guide you properly and keep encouraging you to stay consistent." },
  { name: "Maansi Shriyan", text: "Excellent facilities, top-tier equipment, and an incredibly motivating environment. It never feels overly crowded, and the hygiene levels are great." },
  { name: "Sumit Jadhav", text: "Gym is good, trainers are really good, and the vibe is excellent with imported machines. A premium yet affordable gym in the town." },
  { name: "Ajay Devkate", text: "FitPro Gym is a great place for fitness enthusiasts. The gym is clean, well-equipped with modern machines, and has a motivating environment." },
];

/* FAQ — anything unverified points honestly to WhatsApp */
export type Faq = { q: string; a: string };
export const faq: Faq[] = [
  { q: "What are your timings?", a: "We're open 6:00 AM to 10:00 PM, all seven days of the week." },
  { q: "Do you offer a free trial?", a: "Message us on WhatsApp and we'll sort out a trial for you right away." },
  { q: "Are there showers and lockers?", a: "Drop us a quick message on WhatsApp and we'll confirm the current facilities." },
  { q: "Is there parking?", a: "We're in the Rajiv Gandhi Infotech Park, Phase 1. Ping us on WhatsApp for the latest parking details." },
  { q: "Are women welcome in Zumba and yoga?", a: "Absolutely. Our classes are open and welcoming to everyone." },
  { q: "Monthly or quarterly, what's best?", a: "Both work great. Tell us your goal on WhatsApp and we'll recommend the right plan and current pricing." },
  { q: "Do you have personal training?", a: "Our trainers are known for hands-on coaching. Message us on WhatsApp to ask about personal training options." },
  { q: "Do you accept FITPASS?", a: "Please confirm with us on WhatsApp and we'll tell you exactly what's accepted right now." },
];
