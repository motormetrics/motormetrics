/**
 * Singapore's 28 postal districts, keyed by the first two digits of a postal
 * code, with the region each one is grouped under on the charging pages.
 *
 * Names follow the common usage rather than the gazetted list, so they read
 * the way drivers talk about them.
 */

export type PostalRegion = "Central" | "East" | "North-East" | "North" | "West";

export interface PostalDistrict {
  slug: string;
  name: string;
  region: PostalRegion;
  /** Leading two digits of the postal codes that fall in the district. */
  sectors: string[];
}

export const POSTAL_DISTRICTS: PostalDistrict[] = [
  {
    slug: "raffles-place-marina",
    name: "Raffles Place / Marina",
    region: "Central",
    sectors: ["01", "02", "03", "04", "05", "06"],
  },
  {
    slug: "anson-tanjong-pagar",
    name: "Anson / Tanjong Pagar",
    region: "Central",
    sectors: ["07", "08"],
  },
  {
    slug: "queenstown-tiong-bahru",
    name: "Queenstown / Tiong Bahru",
    region: "Central",
    sectors: ["14", "15", "16"],
  },
  {
    slug: "telok-blangah-harbourfront",
    name: "Telok Blangah / HarbourFront",
    region: "Central",
    sectors: ["09", "10"],
  },
  {
    slug: "pasir-panjang-clementi",
    name: "Pasir Panjang / Clementi",
    region: "West",
    sectors: ["11", "12", "13"],
  },
  {
    slug: "high-street-city-hall",
    name: "High Street / City Hall",
    region: "Central",
    sectors: ["17"],
  },
  {
    slug: "middle-road-bugis",
    name: "Middle Road / Bugis",
    region: "Central",
    sectors: ["18", "19"],
  },
  {
    slug: "little-india-farrer-park",
    name: "Little India / Farrer Park",
    region: "Central",
    sectors: ["20", "21"],
  },
  {
    slug: "orchard-river-valley",
    name: "Orchard / River Valley",
    region: "Central",
    sectors: ["22", "23"],
  },
  {
    slug: "bukit-timah-holland",
    name: "Bukit Timah / Holland",
    region: "Central",
    sectors: ["24", "25", "26", "27"],
  },
  {
    slug: "novena-thomson",
    name: "Novena / Thomson",
    region: "Central",
    sectors: ["28", "29", "30"],
  },
  {
    slug: "balestier-toa-payoh",
    name: "Balestier / Toa Payoh",
    region: "Central",
    sectors: ["31", "32", "33"],
  },
  {
    slug: "macpherson-potong-pasir",
    name: "Macpherson / Potong Pasir",
    region: "Central",
    sectors: ["34", "35", "36", "37"],
  },
  {
    slug: "geylang-paya-lebar",
    name: "Geylang / Paya Lebar",
    region: "Central",
    sectors: ["38", "39", "40", "41"],
  },
  {
    slug: "katong-marine-parade",
    name: "Katong / Marine Parade",
    region: "East",
    sectors: ["42", "43", "44", "45"],
  },
  {
    slug: "bedok-upper-east-coast",
    name: "Bedok / Upper East Coast",
    region: "East",
    sectors: ["46", "47", "48"],
  },
  {
    slug: "loyang-changi",
    name: "Loyang / Changi",
    region: "East",
    sectors: ["49", "50", "81"],
  },
  {
    slug: "tampines-pasir-ris",
    name: "Tampines / Pasir Ris",
    region: "East",
    sectors: ["51", "52"],
  },
  {
    slug: "hougang-punggol-sengkang",
    name: "Hougang / Punggol / Sengkang",
    region: "North-East",
    sectors: ["53", "54", "55", "82"],
  },
  {
    slug: "bishan-ang-mo-kio",
    name: "Bishan / Ang Mo Kio",
    region: "North-East",
    sectors: ["56", "57"],
  },
  {
    slug: "upper-bukit-timah-clementi-park",
    name: "Upper Bukit Timah / Clementi Park",
    region: "West",
    sectors: ["58", "59"],
  },
  {
    slug: "jurong-boon-lay-tuas",
    name: "Jurong / Boon Lay / Tuas",
    region: "West",
    sectors: ["60", "61", "62", "63", "64"],
  },
  {
    slug: "hillview-bukit-panjang-choa-chu-kang",
    name: "Hillview / Bukit Panjang / Choa Chu Kang",
    region: "West",
    sectors: ["65", "66", "67", "68"],
  },
  {
    slug: "lim-chu-kang-tengah",
    name: "Lim Chu Kang / Tengah",
    region: "North",
    sectors: ["69", "70", "71"],
  },
  {
    slug: "woodlands-admiralty",
    name: "Woodlands / Admiralty",
    region: "North",
    sectors: ["72", "73"],
  },
  {
    slug: "yishun-sembawang",
    name: "Yishun / Sembawang",
    region: "North",
    sectors: ["75", "76"],
  },
  {
    slug: "upper-thomson-springleaf",
    name: "Upper Thomson / Springleaf",
    region: "North",
    sectors: ["77", "78"],
  },
  {
    slug: "seletar-yio-chu-kang",
    name: "Seletar / Yio Chu Kang",
    region: "North-East",
    sectors: ["79", "80"],
  },
];

const BY_SLUG = new Map(
  POSTAL_DISTRICTS.map((district) => [district.slug, district]),
);
const BY_SECTOR = new Map(
  POSTAL_DISTRICTS.flatMap((district) =>
    district.sectors.map((sector) => [sector, district] as const),
  ),
);

export const getPostalDistrict = (slug: string): PostalDistrict | undefined =>
  BY_SLUG.get(slug);

/** The district a postal code falls in, or `undefined` for unassigned sectors. */
export const districtForPostalCode = (
  postalCode: string | null | undefined,
): PostalDistrict | undefined =>
  postalCode ? BY_SECTOR.get(postalCode.slice(0, 2)) : undefined;
