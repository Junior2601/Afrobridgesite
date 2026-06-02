-- =====================================================================
--  MARKETPLACE MULTIFONCTION  —  Schéma PostgreSQL (compatible Render)
--  Produits (e-commerce) + Services + Immobilier
--  IDs entiers (SERIAL / BIGSERIAL) — AUCUN UUID
--  PostgreSQL 14+  (testé pour Render PostgreSQL)
-- =====================================================================

-- Extension pour la recherche "intelligente" par similarité de texte
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fonction utilitaire : met à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =====================================================================
--  1. UTILISATEURS & PROFILS
-- =====================================================================

-- Rôles : client, seller (vendeur), agent (immobilier), admin
-- Le "visiteur" n'a pas de compte, donc pas stocké ici.
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'client'
                  CHECK (role IN ('client', 'seller', 'agent', 'admin')),
    avatar_url    TEXT,
    country       VARCHAR(100),
    city          VARCHAR(100),
    language      VARCHAR(10)  DEFAULT 'fr',
    is_active     BOOLEAN      DEFAULT TRUE,   -- compte bloqué/actif
    is_verified   BOOLEAN      DEFAULT FALSE,  -- email vérifié
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW()
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Boutique du vendeur (création = compte vendeur à valider par l'admin)
CREATE TABLE shops (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(180) UNIQUE NOT NULL,
    description     TEXT,
    logo_url        TEXT,
    banner_url      TEXT,
    commission_rate NUMERIC(5,2),                    -- override de commission (NULL = taux global)
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    rejection_reason TEXT,
    validated_by    INTEGER REFERENCES users(id),    -- admin qui valide
    validated_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_shops_updated BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Profil agent immobilier (à valider par l'admin également)
CREATE TABLE agent_profiles (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_name    VARCHAR(150),
    license_number VARCHAR(100),
    bio            TEXT,
    status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    validated_by   INTEGER REFERENCES users(id),
    validated_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  2. CATÉGORIES (produits ET services, hiérarchie via parent_id)
-- =====================================================================
CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    slug       VARCHAR(150) UNIQUE NOT NULL,
    type       VARCHAR(20) NOT NULL DEFAULT 'product'
               CHECK (type IN ('product', 'service')),
    parent_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL, -- NULL = catégorie racine, sinon sous-catégorie
    icon       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  3. PRODUITS
-- =====================================================================
CREATE TABLE products (
    id                 SERIAL PRIMARY KEY,
    shop_id            INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id        INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title              VARCHAR(200) NOT NULL,
    slug               VARCHAR(230),
    description        TEXT,
    price              NUMERIC(12,2) NOT NULL,
    promo_price        NUMERIC(12,2),               -- prix promotionnel (NULL si pas de promo)
    sku                VARCHAR(80),
    stock              INTEGER DEFAULT 0,
    delivery_available BOOLEAN DEFAULT FALSE,
    rating_avg         NUMERIC(3,2) DEFAULT 0,      -- note moyenne (mise à jour à chaque avis)
    rating_count       INTEGER DEFAULT 0,
    -- Le produit est publié dès que la boutique est approuvée.
    -- Mets le défaut à 'pending' si tu veux aussi valider chaque produit.
    status             VARCHAR(20) NOT NULL DEFAULT 'approved'
                       CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    is_active          BOOLEAN DEFAULT TRUE,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE product_images (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    position   INTEGER DEFAULT 0
);


-- =====================================================================
--  4. SERVICES  (création = à VALIDER par l'admin)
-- =====================================================================
CREATE TABLE services (
    id                 SERIAL PRIMARY KEY,
    shop_id            INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id        INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title              VARCHAR(200) NOT NULL,
    slug               VARCHAR(230),
    description        TEXT,
    price              NUMERIC(12,2) NOT NULL,
    delivery_time_days INTEGER,                     -- délai de réalisation
    orders_count       INTEGER DEFAULT 0,
    rating_avg         NUMERIC(3,2) DEFAULT 0,
    rating_count       INTEGER DEFAULT 0,
    -- Validation obligatoire : 'pending' par défaut
    status             VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    rejection_reason   TEXT,
    validated_by       INTEGER REFERENCES users(id),
    validated_at       TIMESTAMPTZ,
    is_active          BOOLEAN DEFAULT TRUE,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE service_images (
    id         SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL,
    position   INTEGER DEFAULT 0
);

CREATE TABLE service_portfolio (
    id          SERIAL PRIMARY KEY,
    service_id  INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    title       VARCHAR(150),
    image_url   TEXT,
    link_url    TEXT,
    description TEXT
);


-- =====================================================================
--  5. IMMOBILIER
-- =====================================================================
CREATE TABLE properties (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- propriétaire/publieur
    agent_id         INTEGER REFERENCES agent_profiles(id) ON DELETE SET NULL,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    price            NUMERIC(14,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL
                     CHECK (transaction_type IN ('location', 'vente')),
    property_type    VARCHAR(30) NOT NULL
                     CHECK (property_type IN ('appartement','maison','villa','terrain','bureau','commerce')),
    country          VARCHAR(100),
    city             VARCHAR(100),
    address          TEXT,
    latitude         NUMERIC(10,7),               -- coordonnées GPS
    longitude        NUMERIC(10,7),
    surface          NUMERIC(10,2),               -- en m²
    rooms            INTEGER,                     -- nombre de pièces
    bedrooms         INTEGER,                     -- nombre de chambres
    bathrooms        INTEGER,                     -- nombre de salles de bain
    virtual_tour_url TEXT,                        -- visite virtuelle
    status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','approved','rejected','suspended')),
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE property_images (
    id          SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    is_primary  BOOLEAN DEFAULT FALSE,
    position    INTEGER DEFAULT 0
);

CREATE TABLE property_videos (
    id          SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    video_url   TEXT NOT NULL,
    position    INTEGER DEFAULT 0
);


-- =====================================================================
--  6. FAVORIS  (polymorphe : produit / service / bien)
-- =====================================================================
CREATE TABLE favorites (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type  VARCHAR(20) NOT NULL
               CHECK (item_type IN ('product', 'service', 'property')),
    item_id    INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, item_type, item_id)
);


-- =====================================================================
--  7. PANIER  (uniquement pour les produits physiques)
-- =====================================================================
CREATE TABLE cart_items (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);


-- =====================================================================
--  8. COUPONS DE RÉDUCTION
-- =====================================================================
CREATE TABLE coupons (
    id             SERIAL PRIMARY KEY,
    code           VARCHAR(50) UNIQUE NOT NULL,
    discount_type  VARCHAR(10) NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL,
    shop_id        INTEGER REFERENCES shops(id) ON DELETE CASCADE, -- NULL = coupon plateforme
    min_amount     NUMERIC(12,2) DEFAULT 0,
    max_uses       INTEGER,
    used_count     INTEGER DEFAULT 0,
    expires_at     TIMESTAMPTZ,
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  9. COMMANDES PRODUITS
-- =====================================================================
CREATE TABLE orders (
    id                SERIAL PRIMARY KEY,
    order_number      VARCHAR(30) UNIQUE NOT NULL,
    client_id         INTEGER NOT NULL REFERENCES users(id),
    shop_id           INTEGER REFERENCES shops(id),
    total_amount      NUMERIC(12,2) NOT NULL,
    discount_amount   NUMERIC(12,2) DEFAULT 0,
    coupon_id         INTEGER REFERENCES coupons(id),
    commission_amount NUMERIC(12,2) DEFAULT 0,      -- commission plateforme
    status            VARCHAR(20) NOT NULL DEFAULT 'awaiting_payment'
                      CHECK (status IN ('awaiting_payment','paid','processing','shipped','delivered','completed','cancelled')),
    shipping_address  TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    title      VARCHAR(200),          -- snapshot du titre au moment de l'achat
    unit_price NUMERIC(12,2) NOT NULL,
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    subtotal   NUMERIC(12,2) NOT NULL
);


-- =====================================================================
--  10. COMMANDES DE SERVICES (réservation Fiverr-like)
-- =====================================================================
CREATE TABLE service_orders (
    id                SERIAL PRIMARY KEY,
    order_number      VARCHAR(30) UNIQUE NOT NULL,
    client_id         INTEGER NOT NULL REFERENCES users(id),
    service_id        INTEGER NOT NULL REFERENCES services(id),
    shop_id           INTEGER REFERENCES shops(id),
    amount            NUMERIC(12,2) NOT NULL,
    commission_amount NUMERIC(12,2) DEFAULT 0,
    requirements      TEXT,                          -- brief / consignes du client
    delivery_url      TEXT,                          -- livraison du travail
    delivered_at      TIMESTAMPTZ,
    validated_at      TIMESTAMPTZ,                   -- validation client
    status            VARCHAR(20) NOT NULL DEFAULT 'awaiting_payment'
                      CHECK (status IN ('awaiting_payment','paid','in_progress','delivered','completed','cancelled')),
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_service_orders_updated BEFORE UPDATE ON service_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =====================================================================
--  11. RÉSERVATIONS DE VISITES IMMOBILIÈRES
-- =====================================================================
CREATE TABLE property_visits (
    id          SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    client_id   INTEGER NOT NULL REFERENCES users(id),
    visit_date  TIMESTAMPTZ NOT NULL,
    message     TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','cancelled','completed')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  12. AVIS  (polymorphe : produit / service / bien)
-- =====================================================================
CREATE TABLE reviews (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type  VARCHAR(20) NOT NULL
               CHECK (item_type IN ('product', 'service', 'property')),
    item_id    INTEGER NOT NULL,
    rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, item_type, item_id)
);


-- =====================================================================
--  13. PARAMÈTRES & NUMÉROS DE PAIEMENT AUTORISÉS (gérés par l'admin)
-- =====================================================================

-- Paramètres globaux clé/valeur (n° WhatsApp, taux de commission, etc.)
CREATE TABLE settings (
    id         SERIAL PRIMARY KEY,
    key        VARCHAR(80) UNIQUE NOT NULL,
    value      TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Numéros autorisés affichés au client lors de la validation
-- d'une commande / réservation pour qu'il y effectue la transaction.
CREATE TABLE payment_numbers (
    id           SERIAL PRIMARY KEY,
    label        VARCHAR(100) NOT NULL,   -- ex: "Orange Money", "Wave", "Sber", "Tinkoff"
    phone_number VARCHAR(40)  NOT NULL,   -- numéro sur lequel payer
    account_name VARCHAR(150),            -- nom du bénéficiaire
    instructions TEXT,                    -- consignes éventuelles
    is_active    BOOLEAN DEFAULT TRUE,    -- l'admin active/désactive
    created_by   INTEGER REFERENCES users(id),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  14. PAIEMENTS (manuel : reçu uploadé + confirmation par WhatsApp/admin)
-- =====================================================================
-- Chaque paiement est rattaché à UNE seule cible : commande, commande
-- de service, ou visite immobilière (contrainte ci-dessous).
CREATE TABLE payments (
    id                SERIAL PRIMARY KEY,
    reference         VARCHAR(40) UNIQUE NOT NULL,
    client_id         INTEGER NOT NULL REFERENCES users(id),
    order_id          INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    service_order_id  INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    property_visit_id INTEGER REFERENCES property_visits(id) ON DELETE CASCADE,
    payment_number_id INTEGER REFERENCES payment_numbers(id), -- numéro utilisé par le client
    amount            NUMERIC(12,2) NOT NULL,
    receipt_url       TEXT,                       -- capture du reçu de paiement (image uploadée)
    whatsapp_sent     BOOLEAN DEFAULT FALSE,      -- le client a cliqué le bouton WhatsApp
    status            VARCHAR(25) NOT NULL DEFAULT 'awaiting_confirmation'
                      CHECK (status IN ('awaiting_confirmation','confirmed','rejected','refunded')),
    confirmed_by      INTEGER REFERENCES users(id),  -- admin qui confirme
    confirmed_at      TIMESTAMPTZ,
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    -- Exactement une cible de paiement renseignée
    CHECK (
        (order_id IS NOT NULL)::int +
        (service_order_id IS NOT NULL)::int +
        (property_visit_id IS NOT NULL)::int = 1
    )
);


-- =====================================================================
--  15. REVERSEMENTS VENDEURS (suivi des revenus après commission)
-- =====================================================================
CREATE TABLE payouts (
    id          SERIAL PRIMARY KEY,
    shop_id     INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    amount      NUMERIC(12,2) NOT NULL,   -- montant net à reverser au vendeur
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','paid','cancelled')),
    method      VARCHAR(50),
    reference   VARCHAR(60),
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  16. MESSAGERIE (temps réel via Socket.io côté backend)
-- =====================================================================
CREATE TABLE conversations (
    id              SERIAL PRIMARY KEY,
    buyer_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject         VARCHAR(200),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (buyer_id, seller_id)
);

CREATE TABLE messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       INTEGER NOT NULL REFERENCES users(id),
    content         TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_attachments (
    id         SERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_url   TEXT NOT NULL,
    file_type  VARCHAR(50),
    file_name  VARCHAR(255)
);


-- =====================================================================
--  17. NOTIFICATIONS
-- =====================================================================
CREATE TABLE notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(50),
    title      VARCHAR(200),
    body       TEXT,
    link       TEXT,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  18. SIGNALEMENTS
-- =====================================================================
CREATE TABLE reports (
    id          SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type   VARCHAR(20) NOT NULL
                CHECK (item_type IN ('product','service','property','user','message')),
    item_id     INTEGER NOT NULL,
    reason      VARCHAR(150),
    description TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'open'
                CHECK (status IN ('open','reviewing','resolved','dismissed')),
    handled_by  INTEGER REFERENCES users(id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================================
--  19. INDEX (performance & recherche)
-- =====================================================================
CREATE INDEX idx_shops_user            ON shops(user_id);
CREATE INDEX idx_shops_status          ON shops(status);

CREATE INDEX idx_products_shop         ON products(shop_id);
CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_status       ON products(status);
CREATE INDEX idx_products_title_trgm   ON products USING gin (title gin_trgm_ops);

CREATE INDEX idx_services_shop         ON services(shop_id);
CREATE INDEX idx_services_status       ON services(status);
CREATE INDEX idx_services_title_trgm   ON services USING gin (title gin_trgm_ops);

CREATE INDEX idx_properties_city       ON properties(city);
CREATE INDEX idx_properties_trans      ON properties(transaction_type);
CREATE INDEX idx_properties_type       ON properties(property_type);
CREATE INDEX idx_properties_status     ON properties(status);
CREATE INDEX idx_properties_title_trgm ON properties USING gin (title gin_trgm_ops);

CREATE INDEX idx_orders_client         ON orders(client_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_service_orders_client ON service_orders(client_id);
CREATE INDEX idx_property_visits_client ON property_visits(client_id);

CREATE INDEX idx_favorites_user        ON favorites(user_id);
CREATE INDEX idx_reviews_item          ON reviews(item_type, item_id);

CREATE INDEX idx_payments_status       ON payments(status);
CREATE INDEX idx_payments_order        ON payments(order_id);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read);


-- =====================================================================
--  20. DONNÉES INITIALES (à adapter)
-- =====================================================================

-- Paramètres globaux : remplace les valeurs par les tiennes
INSERT INTO settings (key, value) VALUES
    ('whatsapp_number',  '+225XXXXXXXXXX'),   -- numéro WhatsApp pour l'envoi des reçus
    ('commission_rate',  '10'),               -- commission plateforme par défaut (%)
    ('platform_name',    'AfroMarket'),
    ('currency',         'XOF');

-- Compte administrateur initial (remplace le password_hash par un vrai hash bcrypt)
INSERT INTO users (full_name, email, password_hash, role, is_verified)
VALUES ('Admin', 'admin@afromarket.com', '$2b$10$REMPLACE_PAR_UN_HASH_BCRYPT', 'admin', TRUE);

-- Exemples de catégories
INSERT INTO categories (name, slug, type) VALUES
    ('Mode',              'mode',               'product'),
    ('Beauté & Cosmétiques','beaute-cosmetiques', 'product'),
    ('Alimentation',      'alimentation',       'product'),
    ('Développement web', 'developpement-web',  'service'),
    ('Design graphique',  'design-graphique',   'service'),
    ('Traduction',        'traduction',         'service');