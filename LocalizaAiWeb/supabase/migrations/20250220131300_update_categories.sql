-- Primeiro, remover as referências de subcategoria dos eventos
ALTER TABLE events DROP COLUMN IF EXISTS subcategory_id;

-- Remover a tabela de subcategorias
DROP TABLE IF EXISTS subcategories;

-- Limpar todas as categorias existentes
TRUNCATE TABLE categories CASCADE;

-- Inserir as novas categorias
INSERT INTO categories (name) VALUES
    ('Festas'),
    ('Bares'),
    ('Lanchonetes'),
    ('Teatro'),
    ('Shows'),
    ('Baladas'),
    ('Restaurantes'),
    ('Esportes'),
    ('Feiras'),
    ('Eventos'),
    ('Exposições');
