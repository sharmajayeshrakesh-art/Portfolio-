/** Key 2 Fitness — content. Real details from the gym's Google/Instagram profiles. */

export const gym = {
  name: "Key 2 Fitness",
  short: "K2",
  tagline: "RAIN OUTSIDE, BEAST INSIDE",
  subtagline: "Weight Loss is now Easy!",
  heroSub: "Build your best self at Bhugaon's most result-driven gym.",
  phone: "7066559038",
  phoneTel: "+917066559038",
  whatsapp: "https://wa.me/917066559038",
  instagram: "https://instagram.com/key2fitnessgym",
  instagramHandle: "@key2fitnessgym",
  address:
    "BBC Complex, 2nd Floor, above Shatayu Hospital, Bhivpathaki Business Complex, Bhugaon, Bavdhan, Pune 412115",
  hoursWeek: "Mon – Sat · 6:00 AM – 10:00 PM",
  hoursSun: "Sun · 8:00 AM – 12:00 PM & 6:00 – 9:00 PM",
  mapsQuery: "Key 2 Fitness Gym, Bhugaon, Bavdhan, Pune 412115",
};

/* Count-up stats */
export type Stat = { value: number; suffix?: string; label: string };
export const stats: Stat[] = [
  { value: 21, suffix: " days", label: "to visible results" },
  { value: 5, suffix: "★", label: "rated on Google" },
  { value: 7, suffix: "+", label: "classes & services" },
  { value: 3, suffix: " kg", label: "loss per month*" },
];

/* Why choose K2 */
export type Why = { title: string; blurb: string; icon: string };
export const why: Why[] = [
  { title: "Certified & Experienced Trainers", blurb: "Coaches who actually coach — form, focus, results.", icon: "medal" },
  { title: "Scientific Workout + Nutrition", blurb: "Training and diet planned around your body and goal.", icon: "brain" },
  { title: "Track Your Progress", blurb: "Body composition audits so you see the change.", icon: "chart" },
  { title: "Motivating Community", blurb: "Bhugaon's most energetic training floor.", icon: "community" },
  { title: "Clean, Safe & Premium", blurb: "Fully AC, sanitised, spacious and well-kept.", icon: "sparkle" },
  { title: "Results Visible in 21 Days", blurb: "Show up, follow the plan, watch it work.", icon: "timer" },
];

/* Independence Day offer (from the gym's 15th August flyer) */
export const offer = {
  title: "Independence Day Offer",
  validTill: "Offer valid till 20th August only",
  motto: "Be Free. Be Fit. Be Unstoppable.",
  pledge:
    "This Independence Day, take a pledge to get stronger, healthier & more confident.",
};

/* Membership plans (prices & taglines from the gym's flyer) */
export type Plan = {
  months: string;
  price: string;
  note: string;
  tag?: string;
  popular?: boolean;
  trial?: boolean;
};
export const plans: Plan[] = [
  { months: "1 Week Trial", price: "499", note: "Experience the Key 2 Fitness difference", trial: true },
  { months: "3 Months", price: "3,999", note: "Stay consistent, see results" },
  { months: "6 Months", price: "5,999", note: "Build strength, build discipline", tag: "Most Popular", popular: true },
  { months: "12 Months", price: "7,999", note: "Transform your body, transform your life", tag: "Best Value" },
];

/* Why join (from the flyer) */
export const whyJoin = [
  "Expert Trainers",
  "Personalized Workout Plans",
  "Nutrition Guidance",
  "Premium Equipment",
  "Positive Environment",
];

/* Transformation angle */
export const transformation = [
  { stat: "Up to 3 kg", label: "fat loss every month with trainers & nutrition on your side." },
  { stat: "Habit, not a phase", label: "we build routines that actually stick, long after day one." },
  { stat: "Real community", label: "an active, motivating fitness family right here in Bhugaon." },
];

/* Classes & specialties */
export const classes = [
  "Weight Training",
  "Personal Training",
  "HIIT",
  "Crossfit",
  "Aerobics",
  "Yoga",
  "Zumba",
];
export const specialties = [
  "Weight Loss",
  "Back Pain",
  "Post-Accident Recovery",
  "General Fitness",
  "PCOD / PCOS",
];

/* Facilities */
export type Facility = { title: string; icon: string };
export const facilities: Facility[] = [
  { title: "Premium Equipment", icon: "barbell" },
  { title: "Locker Facility", icon: "lock" },
  { title: "Shower & Change Rooms", icon: "drop" },
  { title: "Ample Parking", icon: "car" },
  { title: "Fully Air-Conditioned", icon: "snow" },
  { title: "Card / UPI / Google Pay", icon: "card" },
];

/* Gallery — a curated, uniform grid (all cleanly framed) */
export type GalleryImg = { src: string; label: string };
export const gallery: GalleryImg[] = [
  { src: "/gym/g-dumbbells.jpg", label: "The free-weights floor" },
  { src: "/gym/g-cable.jpg", label: "Cable & functional zone" },
  { src: "/gym/g-machines.jpg", label: "Resistance machines" },
  { src: "/gym/g-squat.jpg", label: "Power & squat racks" },
  { src: "/gym/g-reception.jpg", label: "The reception wall" },
  { src: "/gym/g-bench.jpg", label: "Strength corner" },
];

/* Reviews (real Google reviews) */
export type Review = { name: string; quote: string; initial: string; tint: string };
export const reviewsSummary = {
  score: "5.0",
  count: "13+",
  url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Key 2 Fitness Gym, Bhugaon, Bavdhan, Pune"
  )}`,
};
export const reviews: Review[] = [
  { name: "Swati Chavhan", initial: "S", tint: "#e01e26", quote: "All good equipment and best quality. Trainers are humble, dedicated and knowledgeable." },
  { name: "Jayshri Patil", initial: "J", tint: "#f5b800", quote: "Great gym — been here 2 months. Neat & clean place with activities beyond just the gym." },
  { name: "Nikita Kasurde", initial: "N", tint: "#e01e26", quote: "Has all the necessary equipment and a clean, positive atmosphere. Really good experience." },
  { name: "Navnath Ghare", initial: "N", tint: "#f5b800", quote: "Trainers guide me well, no laziness allowed, and cleanliness is always maintained." },
  { name: "Shubham Kharat", initial: "S", tint: "#e01e26", quote: "Best gym in Pune." },
  { name: "Devashree Rathod", initial: "D", tint: "#f5b800", quote: "Great gym with good equipment and helpful trainers. Clean, friendly and perfect for daily workouts." },
];
