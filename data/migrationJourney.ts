export type JourneyStage = "arrival" | "migration" | "branches";

export interface JourneyMilestone {
  id: string;
  name: string;
  stage: JourneyStage;
  era: string;
  coordinates: [number, number];
  precision: "mapped" | "approximate";
  note: string;
  image?: { src: string; alt: string };
  branches?: string[];
  source: string;
}

// Coordinates are WGS84 place centroids from OpenStreetMap Nominatim, checked
// 22 Nov 2026. Locality centroids are geographic references, not family-home
// addresses. Ambiguous spellings/places are explicitly marked approximate.
export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    id: "kodungalloor",
    name: "Kodungalloor",
    stage: "arrival",
    era: "A.D. 345 · Knanaya tradition",
    coordinates: [10.2276837, 76.1971531],
    precision: "mapped",
    note: "Knanaya family tradition associates the arrival at Kodungalloor with Knai Thoma and seventy-two families. This is presented as community tradition, not as independently verified archaeological fact. This stage is separate from the much later family migration south.",
    image: { src: "/images/history_roots.png", alt: "Existing family-history artwork associated with the community's arrival tradition" },
    source: "Family History page · location reference: OpenStreetMap Nominatim, Kodungallur, Kerala",
  },
  {
    id: "manimala-river",
    name: "Manimala River · mapped section near Eruvallipra",
    stage: "migration",
    era: "Modern geographic reference · approximate river section",
    coordinates: [9.3602565, 76.5497844],
    precision: "mapped",
    note: "This marker identifies a segment of the mapped Manimala River near the region; it is not a confirmed historical waypoint. Family tradition associates the later migration with the river, but the precise river reach and itinerary are not documented. The dashed map connector is illustrative only and must not be read as the ancestors' actual path.",
    source: "Family History page; river geometry: OpenStreetMap way 203615187 (Manimala River), checked 22 Nov 2026",
  },
  {
    id: "eruvallipra",
    name: "Eruvallipra, near Thiruvalla",
    stage: "migration",
    era: "Eighteenth century · family tradition",
    coordinates: [9.3792, 76.6005],
    precision: "approximate",
    note: "Family history says a group of ancestors travelled eastward along the Manimala River and settled at Eruvallipra. The exact Eruvallipra point and historical travel path could not be independently geocoded or established; this is an approximate locality marker, not a plotted river route.",
    image: { src: "/images/history_migration.png", alt: "Existing family-history migration illustration" },
    branches: ["Pullazhiyil", "Thanuvelil", "Poovathumparambil"],
    source: "Family History page; regional locality checked against Kerala Department of Mining and Geology Thiruvalla map, which labels Eruvallipra and the Manimala River",
  },
  {
    id: "thiruvanvandoor",
    name: "Thiruvanvandoor",
    stage: "branches",
    era: "Branch settlement · family history",
    coordinates: [9.3432746, 76.5788008],
    precision: "mapped",
    note: "The history identifies Sri. Kuriyala Kurian's move to Thiruvanvandoor and the adoption of the Thykurinjiyil family name. It also records the later Thoppil and Kolupra sub-branches.",
    branches: ["Thykurinjiyil", "Thykurinjiyil–Thoppil", "Thykurinjiyil–Kolupra"],
    source: "Family History page · location reference: OpenStreetMap Nominatim, Thiruvanvandoor, Kerala",
  },
  {
    id: "meenthalakkara",
    name: "Meenthalakkara",
    stage: "branches",
    era: "Branch settlement · family history",
    coordinates: [9.3830509, 76.5929773],
    precision: "mapped",
    note: "The history records Sri. Itty's later relocation here while retaining the Thanuvelil name, and identifies the Madathil and Thaiparambil sub-branches.",
    branches: ["Thanuvelil", "Thanuvelil–Madathil", "Thanuvelil–Thaiparambil"],
    source: "Family History page · location reference: OpenStreetMap Nominatim, Meenathalakkara, Kerala",
  },
  {
    id: "vallamkulam", name: "Vallamkulam", stage: "branches", era: "Family settlement named in the history", coordinates: [9.3758462, 76.6123136], precision: "mapped",
    note: "Named among the places where family members established homes. The available narrative does not assign this settlement to a particular branch.",
    source: "Family History page · location reference: OpenStreetMap Nominatim, Vallamkulam, Kerala",
  },
  {
    id: "venpala", name: "Venpala", stage: "branches", era: "Family settlement named in the history", coordinates: [9.3621057, 76.5633563], precision: "mapped",
    note: "Named among the places where family members established homes. The available narrative does not assign this settlement to a particular branch.",
    source: "Family History page · location reference: OpenStreetMap Nominatim, Venpala, Kerala",
  },
  {
    id: "ramamangalam", name: "Ramamangalam", stage: "branches", era: "Family settlement named in the history", coordinates: [9.93336, 76.50003], precision: "approximate",
    note: "Named among the places where family members established homes. The place-name is not unique; the map pin is an approximate candidate, not a confirmed family settlement coordinate. Branch association is not specified in the narrative.",
    source: "Family History page; approximate place-name match from OpenStreetMap Nominatim",
  },
  {
    id: "gurunathanmannu", name: "Gurunathanmannu", stage: "branches", era: "Family settlement named in the history", coordinates: [9.2895564, 77.0806377], precision: "approximate",
    note: "Named among the places where family members established homes. The mapped locality is an approximate place-name match; branch association is not specified in the narrative.",
    source: "Family History page; approximate place-name match from OpenStreetMap Nominatim",
  },
  {
    id: "vechoochira", name: "Vechoochira", stage: "branches", era: "Family settlement named in the history", coordinates: [9.4351054, 76.853677], precision: "mapped",
    note: "Named among the places where family members established homes. The available narrative does not assign this settlement to a particular branch.",
    source: "Family History page · location reference: OpenStreetMap Nominatim, Vechoochira, Kerala",
  },
  {
    id: "rajapuram", name: "Rajapuram", stage: "branches", era: "Family settlement named in the history", coordinates: [12.4224956, 75.2464743], precision: "approximate",
    note: "Named among the places where family members established homes. Rajapuram is an ambiguous place-name and this candidate is not confirmed as the family's Rajapuram; location requires family confirmation. Branch association is not specified in the narrative.",
    source: "Family History page; unconfirmed place-name candidate from OpenStreetMap Nominatim",
  },
  {
    id: "chingavanam", name: "Chingavanam", stage: "branches", era: "Family settlement named in the history", coordinates: [9.5247631, 76.5247268], precision: "mapped",
    note: "Named among the places where family members established homes. The available narrative does not assign this settlement to a particular branch.",
    source: "Family History page · location reference: OpenStreetMap Nominatim, Chingavanam, Kerala",
  },
  {
    id: "kurichy", name: "Kurichy", stage: "branches", era: "Family settlement named in the history", coordinates: [9.4945991, 76.5312747], precision: "mapped",
    note: "Named among the places where family members established homes. The available narrative does not assign this settlement to a particular branch.",
    source: "Family History page · location reference: OpenStreetMap Nominatim, Kurichy, Kerala",
  },
  {
    id: "kottayam", name: "Kottayam", stage: "branches", era: "Family settlement named in the history", coordinates: [9.6287383, 76.6455326], precision: "mapped",
    note: "Named among the places where family members established homes. The available narrative does not assign this settlement to a particular branch.",
    source: "Family History page · location reference: OpenStreetMap Nominatim, Kottayam, Kerala",
  },
];

export const ILLUSTRATIVE_MIGRATION_CONNECTOR: [number, number][] = [
  [9.3602565, 76.5497844], // mapped Manimala River node (OSM way 203615187)
  [9.3792, 76.6005], // approximate Eruvallipra locality pin
];

export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  arrival: "01 · Community arrival",
  migration: "02 · Later family migration",
  branches: "03 · Branch settlements",
};
