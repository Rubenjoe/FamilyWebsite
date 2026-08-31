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

export const MOCK_MEMBERS: Member[] = [];

export const MOCK_COMMITTEE_MEMBERS: Member[] = [
  { id: "committee-1", firstName: "Joemon Thomas", lastName: "Thanuvelil", generation: 1, branch: "Thanuvelil", profession: "President", location: "Kerala", profilePhotoUrl: "/members/Joemon Thomas Thanuvelil.jpeg", isAlive: true },
  { id: "committee-2", firstName: "Lt. Cdr Kuriakose Mathew(Aniyan)", lastName: "Thanuvelil", generation: 1, branch: "Thanuvelil", profession: "TREASURER", location: "Kerala", profilePhotoUrl: "/achv/Lt. Cdr Kuriakose Mathew(Aniyan). .jpeg", isAlive: true },
  { id: "committee-3", firstName: "Moncy Abraham", lastName: "Thanuvelil Madathil", generation: 1, branch: "Thanuvelil", profession: "Committee Member", location: "Kerala", profilePhotoUrl: "/members/Moncy Abraham,Thanuvelil-Madathil.jpeg", isAlive: true },
  { id: "committee-4", firstName: "Bino Abraham", lastName: "Thykurinjiyil Thoppil", generation: 1, branch: "Thykurinjiyil", profession: "Committee Member", location: "Kerala", profilePhotoUrl: "/members/Bino Abraham ,Thykurinjiyil Thoppil.jpeg", isAlive: true }
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
