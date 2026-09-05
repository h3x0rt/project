-- Создание базы данных
-- CREATE DATABASE yug_belora;

-- Пользователи
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Категории товаров
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Товары
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    description TEXT,
    unit VARCHAR(20) DEFAULT 'шт',
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Заказы
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total DECIMAL(12, 2) NOT NULL,
    delivery_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Позиции заказа
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL
);

-- Оборудование для аренды
CREATE TABLE rent_equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(12, 2) NOT NULL,
    deposit DECIMAL(12, 2) DEFAULT 0,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Заявки на аренду
CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    equipment_id INTEGER REFERENCES rent_equipment(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Отзывы
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_rentals_status ON rentals(status);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Сид-данные: категории
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Арматура', 'armatura', 'Строительная арматура различных диаметров', 1),
('Профильные трубы', 'profile-tubes', 'Профильные трубы прямоугольного и квадратного сечения', 2),
('Трубы', 'tubes', 'Круглые трубы различных диаметров', 3),
('Профнастил', 'profnastil', 'Профнастил для кровли и забора', 4),
('Сетка', 'setka', 'Сварная и рабица сетка', 5),
('Краска и растворители', 'paint', 'Строительные краски, грунтовки, растворители', 6),
('Крепёж', 'fasteners', 'Гвозди, саморезы, дюбели, анкера', 7);

-- Сид-данные: админ (пароль: admin123 — сменить в продакшене!)
-- Хеш bcrypt для "admin123": $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G
INSERT INTO users (email, password_hash, name, phone, role) VALUES
('admin@yugbelora.ru', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', 'Администратор', '+7 (999) 999-99-99', 'admin');

-- Сид-данные: примеры товаров
INSERT INTO products (name, category, price, stock, description, unit) VALUES
('Арматура А500С Ø12мм', 'armatura', 78500.00, 150, 'Строительная арматура класса А500С, диаметр 12 мм. Длина прутка 11.7 м.', 'т'),
('Арматура А500С Ø10мм', 'armatura', 79500.00, 200, 'Строительная арматура класса А500С, диаметр 10 мм. Длина прутка 11.7 м.', 'т'),
('Труба профильная 40x20x2', 'profile-tubes', 890.00, 80, 'Профильная труба 40x20 мм, толщина стенки 2 мм. Длина 6 м.', 'шт'),
('Труба профильная 60x40x2', 'profile-tubes', 1450.00, 60, 'Профильная труба 60x40 мм, толщина стенки 2 мм. Длина 6 м.', 'шт'),
('Труба ВГП Ø25x2.8', 'tubes', 1250.00, 100, 'Водогазопроводная труба диаметром 25 мм, толщина стенки 2.8 мм.', 'м'),
('Профнастил С8 0.4мм', 'profnastil', 450.00, 500, 'Профнастил С8, толщина 0.4 мм, оцинкованный. Ширина 1.2 м.', 'м²'),
('Сетка сварная 50x50x3', 'setka', 185.00, 300, 'Сварная сетка ячейка 50x50 мм, проволока 3 мм. Рулон 1.5x15 м.', 'м²'),
('Краска акриловая фасадная', 'paint', 1850.00, 40, 'Акриловая фасадная краска, белая, 10 л. Расход 150-200 г/м².', 'шт'),
('Саморезы по металлу 3.5x25', 'fasteners', 280.00, 1000, 'Саморезы с прессшайбой по металлу, 3.5x25 мм. Упаковка 1000 шт.', 'упак');