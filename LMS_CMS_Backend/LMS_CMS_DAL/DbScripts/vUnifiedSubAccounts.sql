/****** Object:  View [dbo].[vUnifiedSubAccounts]    Script Date: 7/28/2025 12:34:49 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE OR ALTER VIEW [dbo].[vUnifiedSubAccounts]
AS
SELECT 1 AS LinkFileID, ID AS SubAccountNo, en_name AS SubAccountName FROM Student
UNION ALL
SELECT 2, ID, Name FROM Suppliers
UNION ALL
SELECT 3, ID, Name FROM Debits
UNION ALL
SELECT 4, ID, Name FROM Credits
UNION ALL
SELECT 5, ID, Name FROM Saves
UNION ALL
SELECT 6, ID, Name FROM Banks
UNION ALL
SELECT 7, ID, Name FROM Incomes
UNION ALL
SELECT 8, ID, Name FROM Outcomes
UNION ALL
SELECT 9, ID, Name FROM Assets
UNION ALL
SELECT 10, ID, en_name FROM Employee
UNION ALL
SELECT 11, ID, Name FROM TuitionFeesTypes
UNION ALL
SELECT 12, ID, Name FROM TuitionDiscountTypes
UNION ALL
SELECT 13 AS LinkFileID, ID AS SubAccountNo, en_name AS SubAccountName FROM Student;
GO