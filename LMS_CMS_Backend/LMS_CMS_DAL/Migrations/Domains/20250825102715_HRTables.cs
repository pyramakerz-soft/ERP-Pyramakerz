using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class HRTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BounsType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BounsType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DeductionType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeductionType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "LeaveRequest",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    Minutes = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRequest", x => x.ID);
                    table.ForeignKey(
                        name: "FK_LeaveRequest_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRequest_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRequest_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_LeaveRequest_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Loans",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    DeductionStartMonth = table.Column<DateOnly>(type: "date", nullable: false),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    NumberOfDeduction = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    SafeID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Loans", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Loans_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Loans_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Loans_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Loans_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Loans_Saves_SafeID",
                        column: x => x.SafeID,
                        principalTable: "Saves",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OfficialHolidays",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DateFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    DateTo = table.Column<DateOnly>(type: "date", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfficialHolidays", x => x.ID);
                    table.ForeignKey(
                        name: "FK_OfficialHolidays_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_OfficialHolidays_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_OfficialHolidays_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "VacationTypes",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacationTypes", x => x.ID);
                    table.ForeignKey(
                        name: "FK_VacationTypes_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_VacationTypes_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_VacationTypes_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Bouns",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    NumberOfBounsDays = table.Column<int>(type: "int", nullable: false),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    Minutes = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    BounsTypeID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bouns", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Bouns_BounsType_BounsTypeID",
                        column: x => x.BounsTypeID,
                        principalTable: "BounsType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Bouns_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Deduction",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    NumberOfDeductionDays = table.Column<int>(type: "int", nullable: false),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    Minutes = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<long>(type: "bigint", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    DeductionTypeID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deduction", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Deduction_DeductionType_DeductionTypeID",
                        column: x => x.DeductionTypeID,
                        principalTable: "DeductionType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deduction_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deduction_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Deduction_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Deduction_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "EmployeeVacationCount",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ballance = table.Column<int>(type: "int", nullable: false),
                    Used = table.Column<int>(type: "int", nullable: false),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    VacationTypesID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeVacationCount", x => x.ID);
                    table.ForeignKey(
                        name: "FK_EmployeeVacationCount_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeVacationCount_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeVacationCount_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_EmployeeVacationCount_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_EmployeeVacationCount_VacationTypes_VacationTypesID",
                        column: x => x.VacationTypesID,
                        principalTable: "VacationTypes",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VacationEmployee",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HalfDay = table.Column<bool>(type: "bit", nullable: false),
                    DateFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    DateTo = table.Column<DateOnly>(type: "date", nullable: true),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
                    VacationTypesID = table.Column<long>(type: "bigint", nullable: false),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacationEmployee", x => x.ID);
                    table.ForeignKey(
                        name: "FK_VacationEmployee_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VacationEmployee_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VacationEmployee_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_VacationEmployee_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_VacationEmployee_VacationTypes_VacationTypesID",
                        column: x => x.VacationTypesID,
                        principalTable: "VacationTypes",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_BounsTypeID",
                table: "Bouns",
                column: "BounsTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_DeletedByUserId",
                table: "Bouns",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_EmployeeID",
                table: "Bouns",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_InsertedByUserId",
                table: "Bouns",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Bouns_UpdatedByUserId",
                table: "Bouns",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Deduction_DeductionTypeID",
                table: "Deduction",
                column: "DeductionTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Deduction_DeletedByUserId",
                table: "Deduction",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Deduction_EmployeeID",
                table: "Deduction",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Deduction_InsertedByUserId",
                table: "Deduction",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Deduction_UpdatedByUserId",
                table: "Deduction",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeVacationCount_DeletedByUserId",
                table: "EmployeeVacationCount",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeVacationCount_EmployeeID",
                table: "EmployeeVacationCount",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeVacationCount_InsertedByUserId",
                table: "EmployeeVacationCount",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeVacationCount_UpdatedByUserId",
                table: "EmployeeVacationCount",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeVacationCount_VacationTypesID",
                table: "EmployeeVacationCount",
                column: "VacationTypesID");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequest_DeletedByUserId",
                table: "LeaveRequest",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequest_EmployeeID",
                table: "LeaveRequest",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequest_InsertedByUserId",
                table: "LeaveRequest",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequest_UpdatedByUserId",
                table: "LeaveRequest",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_DeletedByUserId",
                table: "Loans",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_EmployeeID",
                table: "Loans",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_InsertedByUserId",
                table: "Loans",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_SafeID",
                table: "Loans",
                column: "SafeID");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_UpdatedByUserId",
                table: "Loans",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialHolidays_DeletedByUserId",
                table: "OfficialHolidays",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialHolidays_InsertedByUserId",
                table: "OfficialHolidays",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_OfficialHolidays_UpdatedByUserId",
                table: "OfficialHolidays",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VacationEmployee_DeletedByUserId",
                table: "VacationEmployee",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VacationEmployee_EmployeeID",
                table: "VacationEmployee",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_VacationEmployee_InsertedByUserId",
                table: "VacationEmployee",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VacationEmployee_UpdatedByUserId",
                table: "VacationEmployee",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VacationEmployee_VacationTypesID",
                table: "VacationEmployee",
                column: "VacationTypesID");

            migrationBuilder.CreateIndex(
                name: "IX_VacationTypes_DeletedByUserId",
                table: "VacationTypes",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VacationTypes_InsertedByUserId",
                table: "VacationTypes",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_VacationTypes_UpdatedByUserId",
                table: "VacationTypes",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bouns");

            migrationBuilder.DropTable(
                name: "Deduction");

            migrationBuilder.DropTable(
                name: "EmployeeVacationCount");

            migrationBuilder.DropTable(
                name: "LeaveRequest");

            migrationBuilder.DropTable(
                name: "Loans");

            migrationBuilder.DropTable(
                name: "OfficialHolidays");

            migrationBuilder.DropTable(
                name: "VacationEmployee");

            migrationBuilder.DropTable(
                name: "BounsType");

            migrationBuilder.DropTable(
                name: "DeductionType");

            migrationBuilder.DropTable(
                name: "VacationTypes");

        }
    }
}
