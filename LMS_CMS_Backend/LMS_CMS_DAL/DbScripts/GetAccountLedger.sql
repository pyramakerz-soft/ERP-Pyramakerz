CREATE OR ALTER PROCEDURE [dbo].[GetAccountLedger]
    @DateFrom    DATE     = NULL,
    @DateTo      DATE     = NULL,
    @MainAccNo   BIGINT   = 0,
    @LinkFileID  BIGINT   = 0,
    @PageNumber  INT      = 1,
    @PageSize    INT      = 10
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH LedgerCTE AS
    (
        SELECT 
            SA.SubAccountNo   AS ID,
            SA.SubAccountName AS Name,
            SUM(ISNULL(E.Debit, 0))  AS Debit,
            SUM(ISNULL(E.Credit, 0)) AS Credit
        FROM dbo.GetSubAccountInfo(@LinkFileID, NULL) SA
        LEFT JOIN dbo.EntriesFun(@DateFrom, @DateTo) E
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
    SELECT 
        ID,
        Name,
        Debit,
        Credit,
        COUNT(*) OVER() AS TotalCount   -- gives total rows before paging
    FROM LedgerCTE
    ORDER BY ID
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;