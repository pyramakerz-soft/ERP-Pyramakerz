/****** Object:  StoredProcedure [dbo].[GetSupplierAccountSummary]    Script Date: 7/29/2025 6:08:40 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[GetAccountSummary]
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @MainAccNo BIGINT = 0,
    @SubAccNo BIGINT = 0,
    @linkFileID BIGINT = 0,
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @zeroBalance BIT = 1,
    @positiveBalance BIT = 1,
    @negativeBalance BIT = 1
AS
BEGIN
    SET NOCOUNT ON;

    CREATE TABLE #AccountSummary (
        ID BIGINT,
        Name NVARCHAR(200),
        Debit DECIMAL(18,2),
        Credit DECIMAL(18,2),
        RowNum INT
    );

    IF @linkFileID = 2  -- Suppliers
		BEGIN
			INSERT INTO #AccountSummary
			SELECT 
				S.ID,
				S.Name,
				SUM(ISNULL(E.Debit, 0)) AS Debit,
				SUM(ISNULL(E.Credit, 0)) AS Credit,
				ROW_NUMBER() OVER (ORDER BY S.ID, S.Name) AS RowNum
			FROM Suppliers S
			LEFT JOIN dbo.EntriesFun(@DateFrom, @DateTo, @MainAccNo, @SubAccNo, @linkFileID) E
				ON E.LinkFileID = 2 AND E.SubAccountNo = S.ID
			WHERE 
				(@SubAccNo = 0 OR S.ID = @SubAccNo) -- apply if SubAccNo is given
				AND (@MainAccNo = 0 OR S.AccountNumberID = @MainAccNo)
				AND (
					(@ZeroBalance = 1 AND ISNULL(E.Credit, 0) = 0 AND ISNULL(E.Debit, 0) = 0) OR
					(@PositiveBalance = 1 AND ISNULL(E.Credit, 0) > 0) OR
					(@NegativeBalance = 1 AND ISNULL(E.Debit, 0) > 0)
				)
			GROUP BY S.ID, S.Name;
		END

    ELSE IF @linkFileID = 5  -- Safes
		BEGIN
			INSERT INTO #AccountSummary
			SELECT 
				SF.ID,
				SF.Name,
				SUM(ISNULL(E.Debit, 0)) AS Debit,
				SUM(ISNULL(E.Credit, 0)) AS Credit,
				ROW_NUMBER() OVER (ORDER BY SF.ID, SF.Name) AS RowNum
			FROM Saves SF
			LEFT JOIN dbo.EntriesFun(@DateFrom, @DateTo, @MainAccNo, @SubAccNo, @linkFileID) E
				ON E.LinkFileID = 5 AND E.SubAccountNo = SF.ID
			WHERE 
				(@MainAccNo = 0 OR SF.AccountNumberID = @MainAccNo)
				AND (@SubAccNo = 0 OR SF.ID = @SubAccNo)
				AND (
					(@ZeroBalance = 1 AND ISNULL(E.Credit, 0) = 0 AND ISNULL(E.Debit, 0) = 0) OR
					(@PositiveBalance = 1 AND ISNULL(E.Credit, 0) > ISNULL(E.Debit, 0)) OR
					(@NegativeBalance = 1 AND ISNULL(E.Debit, 0) > ISNULL(E.Credit, 0))
				)
			GROUP BY SF.ID, SF.Name;
		END

    -- Paged result
    SELECT 
        ID, Name, Debit, Credit
    FROM #AccountSummary
    WHERE RowNum BETWEEN ((@PageNumber - 1) * @PageSize + 1) AND (@PageNumber * @PageSize)
    ORDER BY RowNum;

    -- Totals
    SELECT 
        SUM(ISNULL(Debit, 0)) AS TotalDebit,
        SUM(ISNULL(Credit, 0)) AS TotalCredit,
		CASE WHEN @linkFileID = 2 THEN SUM(ISNULL(Credit, 0)) - SUM(ISNULL(Debit, 0))
		ELSE SUM(ISNULL(Debit, 0)) - SUM(ISNULL(Credit, 0)) 
         END AS Difference
    FROM #AccountSummary;

    DROP TABLE #AccountSummary;
END