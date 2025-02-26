import { useState, useCallback, useEffect } from 'react';
import { Category, getCategories } from '../lib/categories';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setActiveCategories(data); // Inicialmente, todas as categorias são ativas
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActiveCategories = useCallback((eventCategoryIds: string[]) => {
    const active = categories.filter(category => 
      eventCategoryIds.includes(category.id)
    );
    setActiveCategories(active);
  }, [categories]);

  // Carrega as categorias quando o hook é inicializado
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    activeCategories,
    loading,
    error,
    loadCategories,
    updateActiveCategories
  };
};
