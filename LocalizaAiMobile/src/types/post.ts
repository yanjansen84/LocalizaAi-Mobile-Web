export interface Post {
  id: string;
  user_id: string;
  image_url?: string;
  caption?: string;
  created_at: string;
  location?: string;
  is_liked: boolean;
  is_saved: boolean;
  likes_count: number;
  comments_count: number;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  latest_comment?: {
    user_full_name: string;
    content: string;
  };
}
