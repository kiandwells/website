export type SocialLink = {
  title: string;
  href: string;
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  imageCount: number;
};

export type Amenity = {
  id: string;
  label: string;
  image: string;
};

export const site = {
  name: "Kian Dwells",
  tagline: "Fully managed Luxurious service apartments",
  email: "hello@kiandwells.com",
  phone: "+91 8660544699",
  location: "243, 8th cross, K C Layout, Mysore. 570011",
  mapUrl: "https://maps.app.goo.gl/uZADoB6YBm1nrckC6?g_st=iw",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Kian+DWELLS,+243,+8th+Cross+Rd,+KC+Layout,+Mysuru,+Karnataka+570011&output=embed",
  credit: "© 2026 Kian Dwells. All rights reserved.",
  socials: [
    { title: "Instagram", href: "https://instagram.com/" },
    { title: "Youtube", href: "https://youtube.com/" },
  ] as SocialLink[],
};

export const projects: Project[] = [
  {
    slug: "fortune",
    title: "Fortune",
    tagline: "Luxurious 3 BHK house",
    imageCount: 3,
  },
  {
    slug: "golden-nest",
    title: "Golden Nest",
    tagline: "Opulent 3 BHK house",
    imageCount: 3,
  },
  {
    slug: "palace-view",
    title: "Palace View",
    tagline: "Serene 2 BHK house",
    imageCount: 3,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

function placeholderImage(label: string): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">`,
    `<rect width="1200" height="900" fill="#a4c2b4"/>`,
    `<rect x="40" y="40" width="1120" height="820" fill="none" stroke="#191a1a" stroke-opacity="0.15" stroke-width="2"/>`,
    `<text x="600" y="440" text-anchor="middle" font-family="sans-serif" font-size="64" fill="#191a1a" fill-opacity="0.75">${label}</text>`,
    `</svg>`,
  ].join("");
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const amenities: Amenity[] = [
  { id: "living-room", label: "Living Room", image: placeholderImage("Living Room") },
  { id: "kitchen", label: "Kitchen", image: placeholderImage("Kitchen") },
  { id: "bedroom", label: "Bedroom", image: placeholderImage("Bedroom") },
  { id: "bathroom", label: "Bathroom", image: placeholderImage("Bathroom") },
  { id: "wifi", label: "High-Speed Wi-Fi", image: placeholderImage("Wi-Fi") },
  { id: "ac", label: "Air Conditioning", image: placeholderImage("A/C") },
  { id: "tv", label: "Smart TV", image: placeholderImage("Smart TV") },
  { id: "washing", label: "Washing Machine", image: placeholderImage("Washing Machine") },
  { id: "parking", label: "Parking", image: placeholderImage("Parking") },
  { id: "gym", label: "Gym", image: placeholderImage("Gym") },
];
