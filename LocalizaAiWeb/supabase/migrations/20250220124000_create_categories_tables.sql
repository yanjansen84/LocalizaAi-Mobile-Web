-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable read access for all users on categories"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Enable read access for all users on subcategories"
ON subcategories FOR SELECT
USING (true);

-- Insert categories
INSERT INTO categories (name) VALUES
    ('Música'),
    ('Esportes'),
    ('Arte e Cultura'),
    ('Tecnologia'),
    ('Gastronomia'),
    ('Educação'),
    ('Negócios'),
    ('Saúde e Bem-estar'),
    ('Entretenimento'),
    ('Social')
ON CONFLICT DO NOTHING;

-- Insert subcategories
WITH category_music AS (
    SELECT id FROM categories WHERE name = 'Música'
),
category_sports AS (
    SELECT id FROM categories WHERE name = 'Esportes'
),
category_art AS (
    SELECT id FROM categories WHERE name = 'Arte e Cultura'
),
category_tech AS (
    SELECT id FROM categories WHERE name = 'Tecnologia'
),
category_food AS (
    SELECT id FROM categories WHERE name = 'Gastronomia'
),
category_education AS (
    SELECT id FROM categories WHERE name = 'Educação'
),
category_business AS (
    SELECT id FROM categories WHERE name = 'Negócios'
),
category_health AS (
    SELECT id FROM categories WHERE name = 'Saúde e Bem-estar'
),
category_entertainment AS (
    SELECT id FROM categories WHERE name = 'Entretenimento'
),
category_social AS (
    SELECT id FROM categories WHERE name = 'Social'
)
INSERT INTO subcategories (category_id, name)
SELECT id, name
FROM (
    -- Música
    SELECT id, 'Shows' as name FROM category_music
    UNION ALL
    SELECT id, 'Festivais' FROM category_music
    UNION ALL
    SELECT id, 'Karaokê' FROM category_music
    -- Esportes
    UNION ALL
    SELECT id, 'Futebol' FROM category_sports
    UNION ALL
    SELECT id, 'Corrida' FROM category_sports
    UNION ALL
    SELECT id, 'Ciclismo' FROM category_sports
    -- Arte e Cultura
    UNION ALL
    SELECT id, 'Teatro' FROM category_art
    UNION ALL
    SELECT id, 'Cinema' FROM category_art
    UNION ALL
    SELECT id, 'Exposições' FROM category_art
    -- Tecnologia
    UNION ALL
    SELECT id, 'Conferências' FROM category_tech
    UNION ALL
    SELECT id, 'Workshops' FROM category_tech
    UNION ALL
    SELECT id, 'Hackathons' FROM category_tech
    -- Gastronomia
    UNION ALL
    SELECT id, 'Festivais Gastronômicos' FROM category_food
    UNION ALL
    SELECT id, 'Degustação' FROM category_food
    UNION ALL
    SELECT id, 'Aulas de Culinária' FROM category_food
    -- Educação
    UNION ALL
    SELECT id, 'Cursos' FROM category_education
    UNION ALL
    SELECT id, 'Palestras' FROM category_education
    UNION ALL
    SELECT id, 'Workshops Educacionais' FROM category_education
    -- Negócios
    UNION ALL
    SELECT id, 'Networking' FROM category_business
    UNION ALL
    SELECT id, 'Conferências' FROM category_business
    UNION ALL
    SELECT id, 'Feiras' FROM category_business
    -- Saúde e Bem-estar
    UNION ALL
    SELECT id, 'Yoga' FROM category_health
    UNION ALL
    SELECT id, 'Meditação' FROM category_health
    UNION ALL
    SELECT id, 'Palestras de Saúde' FROM category_health
    -- Entretenimento
    UNION ALL
    SELECT id, 'Stand-up Comedy' FROM category_entertainment
    UNION ALL
    SELECT id, 'Festas' FROM category_entertainment
    UNION ALL
    SELECT id, 'Jogos' FROM category_entertainment
    -- Social
    UNION ALL
    SELECT id, 'Encontros' FROM category_social
    UNION ALL
    SELECT id, 'Voluntariado' FROM category_social
    UNION ALL
    SELECT id, 'Ações Sociais' FROM category_social
) AS subcategories(id, name)
ON CONFLICT DO NOTHING;
