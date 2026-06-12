-- ============================================================
-- Migration 009: Create analytical views
-- These views rely on RLS on the underlying tables,
-- so they are safe to expose to authenticated users.
-- ============================================================

-- Drop and recreate to support re-running migrations
DROP VIEW IF EXISTS merchant_stats_view;
DROP VIEW IF EXISTS admin_stats_view;

-- ============================================================
-- merchant_stats_view
-- Aggregates per-merchant statistics. RLS on all underlying
-- tables ensures merchants only see their own data.
-- ============================================================

CREATE VIEW merchant_stats_view AS
SELECT
  m.id                                                                         AS merchant_id,
  m.name,
  COUNT(DISTINCT c.id)                                                         AS total_customers,
  COALESCE(SUM(pt.points_added), 0)                                            AS total_points_distributed,
  COUNT(DISTINCT pt.id) FILTER (WHERE pt.type = 'earn')                        AS total_visits,
  COUNT(DISTINCT o.id)  FILTER (WHERE o.status = 'active')                     AS active_offers,
  COUNT(DISTINCT n.id)  FILTER (WHERE n.status = 'sent')                       AS notifications_sent
FROM merchants m
LEFT JOIN customers          c  ON c.merchant_id  = m.id
LEFT JOIN points_transactions pt ON pt.merchant_id = m.id
LEFT JOIN offers             o  ON o.merchant_id  = m.id
LEFT JOIN notifications      n  ON n.merchant_id  = m.id
GROUP BY m.id, m.name;

-- ============================================================
-- admin_stats_view
-- Platform-wide statistics, intended for admin users only.
-- Enforce access via RLS on the admin_stats_view itself is
-- not possible for views in all Postgres versions, so wrap
-- access in a security-definer function if needed, or rely
-- on the application layer to restrict to admins.
-- ============================================================

CREATE VIEW admin_stats_view AS
SELECT
  COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'active')                           AS active_merchants,
  COUNT(DISTINCT m.id)                                                               AS total_merchants,
  COUNT(DISTINCT c.id)                                                               AS total_customers,
  COUNT(DISTINCT wc.id)                                                              AS total_wallet_cards,
  COALESCE(SUM(pt.points_added), 0)                                                  AS total_points_distributed,
  COALESCE(SUM(s.monthly_price) FILTER (WHERE s.status = 'active'), 0)               AS monthly_revenue
FROM merchants m
LEFT JOIN customers          c  ON c.merchant_id  = m.id
LEFT JOIN wallet_cards       wc ON wc.merchant_id = m.id
LEFT JOIN points_transactions pt ON pt.merchant_id = m.id
LEFT JOIN subscriptions      s  ON s.merchant_id  = m.id;
