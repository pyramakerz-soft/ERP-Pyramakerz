CREATE OR ALTER FUNCTION dbo.GetDistinctDateCount
(
    @DateFrom DATE = NULL,
    @DateTo   DATE = NULL
)
RETURNS BIGINT
AS
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT [Date])
        FROM dbo.EntriesFun(@DateFrom, @DateTo)
    );
END;