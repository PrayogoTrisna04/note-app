export interface Note {
  id: string;
  ownerId: string;
  title: string;
  contentMd: string;
  visibility: "PRIVATE" | "PUBLIC";
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  shares: any[];
  comments: any[];
}


export interface Comment {
  id: string;
  contentMd: string;
  author?: {
    id: string;
    name: string;
  };
}

