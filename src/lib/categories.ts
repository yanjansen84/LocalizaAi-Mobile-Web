import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories;
}
