
create schema support;

CREATE TABLE support.status (
    status_name TEXT PRIMARY KEY,
    description TEXT
);

INSERT INTO support.status
    (status_name, description)
VALUES
    ('OPEN', 'Abierto'),
    ('CLOSED', 'Cerrado'),
    ('PENDING', 'Pendiente');

CREATE TABLE support.priority (
    priority_name TEXT PRIMARY KEY,
    description TEXT
);

INSERT INTO support.priority
    (priority_name, description)
VALUES
    ('HIGH', 'Alta'),
    ('MEDIUM', 'Media'),
    ('LOW', 'Baja');

CREATE TABLE support.tag (
    tag_name TEXT PRIMARY KEY,
    description TEXT
);

INSERT INTO support.tag
    (tag_name, description)
VALUES
    ('Impresora', 'Problemas de impresoras'),
    ('SAP', 'Problemas de SAP'),
    ('RetailOne', 'Problemas de Retail One'),
    ('Hotel', 'Area Hotelera'),
    ('Contabilidad', 'Area Contable'),
    ('Restaurante', 'Area Restaurante'),
    ('Comercial', 'Area Comercial');

CREATE TABLE support.account_default_tag (
    account_id UUID REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    tag_name TEXT REFERENCES support.tag (tag_name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    PRIMARY KEY (account_id, tag_name)
);

CREATE TABLE support.ticket (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    body TEXT,
    status_name TEXT DEFAULT 'OPEN' NOT NULL REFERENCES support.status (status_name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    priority_name TEXT DEFAULT 'MEDIUM' NOT NULL REFERENCES support.priority (priority_name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    owner_account_id UUID NOT NULL REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER support_ticket_set_updated_at BEFORE UPDATE ON support.ticket
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE support.ticket_tag (
    ticket_id UUID REFERENCES support.ticket (ticket_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    tag_name TEXT REFERENCES support.tag (tag_name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    PRIMARY KEY (ticket_id, tag_name)
);

CREATE TABLE support.ticket_entry (
    ticket_entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support.ticket (ticket_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    body TEXT,
    owner_account_id UUID NOT NULL REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER support_ticket_entry_set_updated_at BEFORE UPDATE ON support.ticket_entry
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE support.ticket_status (
    ticket_status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support.ticket (ticket_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    status_name TEXT REFERENCES support.status (status_name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    owner_account_id UUID NOT NULL REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER support_ticket_status_set_updated_at BEFORE UPDATE ON support.ticket_status
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- update ticket status
CREATE OR REPLACE FUNCTION support.ticket_status_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE support.ticket
    SET status_name = NEW.status_name
    WHERE support.ticket.ticket_id = NEW.ticket_id;
    RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER support_ticket_status_update BEFORE INSERT ON support.ticket_status
    FOR EACH ROW EXECUTE FUNCTION support.ticket_status_update();

CREATE TABLE support.ticket_priority (
    ticket_priority_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support.ticket (ticket_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    priority_name TEXT NOT NULL REFERENCES support.priority (priority_name)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    owner_account_id UUID NOT NULL REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER support_ticket_priority_set_updated_at BEFORE UPDATE ON support.ticket_priority
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- update ticket priority
CREATE OR REPLACE FUNCTION support.ticket_priority_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE support.ticket
    SET priority_name = NEW.priority_name
    WHERE support.ticket.ticket_id = NEW.ticket_id;
    RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER support_ticket_priority_update BEFORE INSERT ON support.ticket_priority
    FOR EACH ROW EXECUTE FUNCTION support.ticket_priority_update();

CREATE TABLE support.ticket_assignation (
    ticket_assignation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support.ticket (ticket_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    assignee_id UUID NOT NULL REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    owner_account_id UUID NOT NULL REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER support_ticket_assignation_set_updated_at BEFORE UPDATE ON support.ticket_assignation
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE support.attachement (
    attachement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT null,
    size BIGINT NOT NULL,
    owner_account_id UUID NOT NULL REFERENCES auth.account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER support_attachement_set_updated_at BEFORE UPDATE ON support.attachement
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

