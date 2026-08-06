/** Secret Sambar — content. Branch addresses/phones are owner-supplied placeholders. */

export const sambar = {
  name: "Secret Sambar",
  tagline: "South Indian Cuisine",
  heroTagline: "Authentic South Indian Cuisine · Pune",
  kicker: "Trademark Registered · Pure Veg · Four Branches Across Pune",
  instagram: "https://instagram.com/secretsambar",
  instagramHandle: "@secretsambar",
  website: "https://secretsambar.com",
  websiteLabel: "secretsambar.com",
  email: "secretsambar@gmail.com",
  phoneDisplay: "07507 988796",
  phoneTel: "+917507988796",
  timings: "8:00 AM – 11:00 PM · Open all week", // TODO: confirm exact hours with owner
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
      { name: "Ghee Thatte Idli", price: "100" },
      { name: "Ghee Podi Thatte Idli", price: "120" },
      { name: "Ghee Butter Idli", price: "60" },
      { name: "Ghee Button Idli", price: "80" },
      { name: "Idli Fry", price: "80" },
      { name: "Ghee Podi Button Idli", price: "80" },
      { name: "Ghee Sambar Button Idli", price: "100" },
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
      { name: "Ghee Podi Masala Dosa", price: "140" },
      { name: "Open Butter Masala Dosa", price: "160" },
      { name: "Ghee Garlic Roast Dosa", price: "160" },
      { name: "Ghee Mysore Plain Dosa", price: "120" },
      { name: "Ghee Mysore Masala Dosa", price: "150" },
      { name: "Ghee Rawa Plain Dosa", price: "120" },
      { name: "Ghee Rawa Masala Dosa", price: "140" },
      { name: "Ghee Rawa Onion Masala Dosa", price: "150" },
      { name: "Ghee Cut Dosa", price: "140" },
    ],
  },
  {
    id: "wada-uttapam",
    label: "Wada / Uttapam",
    blurb: "Crisp wadas and thick, loaded uttapams.",
    items: [
      { name: "Khara Bhaat (Upma)", price: "60" },
      { name: "Idli Medu Wada Mix", price: "80" },
      { name: "Sabudana Wada", price: "80" },
      { name: "Medu Wada (2 pcs)", price: "90" },
      { name: "Dahi Wada", price: "120" },
      { name: "Tomato Omelette", price: "120" },
      { name: "Ghee Tomato Uttapam", price: "120" },
      { name: "Ghee Onion Uttapam", price: "120" },
      { name: "Ghee Onion Chilli Uttapam", price: "140" },
      { name: "Ghee Tomato Onion Uttapam", price: "140" },
      { name: "Ghee Masala Uttapam", price: "150" },
      { name: "Ghee Coconut Uttapam", price: "150" },
      { name: "Ghee Cheese Garlic Uttapam", price: "150" },
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
    address: "Bavdhan, Pune", // exact street address coming from owner
    phone: "07507 988796",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Bavdhan, Pune",
  },
  {
    name: "Pimple Saudagar",
    img: "/sambar/branch-pimple.jpg",
    address: "Pimple Saudagar, Pune",
    phone: "07507 988796",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Pimple Saudagar, Pune",
  },
  {
    name: "SB Road",
    tag: "Newest",
    img: "/sambar/branch-sbroad.jpg",
    address: "Senapati Bapat Road (SB Road), Pune",
    phone: "07507 988796",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Senapati Bapat Road, Pune",
  },
  {
    name: "Akurdi",
    img: "/sambar/branch-akurdi.jpg",
    address: "Akurdi, Pune",
    phone: "07507 988796",
    timings: "8:00 AM – 11:00 PM",
    mapsQuery: "Secret Sambar, Akurdi, Pune",
  },
];
