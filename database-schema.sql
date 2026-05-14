-- =============================================
-- COMPLETE DATABASE SCRIPT - COPY EVERYTHING
-- Run this ONCE and you're done!
-- =============================================

-- Step 1: Create and Use Database
DROP DATABASE IF EXISTS fcoms_db;
CREATE DATABASE fcoms_db;
USE fcoms_db;

-- Step 2: Create Tables
CREATE TABLE USER_ACCOUNTS (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'FinanceManager', 'HeadCoach', 'MedicalStaff') NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    LastLogin DATETIME NULL,
    CreatedAt DATETIME DEFAULT NOW()
);

CREATE TABLE PLAYERS (
    PlayerID INT PRIMARY KEY AUTO_INCREMENT,
    FullName VARCHAR(100) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Nationality VARCHAR(60) NOT NULL,
    Position ENUM('Goalkeeper', 'Defender', 'Midfielder', 'Forward') NOT NULL,
    SquadNumber INT NULL UNIQUE,
    Status ENUM('Active', 'Injured', 'Suspended', 'OnLoan', 'Released') NOT NULL DEFAULT 'Active',
    DateJoined DATE NOT NULL,
    CreatedByUserID INT NOT NULL,
    FOREIGN KEY (CreatedByUserID) REFERENCES USER_ACCOUNTS(UserID) ON DELETE RESTRICT
);

CREATE TABLE STAFF (
    StaffID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Role ENUM('HeadCoach', 'AssistantCoach', 'Physiotherapist', 'Doctor', 'FinanceOfficer', 'Administrator') NOT NULL,
    Department ENUM('Coaching', 'Medical', 'Finance', 'Administration') NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    DateJoined DATE NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (UserID) REFERENCES USER_ACCOUNTS(UserID) ON DELETE RESTRICT
);

CREATE TABLE CONTRACTS (
    ContractID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NULL,
    StaffID INT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    WeeklyWage DECIMAL(10,2) NOT NULL CHECK (WeeklyWage > 0),
    SigningBonus DECIMAL(10,2) NULL CHECK (SigningBonus >= 0),
    ReleaseClause DECIMAL(12,2) NULL CHECK (ReleaseClause >= 0),
    ContractStatus ENUM('Active', 'Expired', 'Terminated', 'Renewed') NOT NULL DEFAULT 'Active',
    CreatedByUserID INT NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID) ON DELETE RESTRICT,
    FOREIGN KEY (StaffID) REFERENCES STAFF(StaffID) ON DELETE RESTRICT,
    FOREIGN KEY (CreatedByUserID) REFERENCES USER_ACCOUNTS(UserID) ON DELETE RESTRICT,
    CHECK ((PlayerID IS NOT NULL AND StaffID IS NULL) OR (PlayerID IS NULL AND StaffID IS NOT NULL)),
    CHECK (EndDate > StartDate)
);

CREATE TABLE TRANSFERS (
    TransferID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NOT NULL,
    FromClub VARCHAR(100) NOT NULL,
    ToClub VARCHAR(100) NOT NULL,
    TransferType ENUM('Permanent', 'Loan', 'FreeTransfer', 'Exchange') NOT NULL,
    TransferFee DECIMAL(12,2) NULL CHECK (TransferFee >= 0),
    SellOnClause DECIMAL(5,2) NULL CHECK (SellOnClause BETWEEN 0 AND 100),
    WindowPeriod ENUM('SummerWindow', 'WinterWindow', 'FreeAgent') NOT NULL,
    TransferDate DATE NOT NULL,
    Status ENUM('Negotiating', 'Agreed', 'Medicals', 'Registered', 'Complete', 'Failed') NOT NULL DEFAULT 'Negotiating',
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID) ON DELETE RESTRICT
);

CREATE TABLE MATCHES (
    MatchID INT PRIMARY KEY AUTO_INCREMENT,
    MatchDate DATETIME NOT NULL,
    Opponent VARCHAR(100) NOT NULL,
    Venue VARCHAR(100) NOT NULL,
    HomeOrAway ENUM('Home', 'Away', 'Neutral') NOT NULL,
    Competition ENUM('League', 'Cup', 'FriendlyMatch', 'EuropeanCompetition') NOT NULL,
    HomeScore INT NULL CHECK (HomeScore >= 0),
    AwayScore INT NULL CHECK (AwayScore >= 0),
    MatchStatus ENUM('Scheduled', 'Completed', 'Postponed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    RecordedByUserID INT NOT NULL,
    FOREIGN KEY (RecordedByUserID) REFERENCES USER_ACCOUNTS(UserID) ON DELETE RESTRICT
);

CREATE TABLE MEDICAL_RECORDS (
    RecordID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerID INT NOT NULL,
    TreatingStaffID INT NOT NULL,
    InjuryType VARCHAR(100) NOT NULL,
    DateOfInjury DATE NOT NULL,
    ExpectedReturnDate DATE NULL,
    ActualReturnDate DATE NULL,
    TreatmentNotes TEXT NULL,
    ClearedToPlay BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (PlayerID) REFERENCES PLAYERS(PlayerID) ON DELETE RESTRICT,
    FOREIGN KEY (TreatingStaffID) REFERENCES STAFF(StaffID) ON DELETE RESTRICT,
    CHECK (ExpectedReturnDate >= DateOfInjury OR ExpectedReturnDate IS NULL)
);

CREATE TABLE PAYROLL (
    PayrollID INT PRIMARY KEY AUTO_INCREMENT,
    ContractID INT NOT NULL,
    PayPeriod VARCHAR(20) NOT NULL,
    GrossAmount DECIMAL(10,2) NOT NULL CHECK (GrossAmount > 0),
    Deductions DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (Deductions >= 0),
    NetAmount DECIMAL(10,2) NOT NULL CHECK (NetAmount > 0),
    ProcessedDate DATETIME NOT NULL DEFAULT NOW(),
    ProcessedByUserID INT NOT NULL,
    PayslipRef VARCHAR(30) NOT NULL UNIQUE,
    FOREIGN KEY (ContractID) REFERENCES CONTRACTS(ContractID) ON DELETE RESTRICT,
    FOREIGN KEY (ProcessedByUserID) REFERENCES USER_ACCOUNTS(UserID) ON DELETE RESTRICT
);

-- View used by the dashboard
CREATE VIEW v_active_players_contracts AS
SELECT
    p.PlayerID, p.FullName, p.Position, p.SquadNumber,
    c.StartDate AS ContractStart, c.EndDate AS ContractEnd,
    c.WeeklyWage, DATEDIFF(c.EndDate, CURDATE()) AS DaysUntilExpiry
FROM PLAYERS p
JOIN CONTRACTS c ON p.PlayerID = c.PlayerID
WHERE c.ContractStatus = 'Active' AND p.Status IN ('Active', 'Injured');
