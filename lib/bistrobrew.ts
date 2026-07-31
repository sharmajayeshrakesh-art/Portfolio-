/**
 * Bistro Brew — single source of every business fact.
 * Verified from their Google listing, menu photo and reviews (1 Aug 2026).
 * Unverified values are null with a note; every component handles null.
 */

export const VERIFIED_AS_OF = "1 August 2026";

export const bistro = {
  name: "Bistro Brew",
  nameDevanagari: "बिस्त्रो ब्रू",
  address: "SKYi Town Centre, Paud Rd, Bhukum, Pune, Maharashtra 412115",
  landmark: "SKYi Town Centre, Paud Road",
  // Google flags this number as possibly incorrect — verify before relying on it.
  phoneDisplay: "070286 88190",
  phoneTel: "+917028688190",
  whatsapp: "https://wa.me/917028688190",
  instagram: null as string | null, // UNVERIFIED — handle not confirmed
  mapUrl: null as string | null, // UNVERIFIED — no embed URL yet
  mapsQuery: "Bistro Brew, SKYi Town Centre, Paud Road, Bhukum, Pune",
  hours: { opens: "12:00", closes: null as string | null }, // only opening time is confirmed
  hoursLabel: "Opens daily at 12 PM",
  googleRating: null as string | null, // UNVERIFIED
  googleReviewCount: null as number | null, // UNVERIFIED
  priceBand: "₹1–200 per person",
};

/* Menu — real items & prices transcribed from their menu. veg=false only where
   the item is non-vegetarian. Prices that could not be read stay null. */
export type MenuItem = { name: string; price: number | null; veg: boolean };
export type MenuTab = { id: string; label: string; groups: { title: string; items: MenuItem[] }[] };

const v = (name: string, price: number | null): MenuItem => ({ name, price, veg: true });
const nv = (name: string, price: number | null): MenuItem => ({ name, price, veg: false });

export const menu: MenuTab[] = [
  {
    id: "coffee",
    label: "Coffee",
    groups: [
      {
        title: "Coffee",
        items: [
          v("Espresso", 70), v("Café Latte", 120), v("Cappuccino (Small)", 100),
          v("Cappuccino (Large)", 120), v("Black Coffee", 100), v("Café Mocha", 130),
          v("Flavoured Mocha", 150), v("Affogato", 120), v("Hot Chocolate", 120),
          v("Bounty Hot Chocolate", 130),
        ],
      },
    ],
  },
  {
    id: "tea",
    label: "Tea",
    groups: [
      {
        title: "Tea",
        items: [
          v("Masala Tea", 30), v("Lemon Tea", 30), v("Ginger Tea", 30),
          v("Honey Lemon Tea", 50), v("Green Tea", 50), v("Blue Tea", 50),
          v("Pink Tea", 50), v("Hot Toddy", 50),
        ],
      },
    ],
  },
  {
    id: "cold",
    label: "Cold Drinks",
    groups: [
      { title: "Shakes", items: [v("Mango", 90), v("Vanilla", 90), v("Strawberry", 90)] },
      {
        title: "Frappes",
        items: [v("Café Frappe", 80), v("Caramel Frappe", 80), v("Cold Coffee", 80), v("Cold Chocolate", 80)],
      },
      {
        title: "Fresh Juices",
        items: [
          v("Fresh Watermelon", 80), v("Orange", 50), v("Guava", 50),
          v("Cranberry", 50), v("Pineapple", 50), v("Mango", 50),
        ],
      },
      {
        title: "Soft Drinks",
        items: [
          v("Sprite (300ml)", 60), v("Coke (300ml)", 60), v("Ginger Ale (300ml)", 60),
          v("Red Bull (200ml)", 150), v("Fresh Lime Soda", 60), v("Fresh Lime Water", 40),
        ],
      },
    ],
  },
  {
    id: "mocktails",
    label: "Mocktails",
    groups: [
      {
        title: "Mocktails",
        items: [
          v("Berry Breeze", 80), v("Blue Lagoon", 80), v("Guava Mary", 80),
          v("Kala Khatta Mojito", 80), v("Virgin Mojito", 80), v("Virgin Pina Colada", 80),
          v("Desi Cooler", 80), v("Minted Apple Splash", 80), v("Fruitful Zest", 80),
        ],
      },
    ],
  },
  {
    id: "food",
    label: "Food",
    groups: [
      {
        title: "Burgers",
        items: [v("Veg Burger", 110), v("Cheesy Veg Burger", 130), v("Paneer Burger", 130), v("Double Patty Veg Burger", 150)],
      },
      {
        title: "Sandwiches",
        items: [v("Coleslaw Sandwich", 110), v("Veg Grilled Sandwich", 120), v("Bombay Toast", 120), v("Corn & Cheese Sandwich", 110), v("Veg Club Sandwich", 150)],
      },
      {
        title: "Bites",
        items: [nv("Chicken Popcorn", 150), nv("Chicken Nugget", 150)],
      },
    ],
  },
];

export const menuNote = "A taste of the menu. Full menu, including specials, in store.";

/* The space — gallery (the ambience is the product) */
export type GalleryImg = { src: string; label: string };
export const gallery: GalleryImg[] = [
  { src: "/bistro/lamps.jpg", label: "The cane-lamp ceiling" },
  { src: "/bistro/hero-outdoor.jpg", label: "Turf seating out front" },
  { src: "/bistro/counter.jpg", label: "The mint counter" },
  { src: "/bistro/shopfront-night.jpg", label: "After dark" },
  { src: "/bistro/seating.jpg", label: "Pull up a bench" },
  { src: "/bistro/shopfront-day.jpg", label: "Find the green door" },
];

/* Signature — their own product photography */
export const signature = [
  { src: "/bistro/drink-latte.jpg", label: "Latte art, most mornings" },
  { src: "/bistro/drink-mocktail.jpg", label: "Mocktails, all afternoon" },
  { src: "/bistro/food-pizza.jpg", label: "Hand-crafted plates" },
];

/* Reviews — real Google reviews only (the AQUA CLEAR SOLUTION vendor is skipped). */
export type Review = { name: string; text: string };
export const reviews: Review[] = [
  { name: "Revati Chougule", text: "Every dish here has its own unique flavor, nothing feels ordinary! The vibes are super aesthetic, the service is warm." },
  { name: "Shreyas Mangalvedhekar", text: "I had an amazing experience at Bistro Brew! The ambiance was cozy and inviting." },
  { name: "Tanisha Sambhus", text: "Variety of options, good music, good service. It's a whole vibe! Must try." },
  { name: "Omkar Nawghare", text: "Best place to chill. Great vibes." },
];
