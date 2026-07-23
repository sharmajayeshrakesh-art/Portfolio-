/** Cafe Hari Rasa — content. Swap phone/timings once confirmed with the owner. */

export const cafe = {
  name: "Cafe Hari Rasa",
  tagline: "Authentic South Indian flavours, served with soul.",
  kicker: "Pure Veg · South Indian · FC Road, Pune",
  instagram: "https://instagram.com/cafeharirasa",
  instagramHandle: "@cafeharirasa",
  // TODO: confirm with owner
  phone: "+91 00000 00000",
  whatsapp: "https://wa.me/910000000000",
  timings: "8:00 AM – 11:00 PM · Open all week",
  address:
    "Shop No. 1 & 3, Chanakyapuri, Plot No. 464/A/2, 1199/8, Ferguson College Rd, Shivajinagar, Pune, Maharashtra 411004",
  mapsQuery:
    "Cafe Hari Rasa, Ferguson College Road, Shivajinagar, Pune, Maharashtra 411004",
};

export type Highlight = {
  name: string;
  price: string;
  desc: string;
  img: string;
};

export const highlights: Highlight[] = [
  {
    name: "Benne Masala Dosa",
    price: "₹130",
    desc: "Stone-ground batter roasted in white butter until it shatters, wrapped around spiced potato.",
    img: "/cafe/sig-benne-dosa.jpg",
  },
  {
    name: "Ghee Masala Dosa",
    price: "₹70",
    desc: "The everyday classic, folded golden over soft masala with crisp, lacy edges.",
    img: "/cafe/food-masala-dosa.jpg",
  },
  {
    name: "Neer Idly",
    price: "₹65",
    desc: "Cloud-soft steamed idly that melts into fresh coconut chutney. Light, soothing, soulful.",
    img: "/cafe/sig-neer-idly.jpg",
  },
  {
    name: "Ghee Podi Idly",
    price: "₹65",
    desc: "Pillowy idly bathed in warm ghee and our fiery house podi.",
    img: "/cafe/food-podi-idli.jpg",
  },
  {
    name: "Medhu Vada & Filter Coffee",
    price: "₹50 · ₹60",
    desc: "A crisp, fluffy vada with decoction coffee pulled and frothed in a steel tumbler.",
    img: "/cafe/food-vada-coffee.jpg",
  },
  {
    name: "Dip Idly Sambar",
    price: "₹90",
    desc: "Soft idly steeped in slow-simmered sambar with green and tomato chutney.",
    img: "/cafe/food-idli.jpg",
  },
];

export type MenuGroup = { title: string; items: { name: string; price: string }[] };

export const menu: MenuGroup[] = [
  {
    title: "Dosa",
    items: [
      { name: "Ghee Plain Dosa", price: "70" },
      { name: "Ghee Masala Dosa", price: "70" },
      { name: "Ghee Mysore Sada Dosa", price: "85" },
      { name: "Ghee Mysore Masala Dosa", price: "110" },
      { name: "Benne Plain Dosa", price: "120" },
      { name: "Benne Ghee Podi Plain Dosa", price: "120" },
      { name: "Benne Masala Dosa", price: "130" },
      { name: "Benne Ghee Podi Masala Dosa", price: "130" },
      { name: "Benne Garlic Roast Dosa", price: "150" },
      { name: "Benne Garlic Roast Masala Dosa", price: "160" },
      { name: "Benne Cheese Dosa", price: "160" },
    ],
  },
  {
    title: "Idly",
    items: [
      { name: "Plain Idly", price: "50" },
      { name: "Ghee Podi Idly", price: "65" },
      { name: "Neer Idly", price: "65" },
      { name: "Benne Idly", price: "65" },
      { name: "Dip Idly Sambar", price: "90" },
    ],
  },
  {
    title: "Vada",
    items: [
      { name: "Medhu Vada", price: "50" },
      { name: "Dahi Vada", price: "75" },
      { name: "Dip Sambar Vada", price: "110" },
    ],
  },
  {
    title: "Snacks",
    items: [
      { name: "Onion Pakoda with Chutney", price: "65" },
      { name: "Masala Wada with Chutney", price: "70" },
    ],
  },
  {
    title: "Rice & Main Course",
    items: [
      { name: "Poori Koorma", price: "120" },
      { name: "Pongal", price: "90" },
      { name: "Bisibelebath", price: "90" },
    ],
  },
  {
    title: "Sweets",
    items: [
      { name: "Kesari Bath (Sheera)", price: "80" },
      { name: "Sweet Pongal", price: "80" },
      { name: "Badam Halwa (Sat & Sun)", price: "110" },
    ],
  },
  {
    title: "Beverages",
    items: [
      { name: "Filter Coffee", price: "60" },
      { name: "Iced Filter Coffee", price: "110" },
      { name: "Rice Payasam", price: "90" },
      { name: "Pulpy Grape Juice", price: "85" },
    ],
  },
];

export type GalleryImg = { src: string; label: string; tall?: boolean };

export const gallery: GalleryImg[] = [
  { src: "/cafe/gal-staircase.jpg", label: "The illuminated tile staircase", tall: true },
  { src: "/cafe/gal-relief.jpg", label: "Radha-Krishna relief" },
  { src: "/cafe/gal-ganesha.jpg", label: "The Ganesha shrine", tall: true },
  { src: "/cafe/gal-lotus-sign.jpg", label: "Our lotus emblem" },
  { src: "/cafe/sig-made-with-love.jpg", label: "Made with love", tall: true },
  { src: "/cafe/gal-menu-board.jpg", label: "The full menu" },
];
