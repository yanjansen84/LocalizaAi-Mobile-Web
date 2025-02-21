-- Create categories table
CREATE TABLE categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    icon text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subcategories table
CREATE TABLE subcategories (
    id text PRIMARY KEY,
    category_id text REFERENCES categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add category and subcategory to events table
ALTER TABLE events 
ADD COLUMN category_id text REFERENCES categories(id),
ADD COLUMN subcategory_id text REFERENCES subcategories(id);

-- Create indexes for better performance
CREATE INDEX events_category_id_idx ON events(category_id);
CREATE INDEX events_subcategory_id_idx ON events(subcategory_id);
CREATE INDEX subcategories_category_id_idx ON subcategories(category_id);

-- Insert categories
INSERT INTO categories (id, name, icon) VALUES
    ('entertainment', 'Eventos e Entretenimento', '🎉'),
    ('sports', 'Esportes e Bem-estar', '🏆'),
    ('education', 'Educação e Desenvolvimento', '📚'),
    ('food', 'Gastronomia e Bebidas', '🍽️'),
    ('markets', 'Feiras e Mercados', '🛍️'),
    ('geek', 'Geek e Cultura Pop', '🎮'),
    ('culture', 'Cultura e Arte', '🎭'),
    ('business', 'Negócios e Networking', '🏗️'),
    ('religious', 'Religiosos e Espirituais', '🎤'),
    ('family', 'Infantil e Família', '🧒');

-- Insert subcategories
INSERT INTO subcategories (id, category_id, name) VALUES
    -- Eventos e Entretenimento
    ('parties', 'entertainment', 'Festas e Baladas'),
    ('shows', 'entertainment', 'Shows e Concertos'),
    ('festivals', 'entertainment', 'Festivais'),
    ('theater', 'entertainment', 'Teatro e Stand-up'),
    ('fairs', 'entertainment', 'Feiras e Exposições'),
    
    -- Esportes e Bem-estar
    ('running', 'sports', 'Corridas e Maratonas'),
    ('competitions', 'sports', 'Competições Esportivas'),
    ('training', 'sports', 'Aulas e Treinos'),
    ('yoga', 'sports', 'Yoga e Meditação'),
    
    -- Educação e Desenvolvimento
    ('workshops', 'education', 'Workshops e Cursos'),
    ('lectures', 'education', 'Palestras e Conferências'),
    ('academic', 'education', 'Encontros Acadêmicos'),
    
    -- Gastronomia e Bebidas
    ('food_festivals', 'food', 'Festivais Gastronômicos'),
    ('tasting', 'food', 'Degustações e Harmonizações'),
    ('street_food', 'food', 'Eventos de Street Food'),
    
    -- Feiras e Mercados
    ('crafts', 'markets', 'Artesanato e Moda'),
    ('entrepreneurs', 'markets', 'Feiras de Empreendedores'),
    ('organic', 'markets', 'Feiras Orgânicas'),
    
    -- Geek e Cultura Pop
    ('fandom', 'geek', 'Encontros de Fandom'),
    ('releases', 'geek', 'Lançamentos de Jogos e Filmes'),
    ('cosplay', 'geek', 'Eventos de Cosplay'),
    
    -- Cultura e Arte
    ('art', 'culture', 'Exposições de Arte'),
    ('photography', 'culture', 'Eventos de Fotografia'),
    ('popular', 'culture', 'Cultura Popular e Tradicional'),
    
    -- Negócios e Networking
    ('corporate', 'business', 'Eventos Corporativos'),
    ('entrepreneurship', 'business', 'Feiras de Empreendedorismo'),
    ('meetups', 'business', 'Meetups Profissionais'),
    
    -- Religiosos e Espirituais
    ('worship', 'religious', 'Cultos e Encontros Religiosos'),
    ('retreats', 'religious', 'Retiros Espirituais'),
    ('charity', 'religious', 'Eventos Beneficentes'),
    
    -- Infantil e Família
    ('kids', 'family', 'Eventos para Crianças'),
    ('kids_shows', 'family', 'Shows Infantis'),
    ('outdoor', 'family', 'Brincadeiras ao Ar Livre');
