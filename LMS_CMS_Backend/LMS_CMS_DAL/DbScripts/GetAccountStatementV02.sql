Create OR ALTER PROCEDURE [dbo].[GetAccountStatement]
    @DateFrom DATE = NULL,
    @DateTo DATE = NULL,
    @MainAccNo BIGINT = 0,
    @SubAccNo BIGINT = 0
AS
BEGIN
    SELECT
        [Date], 
		MATC.Name Account,
		Serial, 
		CASE WHEN E.SubSubAccNo = 0 THEN '-' ELSE SA.SubAccountName END AS SubAccount, 
		CAST(Debit AS DECIMAL) Debit, 
		CAST(Credit AS DECIMAL) Credit,
		CAST(0 AS DECIMAL(18,2)) AS Balance,
		Notes
    FROM dbo.EntriesFun(@DateFrom, @DateTo) E 
    LEFT JOIN AccountingTreeCharts MATC ON (MATC.ID = @MainAccNo)
    LEFT JOIN AccountingTreeCharts SATC ON (SATC.ID = E.SubAccNo)
	OUTER APPLY dbo.GetSubAccountInfo(SATC.LinkFileID , E.SubSubAccNo) SA
	WHERE 
		(E.MainAccNo = @MainAccNo AND E.MainSubAccNo = @SubAccNo)
END;