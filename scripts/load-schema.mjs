import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/load-schema.mjs <mysql-url>");
  process.exit(1);
}
const u = new URL(url);

let schema = readFileSync("database-schema.sql", "utf-8");

// Drop the per-database bootstrap — Railway gives us the `railway` DB already
schema = schema
  .replace(/DROP DATABASE IF EXISTS fcoms_db;\s*/i, "")
  .replace(/CREATE DATABASE fcoms_db;\s*/i, "")
  .replace(/USE fcoms_db;\s*/i, "");

// Extract the trigger so we can run it as one statement (no DELIMITER support over the wire)
const triggerMatch = schema.match(/DELIMITER \/\/([\s\S]*?)DELIMITER ;/);
let triggerSql = null;
if (triggerMatch) {
  triggerSql = triggerMatch[1].replace(/\/\/\s*$/m, "").trim();
  schema = schema.replace(triggerMatch[0], "");
}

const conn = await mysql.createConnection({
  host: u.hostname,
  port: Number(u.port),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.slice(1),
  multipleStatements: true,
});

console.log("✓ Connected to", u.hostname);

// Drop existing objects so re-runs are safe
await conn.query(`
  DROP TABLE IF EXISTS PAYROLL;
  DROP TABLE IF EXISTS MEDICAL_RECORDS;
  DROP TABLE IF EXISTS MATCHES;
  DROP TABLE IF EXISTS TRANSFERS;
  DROP TABLE IF EXISTS CONTRACTS;
  DROP TABLE IF EXISTS STAFF;
  DROP TABLE IF EXISTS PLAYERS;
  DROP TABLE IF EXISTS USER_ACCOUNTS;
  DROP VIEW IF EXISTS v_active_players_contracts;
  DROP VIEW IF EXISTS v_wage_bill_summary;
  DROP VIEW IF EXISTS v_contract_expiry_alerts;
`);
console.log("✓ Cleared previous schema");

await conn.query(schema);
console.log("✓ Tables, indexes, views, inserts loaded");

if (triggerSql) {
  await conn.query(triggerSql);
  console.log("✓ Trigger created");
}

const [rows] = await conn.query(
  "SELECT 'users' AS t, COUNT(*) AS n FROM USER_ACCOUNTS " +
    "UNION ALL SELECT 'players', COUNT(*) FROM PLAYERS " +
    "UNION ALL SELECT 'staff', COUNT(*) FROM STAFF " +
    "UNION ALL SELECT 'contracts', COUNT(*) FROM CONTRACTS " +
    "UNION ALL SELECT 'transfers', COUNT(*) FROM TRANSFERS " +
    "UNION ALL SELECT 'matches', COUNT(*) FROM MATCHES " +
    "UNION ALL SELECT 'medical', COUNT(*) FROM MEDICAL_RECORDS " +
    "UNION ALL SELECT 'payroll', COUNT(*) FROM PAYROLL",
);
console.log("\nRow counts:");
console.table(rows);

await conn.end();
