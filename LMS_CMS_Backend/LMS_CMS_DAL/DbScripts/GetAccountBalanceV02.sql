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
            ABS(SUM(ISNULL(E.Debit,0)) - SUM(ISNULL(E.Credit,0))) Debit,
            ABS(SUM(ISNULL(E.Credit,0)) - SUM(ISNULL(E.Debit,0))) Credit,
            CASE 
                WHEN @LinkFileID IN (2, 4, 7, 10, 11) 
                    THEN SUM(ISNULL(E.Credit,0)) - SUM(ISNULL(E.Debit,0))  
					ELSE SUM(ISNULL(E.Debit,0)) - SUM(ISNULL(E.Credit,0))      
            END AS Balance
        FROM dbo.GetSubAccountInfo(@LinkFileID, NULL) SA
        LEFT JOIN dbo.EntriesFun('1900-01-01', @DateTo) E
            ON (E.MainAccNo = SA.AccountID AND E.MainSubAccNo = SA.SubAccountNo)
        WHERE (@MainAccNo = 0 OR E.MainAccNo = @MainAccNo)
        GROUP BY SA.SubAccountNo, SA.SubAccountName
    )
    SELECT ID, Name, 
	Debit, 
	Credit
    FROM CTE
    WHERE 
          (@ZeroBalance = 1 AND Balance = 0)
       OR (@PositiveBalance = 1 AND Balance > 0)
       OR (@NegativeBalance = 1 AND Balance < 0)
    ORDER BY ID
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END