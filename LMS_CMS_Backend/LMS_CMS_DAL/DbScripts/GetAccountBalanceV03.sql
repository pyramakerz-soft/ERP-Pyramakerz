CREATE OR ALTER PROCEDURE [dbo].[GetAccountBalance]
    @DateTo DATE = NULL,
    @MainAccNo BIGINT = 0,
    @LinkFileID BIGINT = 0,
    @ZeroBalance BIT = 1,
    @PositiveBalance BIT = 1,
    @NegativeBalance BIT = 1,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    ---------------------------------------------------------------------
    -- Build all CTEs ONCE and use them TWICE by finishing with a SELECT UNION
    -- (CTE is valid only for the very next query)
    ---------------------------------------------------------------------

    ;WITH BaseData AS
    (
        SELECT
            SA.SubAccountNo AS ID,
            SA.SubAccountName AS Name,
            SUM(ISNULL(E.Debit, 0))     AS TotalDebit,
            SUM(ISNULL(E.Credit, 0))    AS TotalCredit
        FROM dbo.GetSubAccountInfo(@LinkFileID, NULL) AS SA
        LEFT JOIN dbo.EntriesFun('1900-01-01', @DateTo) AS E
            ON  E.MainAccNo     = SA.AccountID
            AND E.MainSubAccNo  = SA.SubAccountNo
            AND (@MainAccNo = 0 OR E.MainAccNo = @MainAccNo)
        GROUP BY SA.SubAccountNo, SA.SubAccountName
    ),
    FinalCTE AS
    (
        SELECT 
            ID,
            Name,

            CAST(ABS(TotalDebit - TotalCredit) AS DECIMAL(18,2)) AS Debit,
            CAST(ABS(TotalCredit - TotalDebit) AS DECIMAL(18,2)) AS Credit,

            CASE 
                WHEN @LinkFileID IN (2, 4, 7, 10, 11)
                    THEN TotalCredit - TotalDebit
                ELSE    TotalDebit - TotalCredit
            END AS Balance
        FROM BaseData
    ),
    FilteredCTE AS
    (
        SELECT *
        FROM FinalCTE
        WHERE 
            (@ZeroBalance = 1 AND Balance = 0)
            OR (@PositiveBalance = 1 AND Balance > 0)
            OR (@NegativeBalance = 1 AND Balance < 0)
    )

    ---------------------------------------------------------------------
    -- 1st Result: paginated
    ---------------------------------------------------------------------
    SELECT 
        ID,
        Name,
        Debit,
        Credit
    FROM FilteredCTE
    ORDER BY ID
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    ---------------------------------------------------------------------
    -- 2nd Result: total count
    ---------------------------------------------------------------------
    ;WITH BaseData AS
    (
        SELECT
            SA.SubAccountNo AS ID,
            SA.SubAccountName AS Name,
            SUM(ISNULL(E.Debit, 0))     AS TotalDebit,
            SUM(ISNULL(E.Credit, 0))    AS TotalCredit
        FROM dbo.GetSubAccountInfo(@LinkFileID, NULL) AS SA
        LEFT JOIN dbo.EntriesFun('1900-01-01', @DateTo) AS E
            ON  E.MainAccNo     = SA.AccountID
            AND E.MainSubAccNo  = SA.SubAccountNo
            AND (@MainAccNo = 0 OR E.MainAccNo = @MainAccNo)
        GROUP BY SA.SubAccountNo, SA.SubAccountName
    ),
    FinalCTE AS
    (
        SELECT 
            ID,
            Name,
            CASE 
                WHEN @LinkFileID IN (2, 4, 7, 10, 11)
                    THEN TotalCredit - TotalDebit
                ELSE    TotalDebit - TotalCredit
            END AS Balance
        FROM BaseData
    ),
    FilteredCTE AS
    (
        SELECT Balance
        FROM FinalCTE
        WHERE 
            (@ZeroBalance = 1 AND Balance = 0)
            OR (@PositiveBalance = 1 AND Balance > 0)
            OR (@NegativeBalance = 1 AND Balance < 0)
    )
    SELECT COUNT(*) AS TotalCount
    FROM FilteredCTE;

END

