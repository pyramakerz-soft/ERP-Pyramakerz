using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class spSalaryCalculation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE OR ALTER PROCEDURE [dbo].[GenerateSalaryHistoryM]
                    @Month INT,
                    @Year INT,
                    @EmployeeId BIGINT = 0  -- Optional: 0 = all employees, >0 = specific
                AS
                BEGIN
                    SET NOCOUNT ON;

                    -- Salary configuration
                    DECLARE @SalaryConfigID INT = 1;
                    DECLARE @StartDay INT, @OvertimeStartAfterMinutes INT, @FromPreviousMonth BIT;
                    DECLARE @PeriodStart DATE, @PeriodEnd DATE;

                    SELECT 
                        @StartDay = StartDay,
                        @OvertimeStartAfterMinutes = OvertimeStartAfterMinutes,
                        @FromPreviousMonth = FromPreviousMonth
                    FROM SalaryConfigration 
                    WHERE ID = @SalaryConfigID;

                    IF @StartDay IS NULL
                    BEGIN
                        RAISERROR('Salary configuration not found.', 16, 1);
                        RETURN;
                    END

                    -- Salary period
                    IF @FromPreviousMonth = 0
                    BEGIN
                        SET @PeriodStart = DATEFROMPARTS(@Year, @Month, @StartDay);
                        SET @PeriodEnd   = DATEADD(DAY, -1, DATEADD(MONTH, 1, @PeriodStart));
                    END
                    ELSE
                    BEGIN
                        SET @PeriodStart = DATEADD(MONTH, -1, DATEFROMPARTS(@Year, @Month, @StartDay));
                        SET @PeriodEnd   = DATEADD(DAY, -1, DATEFROMPARTS(@Year, @Month, @StartDay));
                    END

                    -- Variables
                    DECLARE @CurrentEmployeeId BIGINT;
                    DECLARE @HasAttendance BIT;
                    DECLARE @MonthSalary DECIMAL(18,2);
                    DECLARE @AttendanceTime VARCHAR(50), @DepartureTime VARCHAR(50);
                    DECLARE @AttendanceTimeSpan TIME, @DepartureTimeSpan TIME;
                    DECLARE @FullDayHours DECIMAL(10,2);
                    DECLARE @DailyRate DECIMAL(18,2), @HourlyRate DECIMAL(18,6), @MinuteRate DECIMAL(18,6);

                    -- Salary history variables
                    DECLARE @BasicSalary DECIMAL(18,2);
                    DECLARE @TotalDeductions DECIMAL(18,2);
                    DECLARE @TotalAbsentDays INT;
                    DECLARE @TotalOvertime DECIMAL(18,2);
                    DECLARE @TotalBonus DECIMAL(18,2);
                    DECLARE @TotalLoans DECIMAL(18,2);
                    DECLARE @NetSalary DECIMAL(18,2);

                    -- For matching C# behavior we need summed hour/minute ints
                    DECLARE @SumOvertimeHours INT, @SumOvertimeMinutes INT;
                    DECLARE @SumDeductionHours INT, @SumDeductionMinutes INT;
                    DECLARE @CombinedMinutes INT, @HoursComponent INT, @MinutesComponent INT;

                    -- Cursor for employees
                    DECLARE emp_cursor CURSOR FOR 
                        SELECT ID, HasAttendance, MonthSalary, AttendanceTime, DepartureTime
                        FROM Employee 
                        WHERE (@EmployeeId = 0 OR ID = @EmployeeId)
                          AND (IsDeleted IS NULL OR IsDeleted != 1);

                    OPEN emp_cursor;
                    FETCH NEXT FROM emp_cursor INTO @CurrentEmployeeId, @HasAttendance, @MonthSalary, @AttendanceTime, @DepartureTime;

                    WHILE @@FETCH_STATUS = 0
                    BEGIN
                        -- Reset per employee
                        SET @BasicSalary = ISNULL(@MonthSalary, 0);
                        SET @TotalDeductions = 0;
                        SET @TotalOvertime = 0;
                        SET @TotalBonus = 0;
                        SET @TotalLoans = 0;
                        SET @TotalAbsentDays = 0;

                        -- Parse Attendance/Departure safely
                        BEGIN TRY
                            SET @AttendanceTimeSpan = CAST(@AttendanceTime AS TIME);
                            SET @DepartureTimeSpan = CAST(@DepartureTime AS TIME);
                            SET @FullDayHours = CAST(DATEDIFF(MINUTE, @AttendanceTimeSpan, @DepartureTimeSpan) AS DECIMAL(10,2)) / 60.0;
                        END TRY
                        BEGIN CATCH
                            SET @FullDayHours = 0;
                        END CATCH

                        -- Calculate rates
                        SET @DailyRate  = CASE WHEN @BasicSalary > 0 THEN @BasicSalary / 30.0 ELSE 0 END;
                        SET @HourlyRate = CASE WHEN @FullDayHours > 0 THEN @DailyRate / @FullDayHours ELSE 0 END;
                        SET @MinuteRate = CASE WHEN @HourlyRate > 0 THEN @HourlyRate / 60.0 ELSE 0 END;

                        -- Attendance calculations (match C# sums then TimeSpan component logic)
                        IF @HasAttendance = 1
                        BEGIN
                            -- Sum overtime hours/minutes across rows (like the C# code did)
                            SELECT 
                                @SumOvertimeHours   = ISNULL(SUM(OvertimeHours), 0),
                                @SumOvertimeMinutes = ISNULL(SUM(OvertimeMinutes), 0),
                                @SumDeductionHours  = ISNULL(SUM(DeductionHours), 0),
                                @SumDeductionMinutes= ISNULL(SUM(DeductionMinutes), 0),
                                @TotalAbsentDays    = ISNULL(SUM(CASE WHEN DayStatusId = 2 THEN 1 ELSE 0 END), 0)
                            FROM MonthlyAttendance
                            WHERE EmployeeId = @CurrentEmployeeId 
                              AND Day >= @PeriodStart 
                              AND Day <= @PeriodEnd;

                            -- Construct total deduction amount using C# logic:
                            -- C#: TimeSpan sunDeduction = FromHours(sumHours) + FromMinutes(sumMinutes);
                            --      amount = hourlyRate * sunDeduction.Hours + minuteRate * sunDeduction.Minutes;
                            SET @CombinedMinutes = ISNULL(@SumDeductionHours,0) * 60 + ISNULL(@SumDeductionMinutes,0);
                            -- Hours component within day (TimeSpan.Hours in C#), i.e. hours % 24
                            SET @HoursComponent  = (@CombinedMinutes / 60) % 24;
                            SET @MinutesComponent= @CombinedMinutes % 60;
                            SET @TotalDeductions = (@HourlyRate * @HoursComponent) + (@MinuteRate * @MinutesComponent);

                            -- Add absent days deduction (C# adds dailyRate * totalAbsentDays)
                            SET @TotalDeductions += (@DailyRate * ISNULL(@TotalAbsentDays,0));

                            -- Now overtime amount using same C# logic
                            SET @CombinedMinutes = ISNULL(@SumOvertimeHours,0) * 60 + ISNULL(@SumOvertimeMinutes,0);
                            SET @HoursComponent  = (@CombinedMinutes / 60) % 24;
                            SET @MinutesComponent= @CombinedMinutes % 60;
                            SET @TotalOvertime = (@HourlyRate * @HoursComponent) + (@MinuteRate * @MinutesComponent);
                        END

                        -- Bonuses (same logic as before)
                        DECLARE @BonusHours INT, @BonusMinutes INT, @BonusDays INT, @BonusAmount DECIMAL(18,2), @BounsTypeID INT;
                        DECLARE bonus_cursor CURSOR FOR 
                            SELECT Hours, Minutes, NumberOfBounsDays, Amount, BounsTypeID
                            FROM Bouns 
                            WHERE EmployeeID = @CurrentEmployeeId 
                              AND [Date] >= @PeriodStart 
                              AND [Date] <= @PeriodEnd;

                        OPEN bonus_cursor;
                        FETCH NEXT FROM bonus_cursor INTO @BonusHours, @BonusMinutes, @BonusDays, @BonusAmount, @BounsTypeID;
                        WHILE @@FETCH_STATUS = 0
                        BEGIN
                            IF @BounsTypeID = 1 SET @TotalBonus += (@HourlyRate * ISNULL(@BonusHours,0)) + (@MinuteRate * ISNULL(@BonusMinutes,0));
                            ELSE IF @BounsTypeID = 2 SET @TotalBonus += @DailyRate * ISNULL(@BonusDays,0);
                            ELSE IF @BounsTypeID = 3 SET @TotalBonus += ISNULL(@BonusAmount,0);

                            FETCH NEXT FROM bonus_cursor INTO @BonusHours, @BonusMinutes, @BonusDays, @BonusAmount, @BounsTypeID;
                        END
                        CLOSE bonus_cursor; DEALLOCATE bonus_cursor;

                        -- Additional deductions (type-based)
                        DECLARE @DedHours INT, @DedMinutes INT, @DedDays INT, @DedAmount DECIMAL(18,2), @DedTypeID INT;
                        DECLARE ded_cursor CURSOR FOR 
                            SELECT Hours, Minutes, NumberOfDeductionDays, Amount, DeductionTypeID
                            FROM Deduction 
                            WHERE EmployeeID = @CurrentEmployeeId 
                              AND [Date] >= @PeriodStart 
                              AND [Date] <= @PeriodEnd;

                        OPEN ded_cursor;
                        FETCH NEXT FROM ded_cursor INTO @DedHours, @DedMinutes, @DedDays, @DedAmount, @DedTypeID;
                        WHILE @@FETCH_STATUS = 0
                        BEGIN
                            IF @DedTypeID = 1 SET @TotalDeductions += (@HourlyRate * ISNULL(@DedHours,0)) + (@MinuteRate * ISNULL(@DedMinutes,0));
                            ELSE IF @DedTypeID = 2 SET @TotalDeductions += @DailyRate * ISNULL(@DedDays,0);
                            ELSE IF @DedTypeID = 3 SET @TotalDeductions += ISNULL(@DedAmount,0);

                            FETCH NEXT FROM ded_cursor INTO @DedHours, @DedMinutes, @DedDays, @DedAmount, @DedTypeID;
                        END
                        CLOSE ded_cursor; DEALLOCATE ded_cursor;

                        -- Loans (insert per loan same as C#)
                        DECLARE @LoanId BIGINT, @LoanAmount DECIMAL(18,2), @NumDeduction INT, @LoanDeductionAmount DECIMAL(18,2);
                        DECLARE loan_cursor CURSOR FOR 
                            SELECT ID, Amount, NumberOfDeduction
                            FROM Loans 
                            WHERE EmployeeID = @CurrentEmployeeId 
                              AND (DeductionStartYear < @Year OR (DeductionStartYear = @Year AND DeductionStartMonth <= @Month))
                              AND (DeductionEndYear > @Year OR (DeductionEndYear = @Year AND DeductionEndMonth >= @Month));

                        OPEN loan_cursor;
                        FETCH NEXT FROM loan_cursor INTO @LoanId, @LoanAmount, @NumDeduction;
                        WHILE @@FETCH_STATUS = 0
                        BEGIN
                            IF @NumDeduction IS NULL OR @NumDeduction = 0
                                SET @NumDeduction = 1; -- guard

                            SET @LoanDeductionAmount = ISNULL(@LoanAmount,0) / @NumDeduction;
                            INSERT INTO EmployeeLoans (EmployeeId, loanId, Year, Month, Amount)
                            VALUES (@CurrentEmployeeId, @LoanId, @Year, @Month, @LoanDeductionAmount);
                            SET @TotalLoans += @LoanDeductionAmount;

                            FETCH NEXT FROM loan_cursor INTO @LoanId, @LoanAmount, @NumDeduction;
                        END
                        CLOSE loan_cursor; DEALLOCATE loan_cursor;

                        -- Net Salary (match C#)
                        SET @NetSalary = @BasicSalary - (ISNULL(@TotalLoans,0) + ISNULL(@TotalDeductions,0)) + (ISNULL(@TotalBonus,0) + ISNULL(@TotalOvertime,0));

                        -- Insert salary history
                        INSERT INTO SalaryHistory (EmployeeId, Month, Year, BasicSalary, TotalDeductions, TotalOvertime, TotalBonus, TotalLoans, NetSalary)
                        VALUES (@CurrentEmployeeId, @Month, @Year, @BasicSalary, @TotalDeductions, @TotalOvertime, @TotalBonus, @TotalLoans, @NetSalary);

                        -- Next employee
                        FETCH NEXT FROM emp_cursor INTO @CurrentEmployeeId, @HasAttendance, @MonthSalary, @AttendanceTime, @DepartureTime;
                    END

                    CLOSE emp_cursor;
                    DEALLOCATE emp_cursor;

                    SELECT 'Salary history generated successfully.' AS Message;
                END
                GO
            ");

            migrationBuilder.Sql(@"
                SET ANSI_NULLS ON
                GO
                SET QUOTED_IDENTIFIER ON
                GO

                CREATE OR ALTER PROCEDURE dbo.AddAllMonthlyAttendance
                    @Month INT,
                    @Year INT,
                    @EmployeeId BIGINT = 0  -- 0 => all employees
                AS
                BEGIN
                    SET NOCOUNT ON;

                    ---------------------------------------------------------
                    -- 0. Safety: ensure temp table from previous runs removed
                    ---------------------------------------------------------
                    IF OBJECT_ID('tempdb..#Employees') IS NOT NULL
                        DROP TABLE #Employees;

                    ---------------------------------------------------------
                    -- 1. Load salary configuration (ID = 1)
                    ---------------------------------------------------------
                    DECLARE @StartDay INT,
                            @OvertimeStartAfterMinutes INT,
                            @FromPreviousMonth BIT;

                    SELECT TOP (1)
                        @StartDay = StartDay,
                        @OvertimeStartAfterMinutes = OvertimeStartAfterMinutes,
                        @FromPreviousMonth = FromPreviousMonth
                    FROM SalaryConfigration
                    WHERE ID = 1;

                    IF @StartDay IS NULL
                    BEGIN
                        RAISERROR('Salary configuration not found (ID=1).',16,1);
                        RETURN;
                    END

                    ---------------------------------------------------------
                    -- 2. Calculate period start / end (match C# logic)
                    ---------------------------------------------------------
                    DECLARE @PeriodStart DATE, @PeriodEnd DATE;

                    IF @FromPreviousMonth = 0
                    BEGIN
                        SET @PeriodStart = DATEFROMPARTS(@Year, @Month, @StartDay);
                        -- C# used: periodEnd = periodStart.AddMonths(1).AddDays(-1)
                        SET @PeriodEnd = DATEADD(DAY,-1,DATEADD(MONTH,1,@PeriodStart));
                    END
                    ELSE
                    BEGIN
                        SET @PeriodStart = DATEADD(MONTH,-1,DATEFROMPARTS(@Year, @Month, @StartDay));
                        SET @PeriodEnd = DATEADD(DAY,-1,DATEFROMPARTS(@Year, @Month, @StartDay));
                    END

                    ---------------------------------------------------------
                    -- 3. Build employee set (either specific or all non-deleted)
                    ---------------------------------------------------------
                    CREATE TABLE #Employees
                    (
                        ID BIGINT PRIMARY KEY,
                        HasAttendance BIT,
                        AttendanceTime VARCHAR(50),
                        DepartureTime VARCHAR(50),
                        DelayAllowance INT,
                        MonthSalary DECIMAL(18,2)
                    );

                    IF @EmployeeId > 0
                    BEGIN
                        INSERT INTO #Employees (ID, HasAttendance, AttendanceTime, DepartureTime, DelayAllowance, MonthSalary)
                        SELECT ID, HasAttendance, AttendanceTime, DepartureTime, ISNULL(DelayAllowance,0), MonthSalary
                        FROM Employee
                        WHERE ID = @EmployeeId AND (IsDeleted IS NULL OR IsDeleted != 1);
        
                        IF @@ROWCOUNT = 0
                        BEGIN
                            RAISERROR('Employee with ID %d not found or deleted.',16,1,@EmployeeId);
                            RETURN;
                        END
                    END
                    ELSE
                    BEGIN
                        INSERT INTO #Employees (ID, HasAttendance, AttendanceTime, DepartureTime, DelayAllowance, MonthSalary)
                        SELECT ID, HasAttendance, AttendanceTime, DepartureTime, ISNULL(DelayAllowance,0), MonthSalary
                        FROM Employee
                        WHERE (IsDeleted IS NULL OR IsDeleted != 1);
                    END

                    ---------------------------------------------------------
                    -- 4. Delete existing MonthlyAttendance / SalaryHistory / EmployeeLoans for these employees in the period
                    ---------------------------------------------------------
                    DELETE MA
                    FROM MonthlyAttendance MA
                    INNER JOIN #Employees E ON MA.EmployeeId = E.ID
                    WHERE MA.Day BETWEEN @PeriodStart AND @PeriodEnd;

                    DELETE SH
                    FROM SalaryHistory SH
                    INNER JOIN #Employees E ON SH.EmployeeId = E.ID
                    WHERE SH.Month = @Month AND SH.Year = @Year;

                    DELETE EL
                    FROM EmployeeLoans EL
                    INNER JOIN #Employees E ON EL.EmployeeId = E.ID
                    WHERE EL.Month = @Month AND EL.Year = @Year;

                    ---------------------------------------------------------
                    -- 5. Validate each employee: parse times and check incomplete clocks
                    ---------------------------------------------------------
                    DECLARE @EmpId BIGINT,
                            @HasAttendance BIT,
                            @AttendanceTimeStr VARCHAR(50),
                            @DepartureTimeStr VARCHAR(50),
                            @DelayAllowance INT;

                    DECLARE validate_cursor CURSOR LOCAL FAST_FORWARD FOR
                        SELECT ID, HasAttendance, AttendanceTime, DepartureTime, DelayAllowance
                        FROM #Employees;

                    OPEN validate_cursor;
                    FETCH NEXT FROM validate_cursor INTO @EmpId, @HasAttendance, @AttendanceTimeStr, @DepartureTimeStr, @DelayAllowance;

                    WHILE @@FETCH_STATUS = 0
                    BEGIN
                        -- Only validate employees who have attendance enabled
                        IF @HasAttendance = 1
                        BEGIN
                            -- Validate parseable times
                            DECLARE @AttendanceTimeMsg VARCHAR(50);
			                SET @AttendanceTimeMsg = ISNULL(@AttendanceTimeStr,'NULL');

			                IF TRY_CAST(@AttendanceTimeStr AS TIME) IS NULL
			                BEGIN
				                RAISERROR('Invalid AttendanceTime for employee %d: %s',16,1,@EmpId,@AttendanceTimeMsg);
				                CLOSE validate_cursor; DEALLOCATE validate_cursor;
				                RETURN;
			                END

                            DECLARE @DepartureTimeMsg VARCHAR(50);
			                SET @DepartureTimeMsg = ISNULL(@DepartureTimeStr,'NULL');

			                IF TRY_CAST(@DepartureTimeStr AS TIME) IS NULL
			                BEGIN
				                RAISERROR('Invalid DepartureTime for employee %d: %s',16,1,@EmpId,@DepartureTimeMsg);
				                CLOSE validate_cursor; DEALLOCATE validate_cursor;
				                RETURN;
			                END

                            -- Check for any EmployeeClocks in period with NULL ClockOut
                            IF EXISTS (
                                SELECT 1 FROM EmployeeClocks EC
                                WHERE EC.EmployeeID = @EmpId
                                    AND EC.Date >= @PeriodStart AND EC.Date <= @PeriodEnd
                                    AND (EC.IsDeleted IS NULL OR EC.IsDeleted != 1)
                                    AND EC.ClockOut IS NULL
                            )
                            BEGIN
                                RAISERROR('Employee %d has days without clock out in the period.',16,1,@EmpId);
                                CLOSE validate_cursor; DEALLOCATE validate_cursor;
                                RETURN;
                            END
                        END

                        FETCH NEXT FROM validate_cursor INTO @EmpId, @HasAttendance, @AttendanceTimeStr, @DepartureTimeStr, @DelayAllowance;
                    END

                    CLOSE validate_cursor; DEALLOCATE validate_cursor;

                    ---------------------------------------------------------
                    -- 6. Process employees day-by-day and insert MonthlyAttendance
                    ---------------------------------------------------------
                    DECLARE proc_cursor CURSOR LOCAL FOR
                        SELECT ID, HasAttendance, AttendanceTime, DepartureTime, DelayAllowance
                        FROM #Employees;

                    OPEN proc_cursor;
                    FETCH NEXT FROM proc_cursor INTO @EmpId, @HasAttendance, @AttendanceTimeStr, @DepartureTimeStr, @DelayAllowance;

                    WHILE @@FETCH_STATUS = 0
                    BEGIN
                        -- If HasAttendance false skip processing (matches C# filter)
                        IF @HasAttendance = 1
                        BEGIN
                            -- parse attendance/departure to TIME and calculate required durations
                            DECLARE @AttendanceTime TIME = TRY_CAST(@AttendanceTimeStr AS TIME);
                            DECLARE @DepartureTime TIME = TRY_CAST(@DepartureTimeStr AS TIME);

                            -- if any parse fails, continue to next employee (we validated earlier so should not happen)
                            IF @AttendanceTime IS NULL OR @DepartureTime IS NULL
                            BEGIN
                                FETCH NEXT FROM proc_cursor INTO @EmpId, @HasAttendance, @AttendanceTimeStr, @DepartureTimeStr, @DelayAllowance;
                                CONTINUE;
                            END

                            DECLARE @FullDayMinutes INT = DATEDIFF(MINUTE, @AttendanceTime, @DepartureTime); -- could be negative if bad data
                            IF @FullDayMinutes < 0 SET @FullDayMinutes = 0;
                            DECLARE @HalfDayMinutes INT = (@FullDayMinutes / 2);

                            DECLARE @AllowedStart TIME = DATEADD(MINUTE, ISNULL(@DelayAllowance,0), @AttendanceTime);

                            DECLARE @Day DATE = @PeriodStart;

                            WHILE @Day <= @PeriodEnd
                            BEGIN
                                DECLARE @DayStatusId INT = NULL;
                                DECLARE @OvertimeHours INT = 0, @OvertimeMinutes INT = 0;
                                DECLARE @DeductionHours INT = 0, @DeductionMinutes INT = 0;
                                DECLARE @WorkingHours INT = 0, @WorkingMinutes INT = 0;
                                DECLARE @LeaveRequestHours INT = 0, @LeaveRequestMinutes INT = 0;

                                -- Determine if this is a working day for the employee
                                DECLARE @IsWorkingDay BIT = 0;
                                IF EXISTS (
                                    SELECT 1
                                    FROM EmployeeDays ED
                                    INNER JOIN Days D ON ED.DayID = D.ID
                                    WHERE ED.EmployeeID = @EmpId
                                        AND (ED.IsDeleted IS NULL OR ED.IsDeleted != 1)
                                        AND D.Name = DATENAME(WEEKDAY, @Day)
                                )
                                BEGIN
                                    SET @IsWorkingDay = 1;
                                END

                                -- Official holiday?
                                IF EXISTS (SELECT 1 FROM OfficialHolidays OH WHERE OH.DateFrom <= @Day AND OH.DateTo >= @Day)
                                BEGIN
                                    SET @DayStatusId = 4; -- Official holiday
                                    -- Calculate worked minutes that day (sum of clock intervals)
                                    DECLARE @WorkedMinsHoliday INT = (
                                        SELECT ISNULL(SUM(DATEDIFF(MINUTE, ClockIn, ClockOut)),0)
                                        FROM EmployeeClocks EC
                                        WHERE EC.EmployeeID = @EmpId
                                            AND EC.Date = @Day
                                            AND (EC.IsDeleted IS NULL OR EC.IsDeleted != 1)
                                            AND EC.ClockIn IS NOT NULL AND EC.ClockOut IS NOT NULL
                                    );

                                    IF @WorkedMinsHoliday > 0
                                    BEGIN
                                        SET @OvertimeHours = @WorkedMinsHoliday / 60;
                                        SET @OvertimeMinutes = @WorkedMinsHoliday % 60;
                                    END
                                END
                                ELSE IF @IsWorkingDay = 1
                                BEGIN
                                    -- Check vacation (half or full)
                                    DECLARE @VacationHalfDay BIT = NULL;
                                    SELECT TOP (1) @VacationHalfDay = HalfDay
                                    FROM VacationEmployee V
                                    WHERE V.EmployeeID = @EmpId
                                        AND (
                                            (V.HalfDay = 1 AND V.DateFrom = @Day) -- half-day only exact
                                            OR (V.HalfDay = 0 AND @Day BETWEEN V.DateFrom AND V.DateTo)
                                            );

                                    IF @VacationHalfDay = 1
                                    BEGIN
                                        -- half day vacation
                                        SET @DayStatusId = 3;

                                        -- total worked minutes from clocks
                                        DECLARE @WorkedMinsHalf INT = (
                                            SELECT ISNULL(SUM(DATEDIFF(MINUTE, ClockIn, ClockOut)),0)
                                            FROM EmployeeClocks EC
                                            WHERE EC.EmployeeID = @EmpId
                                                AND EC.Date = @Day
                                                AND (EC.IsDeleted IS NULL OR EC.IsDeleted != 1)
                                                AND EC.ClockIn IS NOT NULL AND EC.ClockOut IS NOT NULL
                                        );

                                        -- leave requests minutes for that day
                                        DECLARE @LeaveReqMinsHalf INT = (
                                            SELECT ISNULL(SUM(ISNULL(Hours,0) * 60 + ISNULL(Minutes,0)), 0)
                                            FROM LeaveRequest LR
                                            WHERE LR.EmployeeID = @EmpId AND LR.Date = @Day AND (LR.IsDeleted IS NULL OR LR.IsDeleted != 1)
                                        );

                                        -- required work minutes for half day = halfDayMinutes - leaveReq
                                        DECLARE @RequiredWorkHalf INT = CASE WHEN @HalfDayMinutes - @LeaveReqMinsHalf > 0 THEN @HalfDayMinutes - @LeaveReqMinsHalf ELSE 0 END;

                                        -- store leave request breakdown for insertion
                                        SET @LeaveRequestHours = @LeaveReqMinsHalf / 60;
                                        SET @LeaveRequestMinutes = @LeaveReqMinsHalf % 60;

                                        -- determine overtime or deduction
                                        IF @WorkedMinsHalf >= @RequiredWorkHalf
                                        BEGIN
                                            DECLARE @OvertimeMinsHalf INT = @WorkedMinsHalf - @RequiredWorkHalf;
                                            IF @OvertimeMinsHalf >= ISNULL(@OvertimeStartAfterMinutes,0)
                                            BEGIN
                                                SET @OvertimeHours = @OvertimeMinsHalf / 60;
                                                SET @OvertimeMinutes = @OvertimeMinsHalf % 60;
                                            END
                                            -- working hours recorded as workedMinsHalf
                                            SET @WorkingHours = @WorkedMinsHalf / 60;
                                            SET @WorkingMinutes = @WorkedMinsHalf % 60;
                                        END
                                        ELSE
                                        BEGIN
                                            -- Allow delay allowance when checking for deduction
                                            DECLARE @WorkedPlusDelayMins INT = @WorkedMinsHalf + ISNULL(@DelayAllowance,0);
                                            IF @WorkedPlusDelayMins < @RequiredWorkHalf
                                            BEGIN
                                                DECLARE @DeductionMinsHalf INT = @RequiredWorkHalf - @WorkedMinsHalf;
                                                SET @DeductionHours = @DeductionMinsHalf / 60;
                                                SET @DeductionMinutes = @DeductionMinsHalf % 60;
                                            END
                                            SET @WorkingHours = @WorkedMinsHalf / 60;
                                            SET @WorkingMinutes = @WorkedMinsHalf % 60;
                                        END
                                    END
                                    ELSE IF @VacationHalfDay = 0
                                    BEGIN
                                        -- Full vacation (no deduction) -> but overtime counts if worked
                                        SET @DayStatusId = 3;

                                        DECLARE @WorkedMinsVac INT = (
                                            SELECT ISNULL(SUM(DATEDIFF(MINUTE, ClockIn, ClockOut)),0)
                                            FROM EmployeeClocks EC
                                            WHERE EC.EmployeeID = @EmpId
                                                AND EC.Date = @Day
                                                AND (EC.IsDeleted IS NULL OR EC.IsDeleted != 1)
                                                AND EC.ClockIn IS NOT NULL AND EC.ClockOut IS NOT NULL
                                        );

                                        IF @WorkedMinsVac > 0
                                        BEGIN
                                            SET @OvertimeHours = @WorkedMinsVac / 60;
                                            SET @OvertimeMinutes = @WorkedMinsVac % 60;
                                        END
                                    END
                                    ELSE
                                    BEGIN
                                        -- Regular working day (employee should be present)
                                        -- Sum all clock intervals for that day
                                        DECLARE @WorkedMins INT = (
                                            SELECT ISNULL(SUM(DATEDIFF(MINUTE, ClockIn, ClockOut)),0)
                                            FROM EmployeeClocks EC
                                            WHERE EC.EmployeeID = @EmpId
                                                AND EC.Date = @Day
                                                AND (EC.IsDeleted IS NULL OR EC.IsDeleted != 1)
                                                AND EC.ClockIn IS NOT NULL AND EC.ClockOut IS NOT NULL
                                        );

                                        IF @WorkedMins > 0
                                        BEGIN
                                            -- Check any leave requests
                                            DECLARE @LeaveReqMins INT = (
                                                SELECT ISNULL(SUM(ISNULL(Hours,0) * 60 + ISNULL(Minutes,0)), 0)
                                                FROM LeaveRequest LR
                                                WHERE LR.EmployeeID = @EmpId AND LR.Date = @Day AND (LR.IsDeleted IS NULL OR LR.IsDeleted != 1)
                                            );

                                            IF @LeaveReqMins > 0
                                            BEGIN
                                                -- required work = fullDayMinutes - leaveReq
                                                DECLARE @RequiredWorkFromLeave INT = CASE WHEN (@FullDayMinutes - @LeaveReqMins) > 0 THEN @FullDayMinutes - @LeaveReqMins ELSE 0 END;

                                                SET @LeaveRequestHours = @LeaveReqMins / 60;
                                                SET @LeaveRequestMinutes = @LeaveReqMins % 60;

                                                IF @WorkedMins < @RequiredWorkFromLeave
                                                BEGIN
                                                    DECLARE @DiffMins INT = @RequiredWorkFromLeave - @WorkedMins;
                                                    SET @DeductionHours = @DiffMins / 60;
                                                    SET @DeductionMinutes = @DiffMins % 60;
                                                END
                                                ELSE
                                                BEGIN
                                                    DECLARE @OvertimeMins INT = @WorkedMins - @RequiredWorkFromLeave;
                                                    IF @OvertimeMins >= ISNULL(@OvertimeStartAfterMinutes,0)
                                                    BEGIN
                                                        SET @OvertimeHours = @OvertimeMins / 60;
                                                        SET @OvertimeMinutes = @OvertimeMins % 60;
                                                    END
                                                END

                                                SET @DayStatusId = 1;
                                                SET @WorkingHours = @WorkedMins / 60;
                                                SET @WorkingMinutes = @WorkedMins % 60;
                                            END
                                            ELSE
                                            BEGIN
                                                -- No leave requests: check first clock-in for lateness
                                                DECLARE @FirstClockIn DATETIME = (
                                                    SELECT TOP (1) ClockIn
                                                    FROM EmployeeClocks EC
                                                    WHERE EC.EmployeeID = @EmpId
                                                        AND EC.Date = @Day
                                                        AND (EC.IsDeleted IS NULL OR EC.IsDeleted != 1)
                                                        AND EC.ClockIn IS NOT NULL
                                                    ORDER BY EC.ClockIn
                                                );

                                                DECLARE @LateMins DECIMAL(10,2) = 0;
                                                IF @FirstClockIn IS NOT NULL
                                                BEGIN
                                                    DECLARE @ActualStart TIME = CAST(@FirstClockIn AS TIME);

                                                    IF @ActualStart > @AllowedStart
                                                    BEGIN
                                                        -- Late beyond allowed: deduction equals actualStart - AttendanceTime
                                                        SET @LateMins = DATEDIFF(MINUTE, @AttendanceTime, @ActualStart);
                                                        SET @DeductionHours = FLOOR(@LateMins / 60.0);
                                                        SET @DeductionMinutes = CAST(@LateMins % 60 AS INT);
                                                    END
                                                    ELSE IF @ActualStart > @AttendanceTime AND @ActualStart < @AllowedStart
                                                    BEGIN
                                                        -- Between attendance and allowed start: count late minutes but not deduction (reduces required work)
                                                        SET @LateMins = DATEDIFF(MINUTE, @AttendanceTime, @ActualStart);
                                                    END
                                                END

                                                DECLARE @RequiredWorkMins INT = CASE WHEN (@FullDayMinutes - CONVERT(INT,@LateMins)) > 0 THEN @FullDayMinutes - CONVERT(INT,@LateMins) ELSE 0 END;

                                                IF @WorkedMins < @RequiredWorkMins
                                                BEGIN
                                                    DECLARE @Diff2 INT = @RequiredWorkMins - @WorkedMins;
                                                    -- add to previous deduction (if any)
                                                    SET @DeductionHours = @DeductionHours + (@Diff2 / 60);
                                                    SET @DeductionMinutes = @DeductionMinutes + (@Diff2 % 60);
                                                    -- normalize minutes -> hours
                                                    IF @DeductionMinutes >= 60
                                                    BEGIN
                                                        SET @DeductionHours = @DeductionHours + (@DeductionMinutes / 60);
                                                        SET @DeductionMinutes = @DeductionMinutes % 60;
                                                    END
                                                END
                                                ELSE
                                                BEGIN
                                                    DECLARE @OvertimeMins2 INT = @WorkedMins - @RequiredWorkMins;
                                                    IF @OvertimeMins2 >= ISNULL(@OvertimeStartAfterMinutes,0)
                                                    BEGIN
                                                        SET @OvertimeHours = @OvertimeMins2 / 60;
                                                        SET @OvertimeMinutes = @OvertimeMins2 % 60;
                                                    END
                                                END

                                                SET @DayStatusId = 1;
                                                SET @WorkingHours = @WorkedMins / 60;
                                                SET @WorkingMinutes = @WorkedMins % 60;
                                            END
                                        END
                                        ELSE
                                        BEGIN
                                            -- No clocks for a working day -> Absent
                                            SET @DayStatusId = 2;
                                        END
                                    END
                                END
                                ELSE
                                BEGIN
                                    -- Not a working day -> weekend
                                    SET @DayStatusId = 5;

                                    -- Check if employee worked on weekend (overtime)
                                    DECLARE @WorkedMinsWeekend INT = (
                                        SELECT ISNULL(SUM(DATEDIFF(MINUTE, ClockIn, ClockOut)),0)
                                        FROM EmployeeClocks EC
                                        WHERE EC.EmployeeID = @EmpId
                                            AND EC.Date = @Day
                                            AND (EC.IsDeleted IS NULL OR EC.IsDeleted != 1)
                                            AND EC.ClockIn IS NOT NULL AND EC.ClockOut IS NOT NULL
                                    );

                                    IF @WorkedMinsWeekend > 0
                                    BEGIN
                                        SET @OvertimeHours = @WorkedMinsWeekend / 60;
                                        SET @OvertimeMinutes = @WorkedMinsWeekend % 60;
                                    END
                                END

                                -- final normalization for deduction minutes (in case we accumulated minutes > 59)
                                IF @DeductionMinutes >= 60
                                BEGIN
                                    SET @DeductionHours = @DeductionHours + (@DeductionMinutes / 60);
                                    SET @DeductionMinutes = @DeductionMinutes % 60;
                                END

                                -- final normalization for overtime minutes
                                IF @OvertimeMinutes >= 60
                                BEGIN
                                    SET @OvertimeHours = @OvertimeHours + (@OvertimeMinutes / 60);
                                    SET @OvertimeMinutes = @OvertimeMinutes % 60;
                                END

                                -- Insert MonthlyAttendance (columns follow your C# entity names)
                                INSERT INTO MonthlyAttendance
                                (
                                    EmployeeId, Day, DayStatusId,
                                    WorkingHours, WorkingMinutes,
                                    DeductionHours, DeductionMinutes,
                                    OvertimeHours, OvertimeMinutes,
                                    LeaveRequestHours, LeaveRequestMinutes
                                )
                                VALUES
                                (
                                    @EmpId, @Day, @DayStatusId,
                                    @WorkingHours, @WorkingMinutes,
                                    @DeductionHours, @DeductionMinutes,
                                    @OvertimeHours, @OvertimeMinutes,
                                    @LeaveRequestHours, @LeaveRequestMinutes
                                );

                                SET @Day = DATEADD(DAY, 1, @Day);
                            END -- day loop
                        END -- if has attendance

                        FETCH NEXT FROM proc_cursor INTO @EmpId, @HasAttendance, @AttendanceTimeStr, @DepartureTimeStr, @DelayAllowance;
                    END -- emp loop

                    CLOSE proc_cursor;
                    DEALLOCATE proc_cursor;

                    ---------------------------------------------------------
                    -- 7. Generate salary history (calls your existing SP)
                    ---------------------------------------------------------
                    -- If your salary SP expects EmployeeId parameter you can pass 0 to compute all

	                IF @EmployeeId = 0
	                BEGIN
		                EXEC dbo.GenerateSalaryHistoryM 
			                @Month = @Month, 
			                @Year = @Year, 
			                @EmployeeId = 0;
	                END
	                ELSE
	                BEGIN
		                EXEC dbo.GenerateSalaryHistoryM 
			                @Month = @Month, 
			                @Year = @Year, 
			                @EmployeeId = @EmployeeId;
	                END
                    ---------------------------------------------------------
                    -- 8. Cleanup temp table
                    ---------------------------------------------------------
                    IF OBJECT_ID('tempdb..#Employees') IS NOT NULL
                        DROP TABLE #Employees;

                    -- Done
                    SELECT 'Monthly attendance created and salary history generated.' AS Message;
                END
                GO

            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.GenerateSalaryHistoryM");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS dbo.AddAllMonthlyAttendance");
        }
    }
}