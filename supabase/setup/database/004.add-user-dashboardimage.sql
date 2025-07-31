-- Migration: Add dashboard_cover_img to user_profiles
ALTER TABLE user_profiles
ADD COLUMN dashboard_cover_img text NULL; 