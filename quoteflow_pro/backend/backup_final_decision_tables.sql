-- SQL Backup Commands for Final Decision Tables
-- Created: 2024-01-15
-- Description: Backup commands for final_decisions and final_decision_items tables
-- =====================================================
-- BACKUP COMMANDS
-- =====================================================
-- 1. Create backup of final_decisions table
CREATE TABLE final_decisions_backup AS
SELECT *
FROM final_decisions;
-- 2. Create backup of final_decision_items table
CREATE TABLE final_decision_items_backup AS
SELECT *
FROM final_decision_items;
-- =====================================================
-- RESTORE COMMANDS (if needed)
-- =====================================================
-- 1. Restore final_decisions table from backup
-- INSERT INTO final_decisions 
-- SELECT * FROM final_decisions_backup;
-- 2. Restore final_decision_items table from backup
-- INSERT INTO final_decision_items 
-- SELECT * FROM final_decision_items_backup;
-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check if tables exist
SELECT name
FROM sqlite_master
WHERE type = 'table'
    AND name LIKE '%final_decision%';
-- Check table structure
.schema final_decisions.schema final_decision_items -- Check record counts
SELECT COUNT(*) as final_decisions_count
FROM final_decisions;
SELECT COUNT(*) as final_decision_items_count
FROM final_decision_items;
-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================
-- View all final decisions with RFQ details
SELECT fd.id,
    fd.rfq_id,
    r.rfq_number,
    r.title,
    fd.status,
    fd.total_approved_amount,
    fd.currency,
    u.full_name as approved_by,
    fd.approved_at
FROM final_decisions fd
    JOIN rfqs r ON fd.rfq_id = r.id
    JOIN users u ON fd.approved_by = u.id;
-- View final decision items with details
SELECT fdi.id,
    fdi.final_decision_id,
    fdi.rfq_item_id,
    ri.item_code,
    ri.description,
    fdi.final_unit_price,
    fdi.final_total_price,
    fdi.supplier_name,
    fdi.supplier_code
FROM final_decision_items fdi
    JOIN rfq_items ri ON fdi.rfq_item_id = ri.id;
-- =====================================================
-- CLEANUP COMMANDS (use with caution)
-- =====================================================
-- Drop backup tables (uncomment if needed)
-- DROP TABLE IF EXISTS final_decisions_backup;
-- DROP TABLE IF EXISTS final_decision_items_backup;
-- =====================================================
-- EXPORT COMMANDS (for data migration)
-- =====================================================
-- Export final_decisions to CSV
.headers on.mode csv.output final_decisions_export.csv
SELECT *
FROM final_decisions;
.output stdout -- Export final_decision_items to CSV
.headers on.mode csv.output final_decision_items_export.csv
SELECT *
FROM final_decision_items;
.output stdout