CREATE OR ALTER PROCEDURE [dbo].[GetAccountBalance]
    @DateTo DATE = NULL,
    @MainAccNo BIGINT = 0,
    @LinkFileID BIGINT = 0,
    @zeroBalance BIT = 1,
    @positiveBalance BIT = 1,
    @negativeBalance BIT = 1,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH CTE AS
    (
        SELECT 
            SA.SubAccountNo AS ID,
            SA.SubAccountName AS Name,
            SUM(ISNULL(E.Debit, 0)) AS Debit,
            SUM(ISNULL(E.Credit, 0)) AS Credit,
            ROW_NUMBER() OVER (ORDER BY SA.SubAccountNo, SA.SubAccountName) AS RowNum
        FROM dbo.GetSubAccountInfo(@LinkFileID, NULL) SA
        LEFT JOIN dbo.EntriesFun('1900-1-1', @DateTo) E
            ON E.SubAccountNo = SA.SubAccountNo
           AND (
                 @LinkFileID = E.MainAccountNo 
                 OR @LinkFileID = (
                       SELECT ATC.LinkFileID 
                       FROM AccountingTreeCharts ATC 
                       WHERE ATC.ID = E.ATCID
                   )
               )
        WHERE (@MainAccNo = 0 OR @MainAccNo = SA.AccountID)
        GROUP BY SA.SubAccountNo, SA.SubAccountName
    )
    SELECT ID, Name, Debit, Credit
    FROM CTE
    WHERE RowNum BETWEEN ((@PageNumber-1)*@PageSize + 1) AND (@PageNumber*@PageSize)
	AND (
		(@ZeroBalance = 1 AND Credit = 0 AND Debit = 0)
    OR
		(@PositiveBalance = 1 AND 
			CASE WHEN @LinkFileID IN (2, 4, 7, 10, 11) THEN Credit - Debit ELSE Debit - Credit END > 0)
    OR
		(@NegativeBalance = 1 AND 
			CASE WHEN @LinkFileID IN (2, 4, 7, 10, 11) THEN Debit - Credit ELSE Credit - Debit END > 0)
)

    ORDER BY RowNum
	OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END