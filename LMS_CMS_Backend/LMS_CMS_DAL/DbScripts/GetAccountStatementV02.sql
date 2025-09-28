Create OR ALTER PROCEDURE [dbo].[GetAccountStatement]
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @MainAccNo BIGINT = 0,
    @SubAccNo BIGINT = 0,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        [Date], 
        MATC.Name AS Account,
        Serial, 
        CASE WHEN E.SubSubAccNo = 0 THEN '-' ELSE SA.SubAccountName END AS SubAccount, 
        CAST(Debit AS DECIMAL(18,2)) AS Debit, 
        CAST(Credit AS DECIMAL(18,2)) AS Credit,
        CAST(0 AS DECIMAL(18,2)) AS Balance,
        Notes
    FROM dbo.EntriesFun(@DateFrom, @DateTo) E 
    LEFT JOIN AccountingTreeCharts MATC ON (MATC.ID = @MainAccNo)
    LEFT JOIN AccountingTreeCharts SATC ON (SATC.ID = E.SubAccNo)
    OUTER APPLY dbo.GetSubAccountInfo(SATC.LinkFileID , E.SubSubAccNo) SA
    WHERE (E.MainAccNo = @MainAccNo AND E.MainSubAccNo = @SubAccNo)
    ORDER BY [Date], Serial
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;