/** Secret Sambar — content. Branch addresses/phones are owner-supplied placeholders. */

export const sambar = {
  name: "Secret Sambar",
  tagline: "South Indian Cuisine",
  heroTagline: "Authentic South Indian Cuisine · Pune",
  kicker: "Trademark Registered · Pure Veg · Four Branches Across Pune",
  instagram: "https://instagram.com/secretsambar",
  instagramHandle: "@secretsambar",
  email: "hello@secretsambar.in", // TODO: confirm with owner
  phoneDisplay: "+91 00000 00000", // TODO: confirm with owner
  phoneTel: "+910000000000",
  timings: "8:00 AM – 11:00 PM · Open all week", // TODO: confirm with owner
  prepNote: "Please anticipate a 15–20 minute wait as we prepare your meal fresh.",
  gstNote: "Full menu in-store · Prices subject to change · 5% GST applicable",
};

/* ---- About feature row ---- */
export type Feature = { title: string; icon: "leaf" | "flame" | "scroll" | "pin" };
export const features: Feature[] = [
  { title: "100% Vegetarian", icon: "leaf" },
  { title: "Made Fresh to Order", icon: "flame" },
  { title: "Authentic Recipes", icon: "scroll" },
  { title: "4 Branches Across Pune", icon: "pin" },
];

/* ---- Menu ---- */
export type MenuItem = { name: string; price: string };
export type MenuTab = { id: string; label: string; blurb: string; items: MenuItem[] };

export const menu: MenuTab[] = [
  {
    id: "idli",
    label: "Idli",
    blurb: "Steamed soft, served with chutney & sambar.",
    items: [
      { name: "Idli Chutney", price: "60" },
      { name: "Appe", price: "80" },
      { name: "Dip Idli", price: "80" },
      { name: "Thatte Idli", price: "80" },
      { name: "Ghee Thatte Idli", price: "90" },
      { name: "Ghee Podi Thatte Idli", price: "100" },
      { name: "Ghee Butter Idli", price: "120" },
      { name: "Ghee Button Idli", price: "120" },
      { name: "Idli Fry", price: "120" },
      { name: "Ghee Podi Button Idli", price: "120" },
      { name: "Ghee Sambar Button Idli", price: "120" },
    ],
  },
  {
    id: "wada",
    label: "Wada",
    blurb: "Crisp, golden and made to order.",
    items: [
      { name: "Khara Bhaat (Upma)", price: "60" },
      { name: "Idli Medu Wada Mix", price: "80" },
      { name: "Sabudana Wada", price: "80" },
      { name: "Medu Wada (2 pcs)", price: "90" },
      { name: "Batata Wada (2 pcs)", price: "90" },
      { name: "Dahi Wada", price: "120" },
    ],
  },
  {
    id: "dosa",
    label: "Dosa",
    blurb: "Ghee-roasted till lacy and golden.",
    items: [
      { name: "Ghee Plain Dosa", price: "120" },
      { name: "Ghee Set Dosa", price: "120" },
      { name: "Ghee Podi Plain Dosa", price: "130" },
      { name: "Ghee Masala Dosa", price: "140" },
      { name: "Ghee Podi Masala Dosa", price: "150" },
      { name: "Open Butter Masala Dosa", price: "160" },
      { name: "Ghee Garlic Roast Dosa", price: "160" },
      { name: "Ghee Mysore Plain Dosa", price: "120" },
      { name: "Ghee Rawa Plain Dosa", price: "150" },
      { name: "Ghee Rawa Masala Dosa", price: "160" },
      { name: "Ghee Mysore Masala Dosa", price: "150" },
      { name: "Ghee Rawa Onion Masala Dosa", price: "160" },
      { name: "Ghee Cut Dosa", price: "140" },
      { name: "Ragi Plain Dosa", price: "140" },
      { name: "Ragi Masala Dosa", price: "160" },
      { name: "Ragi Podi Masala Dosa", price: "180" },
    ],
  },
  {
    id: "uttapam",
    label: "Uttapam",
    blurb: "Thick, soft and loaded with toppings.",
    items: [
      { name: "Tomato Besan Cheela", price: "120" },
      { name: "Ghee Tomato Uttapam", price: "120" },
      { name: "Ghee Onion Uttapam", price: "120" },
      { name: "Ghee Onion Chilli Uttapam", price: "140" },
      { name: "Ghee Tomato Onion Uttapam", price: "140" },
      { name: "Ghee Masala Uttapam", price: "150" },
      { name: "Ghee Podi Masala Uttapam", price: "160" },
      { name: "Ghee Coconut Uttapam", price: "150" },
      { name: "Ghee Cheese Garlic Uttapam", price: "150" },
      { name: "Ragi Onion Uttapam", price: "140" },
      { name: "Ragi Podi Masala Uttapam", price: "160" },
    ],
  },
  {
    id: "rice",
    label: "Rice",
    blurb: "Comfort in a bowl, temple-town style.",
    items: [
      { name: "Lemon Rice", price: "180" },
      { name: "Sambar Rice", price: "180" },
      { name: "Rasam Rice", price: "180" },
      { name: "Curd Rice", price: "180" },
      { name: "Bisi Bele Bhaat", price: "200" },
    ],
  },
  {
    id: "beverages",
    label: "Beverages",
    blurb: "Filter coffee the way it should be.",
    items: [
      { name: "Filter Coffee", price: "40" },
      { name: "Black Coffee", price: "30" },
      { name: "Tea", price: "20" },
      { name: "Nimboo Pani", price: "40" },
      { name: "Buttermilk", price: "60" },
      { name: "Solkadhi", price: "50" },
      { name: "Lassi", price: "50" },
      { name: "Fresh Fruit Juice (Seasonal)", price: "100" },
      { name: "Water Bottle", price: "25" },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    blurb: "A sweet, ghee-rich finish.",
    items: [
      { name: "Gulab Jamun", price: "60" },
      { name: "Kesari Bhat (Sheera)", price: "60" },
      { name: "Moong Dal Halwa", price: "120" },
    ],
  },
  {
    id: "addons",
    label: "Add-ons",
    blurb: "Make it a little more special.",
    items: [
      { name: "Ghee", price: "30" },
      { name: "Butter", price: "30" },
      { name: "Cheese", price: "40" },
      { name: "Podi Chutney", price: "30" },
      { name: "Extra Papad", price: "20" },
      { name: "Curd Wati", price: "30" },
      { name: "Extra Sambar (500ml)", price: "80" },
      { name: "Extra Rasam (250ml)", price: "40" },
      { name: "Packing (per item)", price: "10" },
    ],
  },
];

/* ---- Gallery ---- */
export type GalleryImg = { src: string; label: string; span?: "tall" | "wide" };
export const gallery: GalleryImg[] = [
  { src: "/sambar/gal-shrine.jpg", label: "The Balaji shrine & flower rangoli", span: "tall" },
  { src: "/sambar/gal-thali.jpg", label: "Ghee dosa on a banana leaf", span: "wide" },
  { src: "/sambar/gal-rangoli.jpg", label: "Fresh marigold rangoli" },
  { src: "/sambar/gal-hall.jpg", label: "A pillared, plant-filled hall" },
  { src: "/sambar/gal-interior.jpg", label: "Warli art & warm seating", span: "wide" },
  { src: "/sambar/gal-elephant.jpg", label: "Stone elephants at the door" },
];

/* ---- Branches ---- */
export type Branch = {
  name: string;
  tag?: string;
  img: string;
  address: string;
  phone: string;
  timings: string;
  mapsQuery: string;
};
export const branches: Branch[] = [
  {
    name: "Bavdhan",
    img: "/sambar/branch-bavdhan.jpg",
    address: "Address coming soon · Bavdhan, Pune", // TODO: owner
    phone: "+91 00000 00000",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Bavdhan, Pune",
  },
  {
    name: "Pimpri-Chinchwad",
    img: "/sambar/branch-pcmc.jpg",
    address: "Address coming soon · Pimpri-Chinchwad, Pune", // TODO: owner
    phone: "+91 00000 00000",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Pimpri-Chinchwad, Pune",
  },
  {
    name: "SB Road",
    tag: "Newest",
    img: "/sambar/branch-sbroad.jpg",
    address: "Address coming soon · Senapati Bapat Road, Pune", // TODO: owner
    phone: "+91 00000 00000",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Senapati Bapat Road, Pune",
  },
  {
    name: "Akurdi",
    img: "/sambar/branch-akurdi.jpg",
    address: "Address coming soon · Akurdi, Pune", // TODO: owner
    phone: "+91 00000 00000",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Akurdi, Pune",
  },
];
