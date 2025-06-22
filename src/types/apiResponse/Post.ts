export interface IPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface IPostUserComment {
  vote: 'positive' | 'negative' | null;
  user: {
    id: string;
    name: string;
    profile_image: string;
    rank: number;
    company?: string;
    total_energy: number;
  };
  // omit user_id from post
  post: {
    id: string;
    title: string;
    body: string;
    tags: string[];
    created_at: string;
    energy: number;
  }
  comments?: {
    count: number;
    top_comment: {
      id: string;
      user: IPostUserComment["user"];
      body: string;
      created_at: string;
      energy: number;
    };
  };
}