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
            ON (E.MainAccNo = SA.AccountID AND E.MainSubAccNo = SA.SubAccountNo)
        WHERE (@MainAccNo = 0 OR E.MainAccNo = @MainAccNo)
        GROUP BY SA.SubAccountNo, SA.SubAccountName
    )
    SELECT 
        ID,
        Name,
	CAST(Debit AS DECIMAL) Debit, 
	CAST(Credit AS DECIMAL) Credit
    FROM LedgerCTE
    ORDER BY ID
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;