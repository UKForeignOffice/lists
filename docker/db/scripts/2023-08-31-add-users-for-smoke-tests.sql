
INSERT INTO "User" ("id", "createdAt", "updatedAt", "email", "jsonData") VALUES
    (DEFAULT, now(), now(), 'smoke@cautionyourblast.com', '{"roles": []}'),
    (DEFAULT, now(), now(), 'smoke+1@cautionyourblast.com', '{"roles": []}'),
    (DEFAULT, now(), now(), 'smoke+2@cautionyourblast.com', '{"roles": []}') ON CONFLICT DO NOTHING;
