CREATE OR ALTER PROCEDURE [dbo].[GetAccountSummary]
AS
BEGIN
    SELECT 
        top 1 ID from LinkFile
END