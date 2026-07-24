/** Aurum Beans — content. Swap timings once confirmed with the owner. */

export const aurum = {
  name: "Aurum Beans",
  tagline: "Good coffee. Great food. Better vibes.",
  taglineScript: "Pune's cozy little secret",
  kicker: "Premium & Valuable · Pure Veg Café · Pimpri, Pune",
  instagram: "https://instagram.com/aurum_beans",
  instagramHandle: "@aurum_beans",
  email: "aurumbeans@gmail.com",
  phoneDisplay: "092702 68680",
  phoneTel: "+919270268680",
  // TODO: confirm exact hours with owner
  timings: "9:00 AM – 11:00 PM · Open all week",
  address:
    "Shop No. 1, Sr. No. 1/6, beside Ashok Nagari Sahakari Bank, Sant Tukaram Nagar, Vallabh Nagar, Pimpri Colony, Pune 411018",
  mapsQuery:
    "Aurum Beans, Sant Tukaram Nagar, Pimpri Colony, Pune 411018",
};

/* ---- About feature row ---- */
export type Feature = { title: string; blurb: string; icon: "coffee" | "food" | "sofa" | "hearts" };
export const features: Feature[] = [
  { title: "Freshly Brewed Coffee", blurb: "Beans pulled fresh, cup after cup.", icon: "coffee" },
  { title: "Delicious Food", blurb: "Comfort plates made to linger over.", icon: "food" },
  { title: "Cozy Ambiance", blurb: "Flowers, warm light, soft corners.", icon: "sofa" },
  { title: "Perfect for Work & Dates", blurb: "A quiet table whenever you need one.", icon: "hearts" },
];

/* ---- Menu ---- */
export type MenuItem = { name: string; price?: string };
export type MenuGroup = { title: string; note?: string; items: MenuItem[] };
export type MenuTab = { id: string; label: string; blurb: string; groups: MenuGroup[] };

export const menu: MenuTab[] = [
  {
    id: "hot",
    label: "Hot Beverages",
    blurb: "For rainy afternoons and slow mornings.",
    groups: [
      {
        title: "Shai",
        items: [
          { name: "Adrak", price: "25" },
          { name: "Elaichi", price: "25" },
          { name: "Masala", price: "25" },
          { name: "Baarish Wali", price: "25" },
        ],
      },
      {
        title: "Flavoured Shai",
        items: [
          { name: "Chocolate", price: "25" },
          { name: "Paan", price: "25" },
          { name: "Kesar", price: "25" },
          { name: "Mango", price: "25" },
        ],
      },
      {
        title: "Caffè",
        note: "Add-ons: Caramel · Irish · Hazelnut · Vanilla  +₹10",
        items: [
          { name: "Black Caffè", price: "29" },
          { name: "Milk Caffè", price: "39" },
        ],
      },
      {
        title: "Healthy Shai",
        items: [
          { name: "Green Tea", price: "29" },
          { name: "Black Tea", price: "29" },
          { name: "Lemon Honey Tea", price: "29" },
          { name: "Kahwa", price: "29" },
        ],
      },
      {
        title: "Cup of Cozy",
        items: [
          { name: "Belgian Hot Cocoa", price: "59" },
          { name: "Caffè Hot Cocoa", price: "69" },
          { name: "Kesar Hot Milk", price: "69" },
        ],
      },
    ],
  },
  {
    id: "cold",
    label: "Cold Beverages",
    blurb: "Chilled, creamy, a little playful.",
    groups: [
      {
        title: "Frappé",
        note: "Flavour add-ons  +₹10–20",
        items: [
          { name: "Iced Black Coffee", price: "49" },
          { name: "Creamy Iced Coffee", price: "59" },
          { name: "Cookies & Cream", price: "79" },
          { name: "Brownie", price: "109" },
          { name: "Kesari Thandaai", price: "119" },
        ],
      },
      {
        title: "Mocktails",
        items: [
          { name: "Lemon Mint", price: "49" },
          { name: "Spicy Guava", price: "49" },
          { name: "Watermelon", price: "59" },
          { name: "Berry Blast", price: "69" },
          { name: "Black Currant Sparkler", price: "69" },
          { name: "Green Apple", price: "69" },
        ],
      },
    ],
  },
  {
    id: "appetizers",
    label: "Appetizers",
    blurb: "Little plates for sharing (or not).",
    groups: [
      {
        title: "Quick Bites",
        items: [
          { name: "Herbed Garlic Bread", price: "49" },
          { name: "Cheese Garlic Bread", price: "69" },
          { name: "Chilli Cheese Bruschetta", price: "69" },
          { name: "Cheesy Korean Bun", price: "79" },
          { name: "Kulhad Pizza", price: "99" },
        ],
      },
      {
        title: "Bun Maskas",
        items: [
          { name: "Butter", price: "29" },
          { name: "Butter Jam", price: "29" },
          { name: "Chocolate", price: "29" },
          { name: "Nutella", price: "29" },
          { name: "Biscoff", price: "39" },
        ],
      },
      {
        title: "Corns",
        note: "Salted · Peri-peri · Tandoori · Butter Cheese",
        items: [],
      },
      {
        title: "Maggie",
        items: [
          { name: "Masala", price: "49" },
          { name: "Veggie", price: "59" },
          { name: "Lemon Garlic", price: "79" },
          { name: "Chilli Cheese", price: "79" },
          { name: "Butter Cheese", price: "89" },
        ],
      },
      {
        title: "Sandwich",
        items: [
          { name: "Butter Toast", price: "29" },
          { name: "Nutella Toast", price: "49" },
          { name: "Bombay", price: "49" },
          { name: "Cheese Chutney", price: "59" },
          { name: "Jam with Cheese", price: "69" },
          { name: "Cheese Corn", price: "69" },
          { name: "Masala Cheese", price: "89" },
          { name: "Vegetable Club", price: "89" },
          { name: "Peri-peri Paneer", price: "99" },
        ],
      },
      {
        title: "Pasta",
        items: [
          { name: "Arrabbiata", price: "99" },
          { name: "Alfredo", price: "109" },
          { name: "Rosé", price: "119" },
        ],
      },
    ],
  },
  {
    id: "mains",
    label: "Mains",
    blurb: "The proper, tuck-in plates.",
    groups: [
      {
        title: "Burger",
        note: "Extra cheese  +₹15",
        items: [
          { name: "Classic Aloo Tikki", price: "59" },
          { name: "Veggie", price: "69" },
          { name: "Mexican Paneer", price: "99" },
          { name: "Double Decker", price: "109" },
        ],
      },
      {
        title: "Fries",
        note: "Loaded  +₹25",
        items: [
          { name: "Classic", price: "49" },
          { name: "Peri-peri", price: "59" },
          { name: "Masala", price: "79" },
        ],
      },
      {
        title: "Wraps",
        items: [
          { name: "Desi Aloo", price: "89" },
          { name: "Mexican", price: "89" },
          { name: "Veggie Delight", price: "99" },
          { name: "Corn Exotic", price: "99" },
          { name: "Tandoori Paneer", price: "109" },
        ],
      },
      {
        title: "Pizza",
        items: [
          { name: "Double Cheese Margherita", price: "99" },
          { name: "Farmer's", price: "129" },
          { name: "Corn Exotic", price: "149" },
        ],
      },
      {
        title: "Dessert",
        items: [
          { name: "Brownie with Hot Fudge", price: "79" },
          { name: "Biscoff Brownie", price: "89" },
        ],
      },
    ],
  },
];

export const menuNote = "Prices subject to change · Full menu in-store";

/* ---- Gallery ---- */
export type GalleryImg = { src: string; label: string; span?: "tall" | "wide" };
export const gallery: GalleryImg[] = [
  { src: "/aurum/gal-lamps.jpg", label: "Rattan lamps & the living flower wall", span: "wide" },
  { src: "/aurum/gal-logo-glow.jpg", label: "Our glowing emblem" },
  { src: "/aurum/food-wrap.jpg", label: "Fresh off the grill", span: "tall" },
  { src: "/aurum/gal-fairylights.jpg", label: "Fairy-lit corners" },
  { src: "/aurum/hero-interior.jpg", label: "The counter after dark", span: "wide" },
  { src: "/aurum/gal-poster.jpg", label: "Pune's cozy little secret" },
];
