-- Add category columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES subcategories(id);

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create subcategories table if it doesn't exist
CREATE TABLE IF NOT EXISTS subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Add policies for categories
CREATE POLICY "Enable read access for all users on categories"
ON categories FOR SELECT
USING (true);

-- Add policies for subcategories
CREATE POLICY "Enable read access for all users on subcategories"
ON subcategories FOR SELECT
USING (true);

-- Insert some default categories
INSERT INTO categories (name) VALUES
    ('Música'),
    ('Esportes'),
    ('Arte e Cultura'),
    ('Tecnologia'),
    ('Gastronomia')
ON CONFLICT (id) DO NOTHING;

-- Insert default subcategories
WITH category_ids AS (
    SELECT id, name FROM categories
)
INSERT INTO subcategories (category_id, name)
SELECT 
    c.id,
    sub.name
FROM category_ids c
CROSS JOIN (
    VALUES 
        ('Música', 'Shows'),
        ('Música', 'Festivais'),
        ('Música', 'Karaokê'),
        ('Esportes', 'Futebol'),
        ('Esportes', 'Corrida'),
        ('Esportes', 'Ciclismo'),
        ('Arte e Cultura', 'Teatro'),
        ('Arte e Cultura', 'Cinema'),
        ('Arte e Cultura', 'Exposições'),
        ('Tecnologia', 'Conferências'),
        ('Tecnologia', 'Workshops'),
        ('Tecnologia', 'Hackathons'),
        ('Gastronomia', 'Festivais'),
        ('Gastronomia', 'Degustação'),
        ('Gastronomia', 'Aulas de Culinária')
) AS sub(category, name)
WHERE c.name = sub.category
ON CONFLICT DO NOTHING;
