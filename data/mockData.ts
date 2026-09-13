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

// NOTE: MOCK_COMMITTEE_MEMBERS and MOCK_GALLERY have been removed
// as the application now uses live database data from committee_members
// and gallery_records tables respectively.


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
