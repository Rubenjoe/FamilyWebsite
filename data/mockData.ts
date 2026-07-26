export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  malayalamName?: string;
  generation: number;
  branch: string;
  profession?: string;
  location: string;
  profilePhotoUrl: string;
  isAlive: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format or date string
  status: "upcoming" | "past";
  location: string;
  time?: string;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  location?: string;
}

export interface GalleryItem {
  id: string;
  album: string;
  imageUrl: string;
  title: string;
  description?: string;
  year?: string;
  branch?: string;
}

export interface DocumentItem {
  id: string;
  category: string;
  dateAdded: string;
  title: string;
  description: string;
  fileSize: string;
}

export const MOCK_MEMBERS: Member[] = [
  { id: "1", firstName: "Ouseph", lastName: "Pulazhiyil", malayalamName: "ഔസേപ്പ്", generation: 1, branch: "Vadakke", profession: "Agriculturist", location: "Thrissur", profilePhotoUrl: "/placeholder.png", isAlive: false },
  { id: "2", firstName: "Mariam", lastName: "Pulazhiyil", malayalamName: "മറിയം", generation: 1, branch: "Vadakke", profession: "Homemaker", location: "Thrissur", profilePhotoUrl: "/placeholder.png", isAlive: false },
  { id: "3", firstName: "Joseph", lastName: "Pulazhiyil", generation: 2, branch: "Kizhake", profession: "Teacher", location: "Kochi", profilePhotoUrl: "/placeholder.png", isAlive: true },
  { id: "4", firstName: "Thomas", lastName: "Pulazhiyil", generation: 2, branch: "Thekke", profession: "Engineer", location: "Bangalore", profilePhotoUrl: "/placeholder.png", isAlive: true },
  { id: "5", firstName: "Ann", lastName: "Pulazhiyil", generation: 2, branch: "Padinjare", profession: "Doctor", location: "Dubai", profilePhotoUrl: "/placeholder.png", isAlive: true },
  { id: "6", firstName: "Mathew", lastName: "Pulazhiyil", generation: 3, branch: "Vadakke", profession: "Software Developer", location: "USA", profilePhotoUrl: "/placeholder.png", isAlive: true },
  { id: "7", firstName: "Elizabeth", lastName: "Pulazhiyil", generation: 3, branch: "Kizhake", profession: "Architect", location: "Mumbai", profilePhotoUrl: "/placeholder.png", isAlive: true }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "e1",
    title: "Annual Kudumbayogam General Body Meeting",
    description: "The official annual get-together of all members of the Pulazhiyil family featuring cultural events, heritage sharing, and standard administrative discussions.",
    date: "2026-09-12",
    status: "upcoming",
    location: "Kudumbayogam Hall, Thrissur, Kerala",
    time: "10:00 AM"
  },
  {
    id: "e2",
    title: "Youth Committee Leadership Workshop",
    description: "Empowering the next generation of leadership with family heritage storytelling, soft skills, and strategic community development planning.",
    date: "2026-10-25",
    status: "upcoming",
    location: "St. Thomas Family Hall, Thrissur",
    time: "02:00 PM"
  }
];

export const MOCK_TIMELINE: TimelineItem[] = [
  {
    id: "t1",
    year: "1924",
    title: "Ancestral Foundation",
    description: "Establishment of the primary agricultural and educational foundations by the family elders in central Thrissur."
  },
  {
    id: "t2",
    year: "1958",
    title: "First Formal Kudumbayogam",
    description: "The inaugural organized assembly of all branch families to initiate welfare schemes and educational funds."
  },
  {
    id: "t3",
    year: "2000",
    title: "Millennium Directory",
    description: "Release of the first complete printed genealogy chart mapping 350+ direct descendants."
  }
];

export const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: "d1", category: "Deed", title: "Original Land Deed (1924)", dateAdded: "1924-05-12", description: "The original land deed from the ancestral home in Thrissur.", fileSize: "2.4 MB" },
  { id: "d2", category: "Charter", title: "Kudumbayogam Constitution v1", dateAdded: "1952-11-20", description: "The formally written charter establishing the family council.", fileSize: "1.1 MB" }
];

export const MOCK_GALLERY: GalleryItem[] = [
  { id: "g1", album: "Historical", imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800", title: "Ancestral Home Construction", year: "1925", description: "The foundation laying of the tharavadu in Thrissur.", branch: "Pullazhiyil" },
  { id: "g2", album: "Reunions", imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800", title: "Global Reunion 2010", year: "2010", description: "Family gathering with over 200 members attending from 12 countries.", branch: "Thykurinjiyil" }
];
