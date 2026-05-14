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

-- Step 3: Create Trigger
DELIMITER //
CREATE TRIGGER prevent_multiple_active_contracts
BEFORE INSERT ON CONTRACTS
FOR EACH ROW
BEGIN
    DECLARE active_count INT;

    IF NEW.PlayerID IS NOT NULL AND NEW.ContractStatus = 'Active' THEN
        SELECT COUNT(*) INTO active_count
        FROM CONTRACTS
        WHERE PlayerID = NEW.PlayerID
        AND ContractStatus = 'Active';

        IF active_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'ERROR: Player already has an active contract!';
        END IF;
    END IF;
END//
DELIMITER ;

-- Step 4: Create Indexes
CREATE INDEX idx_players_position ON PLAYERS(Position);
CREATE INDEX idx_players_status ON PLAYERS(Status);
CREATE INDEX idx_contracts_dates ON CONTRACTS(StartDate, EndDate);
CREATE INDEX idx_contracts_status ON CONTRACTS(ContractStatus);
CREATE INDEX idx_transfers_date ON TRANSFERS(TransferDate);
CREATE INDEX idx_matches_date ON MATCHES(MatchDate);
CREATE INDEX idx_medical_player ON MEDICAL_RECORDS(PlayerID);
CREATE INDEX idx_payroll_period ON PAYROLL(PayPeriod);

-- Step 5: Create Views
CREATE VIEW v_active_players_contracts AS
SELECT
    p.PlayerID, p.FullName, p.Position, p.SquadNumber,
    c.StartDate AS ContractStart, c.EndDate AS ContractEnd,
    c.WeeklyWage, DATEDIFF(c.EndDate, CURDATE()) AS DaysUntilExpiry
FROM PLAYERS p
JOIN CONTRACTS c ON p.PlayerID = c.PlayerID
WHERE c.ContractStatus = 'Active' AND p.Status IN ('Active', 'Injured');

CREATE VIEW v_wage_bill_summary AS
SELECT
    p.Position, COUNT(c.ContractID) AS ContractCount,
    SUM(c.WeeklyWage) AS TotalWeeklyWage,
    SUM(c.WeeklyWage * 4.33) AS EstimatedMonthlyWage
FROM CONTRACTS c
LEFT JOIN PLAYERS p ON c.PlayerID = p.PlayerID
WHERE c.ContractStatus = 'Active'
GROUP BY p.Position;

CREATE VIEW v_contract_expiry_alerts AS
SELECT
    CASE WHEN c.PlayerID IS NOT NULL THEN p.FullName ELSE s.FullName END AS PersonName,
    CASE WHEN c.PlayerID IS NOT NULL THEN 'Player' ELSE 'Staff' END AS PersonType,
    c.EndDate, DATEDIFF(c.EndDate, CURDATE()) AS DaysRemaining
FROM CONTRACTS c
LEFT JOIN PLAYERS p ON c.PlayerID = p.PlayerID
LEFT JOIN STAFF s ON c.StaffID = s.StaffID
WHERE c.ContractStatus = 'Active'
AND DATEDIFF(c.EndDate, CURDATE()) <= 90
AND DATEDIFF(c.EndDate, CURDATE()) > 0;

-- Step 6: Insert Data
INSERT INTO USER_ACCOUNTS (Username, PasswordHash, Role, Email, IsActive) VALUES
('asad_khan', 'hashed_pwd_123', 'Admin', 'asad.khan@fcoms.com', TRUE),
('abdullah_malik', 'hashed_pwd_456', 'FinanceManager', 'abdullah.malik@fcoms.com', TRUE),
('saleem_ahmed', 'hashed_pwd_789', 'HeadCoach', 'saleem.ahmed@fcoms.com', TRUE),
('dr_hamza', 'hashed_pwd_101', 'MedicalStaff', 'dr.hamza@fcoms.com', TRUE);

INSERT INTO PLAYERS (FullName, DateOfBirth, Nationality, Position, SquadNumber, Status, DateJoined, CreatedByUserID) VALUES
('Muhammad Asad Gul', '1998-03-15', 'Pakistan', 'Forward', 10, 'Active', '2020-07-01', 1),
('Abdullah Saleem Malik', '2000-05-22', 'Pakistan', 'Midfielder', 8, 'Active', '2021-01-15', 1),
('Lionel Messi', '1987-06-24', 'Argentina', 'Forward', 30, 'Active', '2023-07-15', 1),
('Lamine Yamal', '2007-07-13', 'Spain', 'Forward', 27, 'Active', '2023-08-01', 1);

INSERT INTO STAFF (UserID, FullName, Role, Department, Phone, Email, DateJoined, IsActive) VALUES
(3, 'Saleem Ahmed', 'HeadCoach', 'Coaching', '+92-300-1234567', 'saleem.ahmed@fcoms.com', '2020-01-10', TRUE),
(4, 'Dr. Hamza Khan', 'Doctor', 'Medical', '+92-300-7654321', 'dr.hamza@fcoms.com', '2019-06-15', TRUE),
(2, 'Abdullah Malik', 'FinanceOfficer', 'Finance', '+92-300-9876543', 'abdullah.finance@fcoms.com', '2021-03-20', TRUE);

INSERT INTO CONTRACTS (PlayerID, StaffID, StartDate, EndDate, WeeklyWage, SigningBonus, ReleaseClause, ContractStatus, CreatedByUserID) VALUES
(1, NULL, '2023-07-01', '2027-06-30', 25000.00, 100000.00, 5000000.00, 'Active', 1),
(2, NULL, '2024-01-01', '2028-12-31', 18000.00, 50000.00, 3500000.00, 'Active', 1),
(3, NULL, '2023-07-15', '2026-06-30', 500000.00, 5000000.00, 100000000.00, 'Active', 1),
(4, NULL, '2023-08-01', '2028-06-30', 150000.00, 1000000.00, 25000000.00, 'Active', 1),
(NULL, 1, '2023-01-01', '2026-12-31', 12000.00, 10000.00, NULL, 'Active', 1),
(NULL, 2, '2023-01-01', '2026-12-31', 10000.00, 5000.00, NULL, 'Active', 1);

INSERT INTO TRANSFERS (PlayerID, FromClub, ToClub, TransferType, TransferFee, SellOnClause, WindowPeriod, TransferDate, Status) VALUES
(3, 'Paris Saint-Germain', 'FC Barcelona', 'Permanent', 0.00, 0.00, 'SummerWindow', '2023-07-15', 'Complete'),
(4, 'FC Barcelona Academy', 'FC Barcelona', 'Permanent', 0.00, 15.00, 'SummerWindow', '2023-08-01', 'Complete'),
(1, 'Karachi United', 'FC Lahore', 'Permanent', 500000.00, 5.00, 'SummerWindow', '2020-07-01', 'Complete');

INSERT INTO MATCHES (MatchDate, Opponent, Venue, HomeOrAway, Competition, HomeScore, AwayScore, MatchStatus, RecordedByUserID) VALUES
('2024-01-15 18:00:00', 'Manchester United', 'Old Trafford', 'Away', 'EuropeanCompetition', 2, 2, 'Completed', 1),
('2024-01-22 16:30:00', 'Real Madrid', 'Camp Nou', 'Home', 'EuropeanCompetition', 3, 1, 'Completed', 1),
('2025-05-15 20:00:00', 'Inter Milan', 'Camp Nou', 'Home', 'FriendlyMatch', NULL, NULL, 'Scheduled', 1);

INSERT INTO MEDICAL_RECORDS (PlayerID, TreatingStaffID, InjuryType, DateOfInjury, ExpectedReturnDate, ActualReturnDate, TreatmentNotes, ClearedToPlay) VALUES
(2, 2, 'Hamstring Tear - Grade 2', '2024-02-10', '2024-03-15', '2024-03-20', 'Extensive physiotherapy required', TRUE),
(1, 2, 'Knee Contusion', '2024-02-15', '2024-02-28', '2024-02-25', 'Bruising resolved', TRUE);

INSERT INTO PAYROLL (ContractID, PayPeriod, GrossAmount, Deductions, NetAmount, ProcessedByUserID, PayslipRef) VALUES
(1, 'January 2024', 108333.33, 21666.67, 86666.66, 2, 'PSL-2024-001'),
(2, 'January 2024', 78000.00, 15600.00, 62400.00, 2, 'PSL-2024-002'),
(3, 'January 2024', 2166666.67, 433333.33, 1733333.34, 2, 'PSL-2024-003'),
(4, 'January 2024', 650000.00, 130000.00, 520000.00, 2, 'PSL-2024-004');
