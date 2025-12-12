export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
}

export interface ArticleMetadata {
  id: string;
  title: string;
  excerpt?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  tags?: string[];
}


