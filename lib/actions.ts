"use server";

import type { RowDataPacket } from "mysql2/promise";
import { revalidatePath } from "next/cache";
import { query, pool } from "@/lib/db";

const CURRENT_USER_ID = 1;

function str(v: FormDataEntryValue | null): string {
  return (v ?? "").toString().trim();
}

function num(v: FormDataEntryValue | null): number {
  const n = Number(str(v));
  if (Number.isNaN(n)) throw new Error("Invalid number");
  return n;
}

function optNum(v: FormDataEntryValue | null): number | null {
  const s = str(v);
  if (s === "") return null;
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error("Invalid number");
  return n;
}

function optStr(v: FormDataEntryValue | null): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

// ============================================================
// TYPES
// ============================================================

export type PlayerStatus =
  | "Active"
  | "Injured"
  | "Suspended"
  | "OnLoan"
  | "Released";

export type PlayerPosition =
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Forward";

export type StaffRole =
  | "HeadCoach"
  | "AssistantCoach"
  | "Physiotherapist"
  | "Doctor"
  | "FinanceOfficer"
  | "Administrator";

export type StaffDepartment =
  | "Coaching"
  | "Medical"
  | "Finance"
  | "Administration";

export type ContractStatus = "Active" | "Expired" | "Terminated" | "Renewed";

export type TransferType = "Permanent" | "Loan" | "FreeTransfer" | "Exchange";
export type TransferWindow = "SummerWindow" | "WinterWindow" | "FreeAgent";
export type TransferStatus =
  | "Negotiating"
  | "Agreed"
  | "Medicals"
  | "Registered"
  | "Complete"
  | "Failed";

export type MatchCompetition =
  | "League"
  | "Cup"
  | "FriendlyMatch"
  | "EuropeanCompetition";
export type MatchVenueSide = "Home" | "Away" | "Neutral";
export type MatchStatus = "Scheduled" | "Completed" | "Postponed" | "Cancelled";

export type DashboardStats = {
  totalPlayers: number;
  totalStaff: number;
  activeContracts: number;
  totalWeeklyWage: number;
};

export type PlayerRow = {
  PlayerID: number;
  FullName: string;
  Position: PlayerPosition;
  SquadNumber: number | null;
  Status: PlayerStatus;
  Nationality: string;
  DateOfBirth: string;
  DateJoined: string;
  WeeklyWage: number | null;
  ContractEnd: string | null;
  DaysUntilExpiry: number | null;
};

export type StaffRow = {
  StaffID: number;
  UserID: number;
  FullName: string;
  Role: StaffRole;
  Department: StaffDepartment;
  Phone: string;
  Email: string;
  DateJoined: string;
  IsActive: number;
};

export type ContractRow = {
  ContractID: number;
  PlayerID: number | null;
  StaffID: number | null;
  PartyName: string;
  PartyType: "Player" | "Staff";
  StartDate: string;
  EndDate: string;
  WeeklyWage: number;
  SigningBonus: number | null;
  ReleaseClause: number | null;
  ContractStatus: ContractStatus;
};

export type PayrollRow = {
  PayrollID: number;
  ContractID: number;
  PartyName: string;
  PayPeriod: string;
  GrossAmount: number;
  Deductions: number;
  NetAmount: number;
  ProcessedDate: string;
  PayslipRef: string;
};

export type TransferRow = {
  TransferID: number;
  PlayerID: number;
  PlayerName: string;
  FromClub: string;
  ToClub: string;
  TransferType: TransferType;
  TransferFee: number | null;
  SellOnClause: number | null;
  WindowPeriod: TransferWindow;
  TransferDate: string;
  Status: TransferStatus;
};

export type MatchRow = {
  MatchID: number;
  MatchDate: string;
  Opponent: string;
  Venue: string;
  HomeOrAway: MatchVenueSide;
  Competition: MatchCompetition;
  HomeScore: number | null;
  AwayScore: number | null;
  MatchStatus: MatchStatus;
};

export type MedicalRow = {
  RecordID: number;
  PlayerID: number;
  PlayerName: string;
  TreatingStaffID: number;
  StaffName: string;
  InjuryType: string;
  DateOfInjury: string;
  ExpectedReturnDate: string | null;
  ActualReturnDate: string | null;
  TreatmentNotes: string | null;
  ClearedToPlay: number;
};

// ============================================================
// READS
// ============================================================

interface CountRow extends RowDataPacket {
  total: number;
}
interface SumRow extends RowDataPacket {
  total: string | number | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [players, staff, contracts, wages] = await Promise.all([
    query<CountRow>("SELECT COUNT(*) AS total FROM PLAYERS"),
    query<CountRow>("SELECT COUNT(*) AS total FROM STAFF WHERE IsActive = 1"),
    query<CountRow>(
      "SELECT COUNT(*) AS total FROM CONTRACTS WHERE ContractStatus = 'Active'",
    ),
    query<SumRow>(
      "SELECT COALESCE(SUM(WeeklyWage), 0) AS total FROM CONTRACTS WHERE ContractStatus = 'Active'",
    ),
  ]);
  return {
    totalPlayers: Number(players[0]?.total ?? 0),
    totalStaff: Number(staff[0]?.total ?? 0),
    activeContracts: Number(contracts[0]?.total ?? 0),
    totalWeeklyWage: Number(wages[0]?.total ?? 0),
  };
}

interface PlayerRowPacket extends RowDataPacket, PlayerRow {}
export async function getPlayers(): Promise<PlayerRow[]> {
  return query<PlayerRowPacket>(`
    SELECT
      p.PlayerID, p.FullName, p.Position, p.SquadNumber, p.Status,
      p.Nationality, p.DateOfBirth, p.DateJoined,
      v.WeeklyWage, v.ContractEnd, v.DaysUntilExpiry
    FROM PLAYERS p
    LEFT JOIN v_active_players_contracts v ON v.PlayerID = p.PlayerID
    ORDER BY
      CASE p.Status
        WHEN 'Active' THEN 1 WHEN 'Injured' THEN 2 WHEN 'Suspended' THEN 3
        WHEN 'OnLoan' THEN 4 WHEN 'Released' THEN 5
      END,
      p.SquadNumber IS NULL, p.SquadNumber ASC
  `);
}

export async function getPlayer(id: number): Promise<PlayerRow | null> {
  const rows = await query<PlayerRowPacket>(
    `SELECT p.PlayerID, p.FullName, p.Position, p.SquadNumber, p.Status,
            p.Nationality, p.DateOfBirth, p.DateJoined,
            v.WeeklyWage, v.ContractEnd, v.DaysUntilExpiry
     FROM PLAYERS p
     LEFT JOIN v_active_players_contracts v ON v.PlayerID = p.PlayerID
     WHERE p.PlayerID = ${Number(id)}`,
  );
  return rows[0] ?? null;
}

interface StaffRowPacket extends RowDataPacket, StaffRow {}
export async function getStaff(): Promise<StaffRow[]> {
  return query<StaffRowPacket>(
    "SELECT * FROM STAFF ORDER BY IsActive DESC, Department, FullName",
  );
}

interface ContractRowPacket extends RowDataPacket, ContractRow {}
export async function getContracts(): Promise<ContractRow[]> {
  return query<ContractRowPacket>(`
    SELECT
      c.ContractID, c.PlayerID, c.StaffID,
      COALESCE(p.FullName, s.FullName) AS PartyName,
      CASE WHEN c.PlayerID IS NOT NULL THEN 'Player' ELSE 'Staff' END AS PartyType,
      c.StartDate, c.EndDate, c.WeeklyWage, c.SigningBonus, c.ReleaseClause,
      c.ContractStatus
    FROM CONTRACTS c
    LEFT JOIN PLAYERS p ON p.PlayerID = c.PlayerID
    LEFT JOIN STAFF   s ON s.StaffID  = c.StaffID
    ORDER BY
      CASE c.ContractStatus
        WHEN 'Active' THEN 1 WHEN 'Renewed' THEN 2
        WHEN 'Expired' THEN 3 WHEN 'Terminated' THEN 4
      END,
      c.EndDate DESC
  `);
}

interface PayrollRowPacket extends RowDataPacket, PayrollRow {}
export async function getPayroll(): Promise<PayrollRow[]> {
  return query<PayrollRowPacket>(`
    SELECT
      pr.PayrollID, pr.ContractID, pr.PayPeriod,
      pr.GrossAmount, pr.Deductions, pr.NetAmount,
      pr.ProcessedDate, pr.PayslipRef,
      COALESCE(p.FullName, s.FullName) AS PartyName
    FROM PAYROLL pr
    JOIN CONTRACTS c ON c.ContractID = pr.ContractID
    LEFT JOIN PLAYERS p ON p.PlayerID = c.PlayerID
    LEFT JOIN STAFF   s ON s.StaffID  = c.StaffID
    ORDER BY pr.ProcessedDate DESC
  `);
}

interface TransferRowPacket extends RowDataPacket, TransferRow {}
export async function getTransfers(): Promise<TransferRow[]> {
  return query<TransferRowPacket>(`
    SELECT
      t.TransferID, t.PlayerID, p.FullName AS PlayerName,
      t.FromClub, t.ToClub, t.TransferType, t.TransferFee, t.SellOnClause,
      t.WindowPeriod, t.TransferDate, t.Status
    FROM TRANSFERS t
    JOIN PLAYERS p ON p.PlayerID = t.PlayerID
    ORDER BY t.TransferDate DESC
  `);
}

interface MatchRowPacket extends RowDataPacket, MatchRow {}
export async function getMatches(): Promise<MatchRow[]> {
  return query<MatchRowPacket>(
    "SELECT * FROM MATCHES ORDER BY MatchDate DESC",
  );
}

interface MedicalRowPacket extends RowDataPacket, MedicalRow {}
export async function getMedicalRecords(): Promise<MedicalRow[]> {
  return query<MedicalRowPacket>(`
    SELECT
      m.RecordID, m.PlayerID, p.FullName AS PlayerName,
      m.TreatingStaffID, s.FullName AS StaffName,
      m.InjuryType, m.DateOfInjury, m.ExpectedReturnDate,
      m.ActualReturnDate, m.TreatmentNotes, m.ClearedToPlay
    FROM MEDICAL_RECORDS m
    JOIN PLAYERS p ON p.PlayerID = m.PlayerID
    JOIN STAFF   s ON s.StaffID  = m.TreatingStaffID
    ORDER BY m.DateOfInjury DESC
  `);
}

// Lightweight option lists for form selects

export type PlayerOption = { PlayerID: number; FullName: string };
export type StaffOption = { StaffID: number; FullName: string };
export type ContractOption = {
  ContractID: number;
  PartyName: string;
  WeeklyWage: number;
};
export type UserOption = { UserID: number; Username: string };

interface PlayerOptPacket extends RowDataPacket, PlayerOption {}
export async function listPlayerOptions(): Promise<PlayerOption[]> {
  return query<PlayerOptPacket>(
    "SELECT PlayerID, FullName FROM PLAYERS ORDER BY FullName",
  );
}

interface StaffOptPacket extends RowDataPacket, StaffOption {}
export async function listStaffOptions(): Promise<StaffOption[]> {
  return query<StaffOptPacket>(
    "SELECT StaffID, FullName FROM STAFF WHERE IsActive = 1 ORDER BY FullName",
  );
}

interface ContractOptPacket extends RowDataPacket, ContractOption {}
export async function listActiveContractOptions(): Promise<ContractOption[]> {
  return query<ContractOptPacket>(`
    SELECT c.ContractID, COALESCE(p.FullName, s.FullName) AS PartyName, c.WeeklyWage
    FROM CONTRACTS c
    LEFT JOIN PLAYERS p ON p.PlayerID = c.PlayerID
    LEFT JOIN STAFF   s ON s.StaffID  = c.StaffID
    WHERE c.ContractStatus = 'Active'
    ORDER BY PartyName
  `);
}

interface UserOptPacket extends RowDataPacket, UserOption {}
export async function listUserOptions(): Promise<UserOption[]> {
  return query<UserOptPacket>(
    "SELECT UserID, Username FROM USER_ACCOUNTS WHERE IsActive = 1 ORDER BY Username",
  );
}

// ============================================================
// PLAYERS — MUTATIONS
// ============================================================

export async function createPlayer(formData: FormData) {
  await pool.execute(
    `INSERT INTO PLAYERS
      (FullName, DateOfBirth, Nationality, Position, SquadNumber, Status, DateJoined, CreatedByUserID)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      str(formData.get("FullName")),
      str(formData.get("DateOfBirth")),
      str(formData.get("Nationality")),
      str(formData.get("Position")),
      optNum(formData.get("SquadNumber")),
      str(formData.get("Status")) || "Active",
      str(formData.get("DateJoined")),
      CURRENT_USER_ID,
    ],
  );
  revalidatePath("/players");
  revalidatePath("/");
}

export async function updatePlayer(formData: FormData) {
  const id = num(formData.get("PlayerID"));
  await pool.execute(
    `UPDATE PLAYERS
       SET FullName=?, DateOfBirth=?, Nationality=?, Position=?,
           SquadNumber=?, Status=?, DateJoined=?
     WHERE PlayerID=?`,
    [
      str(formData.get("FullName")),
      str(formData.get("DateOfBirth")),
      str(formData.get("Nationality")),
      str(formData.get("Position")),
      optNum(formData.get("SquadNumber")),
      str(formData.get("Status")),
      str(formData.get("DateJoined")),
      id,
    ],
  );
  revalidatePath("/players");
  revalidatePath("/");
}

export async function deletePlayer(formData: FormData) {
  const id = num(formData.get("PlayerID"));
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Payroll rows hang off contracts — kill them first
    await conn.execute(
      `DELETE pr FROM PAYROLL pr
       JOIN CONTRACTS c ON c.ContractID = pr.ContractID
       WHERE c.PlayerID = ?`,
      [id],
    );
    await conn.execute("DELETE FROM CONTRACTS WHERE PlayerID = ?", [id]);
    await conn.execute("DELETE FROM TRANSFERS WHERE PlayerID = ?", [id]);
    await conn.execute("DELETE FROM MEDICAL_RECORDS WHERE PlayerID = ?", [id]);
    await conn.execute("DELETE FROM PLAYERS WHERE PlayerID = ?", [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  revalidatePath("/players");
  revalidatePath("/");
  revalidatePath("/contracts");
  revalidatePath("/payroll");
  revalidatePath("/transfers");
  revalidatePath("/medical");
}

// ============================================================
// STAFF — MUTATIONS
// ============================================================

export async function createStaff(formData: FormData) {
  await pool.execute(
    `INSERT INTO STAFF
      (UserID, FullName, Role, Department, Phone, Email, DateJoined, IsActive)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      num(formData.get("UserID")),
      str(formData.get("FullName")),
      str(formData.get("Role")),
      str(formData.get("Department")),
      str(formData.get("Phone")),
      str(formData.get("Email")),
      str(formData.get("DateJoined")),
      formData.get("IsActive") === "on" ? 1 : 0,
    ],
  );
  revalidatePath("/staff");
  revalidatePath("/");
}

export async function updateStaff(formData: FormData) {
  const id = num(formData.get("StaffID"));
  await pool.execute(
    `UPDATE STAFF
       SET FullName=?, Role=?, Department=?, Phone=?, Email=?, DateJoined=?, IsActive=?
     WHERE StaffID=?`,
    [
      str(formData.get("FullName")),
      str(formData.get("Role")),
      str(formData.get("Department")),
      str(formData.get("Phone")),
      str(formData.get("Email")),
      str(formData.get("DateJoined")),
      formData.get("IsActive") === "on" ? 1 : 0,
      id,
    ],
  );
  revalidatePath("/staff");
  revalidatePath("/");
}

export async function deleteStaff(formData: FormData) {
  const id = num(formData.get("StaffID"));
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `DELETE pr FROM PAYROLL pr
       JOIN CONTRACTS c ON c.ContractID = pr.ContractID
       WHERE c.StaffID = ?`,
      [id],
    );
    await conn.execute("DELETE FROM CONTRACTS WHERE StaffID = ?", [id]);
    await conn.execute(
      "DELETE FROM MEDICAL_RECORDS WHERE TreatingStaffID = ?",
      [id],
    );
    await conn.execute("DELETE FROM STAFF WHERE StaffID = ?", [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  revalidatePath("/staff");
  revalidatePath("/");
  revalidatePath("/contracts");
  revalidatePath("/payroll");
  revalidatePath("/medical");
}

// ============================================================
// CONTRACTS — MUTATIONS
// ============================================================

export async function createContract(formData: FormData) {
  const partyType = str(formData.get("PartyType"));
  const partyId = num(formData.get("PartyID"));
  await pool.execute(
    `INSERT INTO CONTRACTS
      (PlayerID, StaffID, StartDate, EndDate, WeeklyWage, SigningBonus, ReleaseClause, ContractStatus, CreatedByUserID)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      partyType === "Player" ? partyId : null,
      partyType === "Staff" ? partyId : null,
      str(formData.get("StartDate")),
      str(formData.get("EndDate")),
      num(formData.get("WeeklyWage")),
      optNum(formData.get("SigningBonus")),
      optNum(formData.get("ReleaseClause")),
      str(formData.get("ContractStatus")) || "Active",
      CURRENT_USER_ID,
    ],
  );
  revalidatePath("/contracts");
  revalidatePath("/");
  revalidatePath("/players");
}

export async function setContractStatus(formData: FormData) {
  const id = num(formData.get("ContractID"));
  const status = str(formData.get("ContractStatus")) as ContractStatus;
  await pool.execute(
    "UPDATE CONTRACTS SET ContractStatus=? WHERE ContractID=?",
    [status, id],
  );
  revalidatePath("/contracts");
  revalidatePath("/");
  revalidatePath("/players");
}

export async function deleteContract(formData: FormData) {
  const id = num(formData.get("ContractID"));
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute("DELETE FROM PAYROLL WHERE ContractID = ?", [id]);
    await conn.execute("DELETE FROM CONTRACTS WHERE ContractID = ?", [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
  revalidatePath("/contracts");
  revalidatePath("/");
  revalidatePath("/payroll");
}

// ============================================================
// PAYROLL — MUTATIONS
// ============================================================

export async function createPayroll(formData: FormData) {
  const gross = num(formData.get("GrossAmount"));
  const deductions = num(formData.get("Deductions"));
  await pool.execute(
    `INSERT INTO PAYROLL
      (ContractID, PayPeriod, GrossAmount, Deductions, NetAmount, ProcessedByUserID, PayslipRef)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      num(formData.get("ContractID")),
      str(formData.get("PayPeriod")),
      gross,
      deductions,
      gross - deductions,
      CURRENT_USER_ID,
      str(formData.get("PayslipRef")),
    ],
  );
  revalidatePath("/payroll");
}

export async function deletePayroll(formData: FormData) {
  const id = num(formData.get("PayrollID"));
  await pool.execute("DELETE FROM PAYROLL WHERE PayrollID=?", [id]);
  revalidatePath("/payroll");
}

// ============================================================
// TRANSFERS — MUTATIONS
// ============================================================

export async function createTransfer(formData: FormData) {
  await pool.execute(
    `INSERT INTO TRANSFERS
      (PlayerID, FromClub, ToClub, TransferType, TransferFee, SellOnClause, WindowPeriod, TransferDate, Status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      num(formData.get("PlayerID")),
      str(formData.get("FromClub")),
      str(formData.get("ToClub")),
      str(formData.get("TransferType")),
      optNum(formData.get("TransferFee")),
      optNum(formData.get("SellOnClause")),
      str(formData.get("WindowPeriod")),
      str(formData.get("TransferDate")),
      str(formData.get("Status")) || "Negotiating",
    ],
  );
  revalidatePath("/transfers");
}

export async function updateTransferStatus(formData: FormData) {
  const id = num(formData.get("TransferID"));
  await pool.execute("UPDATE TRANSFERS SET Status=? WHERE TransferID=?", [
    str(formData.get("Status")),
    id,
  ]);
  revalidatePath("/transfers");
}

export async function deleteTransfer(formData: FormData) {
  const id = num(formData.get("TransferID"));
  await pool.execute("DELETE FROM TRANSFERS WHERE TransferID=?", [id]);
  revalidatePath("/transfers");
}

// ============================================================
// MATCHES — MUTATIONS
// ============================================================

export async function createMatch(formData: FormData) {
  await pool.execute(
    `INSERT INTO MATCHES
      (MatchDate, Opponent, Venue, HomeOrAway, Competition, HomeScore, AwayScore, MatchStatus, RecordedByUserID)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      str(formData.get("MatchDate")).replace("T", " ") + ":00",
      str(formData.get("Opponent")),
      str(formData.get("Venue")),
      str(formData.get("HomeOrAway")),
      str(formData.get("Competition")),
      optNum(formData.get("HomeScore")),
      optNum(formData.get("AwayScore")),
      str(formData.get("MatchStatus")) || "Scheduled",
      CURRENT_USER_ID,
    ],
  );
  revalidatePath("/matches");
}

export async function recordMatchResult(formData: FormData) {
  const id = num(formData.get("MatchID"));
  await pool.execute(
    "UPDATE MATCHES SET HomeScore=?, AwayScore=?, MatchStatus='Completed' WHERE MatchID=?",
    [num(formData.get("HomeScore")), num(formData.get("AwayScore")), id],
  );
  revalidatePath("/matches");
}

export async function deleteMatch(formData: FormData) {
  const id = num(formData.get("MatchID"));
  await pool.execute("DELETE FROM MATCHES WHERE MatchID=?", [id]);
  revalidatePath("/matches");
}

// ============================================================
// MEDICAL — MUTATIONS
// ============================================================

export async function createMedicalRecord(formData: FormData) {
  await pool.execute(
    `INSERT INTO MEDICAL_RECORDS
      (PlayerID, TreatingStaffID, InjuryType, DateOfInjury, ExpectedReturnDate, ActualReturnDate, TreatmentNotes, ClearedToPlay)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      num(formData.get("PlayerID")),
      num(formData.get("TreatingStaffID")),
      str(formData.get("InjuryType")),
      str(formData.get("DateOfInjury")),
      optStr(formData.get("ExpectedReturnDate")),
      optStr(formData.get("ActualReturnDate")),
      optStr(formData.get("TreatmentNotes")),
      formData.get("ClearedToPlay") === "on" ? 1 : 0,
    ],
  );
  revalidatePath("/medical");
}

export async function clearForPlay(formData: FormData) {
  const id = num(formData.get("RecordID"));
  const today = new Date().toISOString().slice(0, 10);
  await pool.execute(
    "UPDATE MEDICAL_RECORDS SET ClearedToPlay=1, ActualReturnDate=COALESCE(ActualReturnDate, ?) WHERE RecordID=?",
    [today, id],
  );
  revalidatePath("/medical");
}

export async function deleteMedicalRecord(formData: FormData) {
  const id = num(formData.get("RecordID"));
  await pool.execute("DELETE FROM MEDICAL_RECORDS WHERE RecordID=?", [id]);
  revalidatePath("/medical");
}
