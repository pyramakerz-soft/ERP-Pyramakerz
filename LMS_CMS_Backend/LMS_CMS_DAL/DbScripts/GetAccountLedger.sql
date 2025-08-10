CREATE OR ALTER PROCEDURE [dbo].[GetAccountLedger]
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @AccountId BIGINT = 0,
    @LinkFileID BIGINT = 0,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    -- Temp table to hold function results
    IF OBJECT_ID('tempdb..#AllEntries') IS NOT NULL DROP TABLE #AllEntries;

    SELECT *
    INTO #AllEntries
    FROM dbo.EntriesFun(@DateFrom, @DateTo, 0, 0, @LinkFileID)
    WHERE LinkFileID = @LinkFileID;

    -- Ledger temp table
    IF OBJECT_ID('tempdb..#LedgerData') IS NOT NULL DROP TABLE #LedgerData;

    CREATE TABLE #LedgerData (
        ID BIGINT,
        Name NVARCHAR(255),
        Debit DECIMAL(18, 2),
        Credit DECIMAL(18, 2),
        RowNum INT
    );

    IF @LinkFileID = 2
    BEGIN
        INSERT INTO #LedgerData (ID, Name, Debit, Credit, RowNum)
        SELECT 
            S.ID,
            S.Name,
            SUM(ISNULL(E.Debit, 0)),
            SUM(ISNULL(E.Credit, 0)),
            ROW_NUMBER() OVER (ORDER BY S.Name)
        FROM Suppliers S
        INNER JOIN AccountingTreeCharts ATC ON S.AccountNumberID = ATC.ID
        LEFT JOIN #AllEntries E ON E.SubAccountNo = S.ID
        WHERE (@AccountId = 0 OR ATC.ID = @AccountId)
        GROUP BY S.ID, S.Name;
    END
    ELSE IF @LinkFileID = 5
    BEGIN
        INSERT INTO #LedgerData (ID, Name, Debit, Credit, RowNum)
        SELECT 
            Sv.ID,
            Sv.Name,
            SUM(ISNULL(E.Debit, 0)),
            SUM(ISNULL(E.Credit, 0)),
            ROW_NUMBER() OVER (ORDER BY Sv.Name)
        FROM Saves Sv
        INNER JOIN AccountingTreeCharts ATC ON Sv.AccountNumberID = ATC.ID
        LEFT JOIN #AllEntries E ON E.SubAccountNo = Sv.ID
        WHERE (@AccountId = 0 OR ATC.ID = @AccountId)
        GROUP BY Sv.ID, Sv.Name;
    END
    ELSE IF @LinkFileID = 6
    BEGIN
        INSERT INTO #LedgerData (ID, Name, Debit, Credit, RowNum)
        SELECT 
            B.ID,
            B.BankName,
            SUM(ISNULL(E.Debit, 0)),
            SUM(ISNULL(E.Credit, 0)),
            ROW_NUMBER() OVER (ORDER BY B.BankName)
        FROM Banks B
        INNER JOIN AccountingTreeCharts ATC ON B.AccountNumberID = ATC.ID
        LEFT JOIN #AllEntries E ON E.SubAccountNo = B.ID
        WHERE (@AccountId = 0 OR ATC.ID = @AccountId)
        GROUP BY B.ID, B.BankName;
    END

    -- Paged result
    SELECT 
        ID,
        Name,
        Debit,
        Credit
    FROM #LedgerData
    WHERE RowNum BETWEEN (@PageNumber - 1) * @PageSize + 1 AND @PageNumber * @PageSize;

    -- Summary row
    SELECT 
        SUM(Debit) AS Debit,
        SUM(Credit) AS Credit
    FROM #LedgerData;
END