-- Permanent per-mentor video room slug. The mentor pastes
-- https://<host>/meet/<room_slug> into Calendly's event-type Location field;
-- Bridge then routes that URL to the in-house WebRTC room.
alter table mentor_profiles
  add column if not exists room_slug text;

create unique index if not exists mentor_profiles_room_slug_uniq
  on mentor_profiles (room_slug) where room_slug is not null;
