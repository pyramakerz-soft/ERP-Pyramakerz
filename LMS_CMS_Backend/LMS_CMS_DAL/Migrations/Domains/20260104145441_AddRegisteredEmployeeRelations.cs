using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AddRegisteredEmployeeRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CandidateSubmits");

            migrationBuilder.DropIndex(
                name: "IX_RegisteredEmployee_User_Name",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "User_Name",
                table: "RegisteredEmployee");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "RegisteredEmployee",
                newName: "faculty");

            migrationBuilder.RenameColumn(
                name: "Address",
                table: "RegisteredEmployee",
                newName: "YourLevelInFrensh");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApplicationDate",
                table: "RegisteredEmployee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "AuthorizeInvestigation",
                table: "RegisteredEmployee",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "BirthdayDate",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComputerSkills",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CurrentAddress",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentJob",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "DepartmentID",
                table: "RegisteredEmployee",
                type: "bigint",
              nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DidYouHaveAnyRelativeHere",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DoYouSpeakAnyOtherLanguages",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "EnterDate",
                table: "RegisteredEmployee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "FromDate",
                table: "RegisteredEmployee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "GraduationYear",
                table: "RegisteredEmployee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Hobbies",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HowDidYouFindUs",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "InterviewStateID",
                table: "RegisteredEmployee",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsHRScreened",
                table: "RegisteredEmployee",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "LastSalary",
                table: "RegisteredEmployee",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Major",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MaritalStatus",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "Nationality",
                table: "RegisteredEmployee",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherStudies",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PassportAddress",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PassportNumber",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PositionAppliedFor",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreviousExperiencePlace",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ReasonforLeavingtheJob",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SchoolYouGraduatedFrom",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "ToDate",
                table: "RegisteredEmployee",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "University",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "YourLevelInEnglish",
                table: "RegisteredEmployee",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_RegisteredEmployee_DepartmentID",
                table: "RegisteredEmployee",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_RegisteredEmployee_InterviewStateID",
                table: "RegisteredEmployee",
                column: "InterviewStateID");

            migrationBuilder.AddForeignKey(
                name: "FK_RegisteredEmployee_Departments_DepartmentID",
                table: "RegisteredEmployee",
                column: "DepartmentID",
                principalTable: "Departments",
                principalColumn: "ID",
               onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_RegisteredEmployee_InterViewState_InterviewStateID",
                table: "RegisteredEmployee",
                column: "InterviewStateID",
                principalTable: "InterViewState",
                principalColumn: "ID",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegisteredEmployee_Departments_DepartmentID",
                table: "RegisteredEmployee");

            migrationBuilder.DropForeignKey(
                name: "FK_RegisteredEmployee_InterViewState_InterviewStateID",
                table: "RegisteredEmployee");

            migrationBuilder.DropIndex(
                name: "IX_RegisteredEmployee_DepartmentID",
                table: "RegisteredEmployee");

            migrationBuilder.DropIndex(
                name: "IX_RegisteredEmployee_InterviewStateID",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "ApplicationDate",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "AuthorizeInvestigation",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "BirthdayDate",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Comment",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "ComputerSkills",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "CurrentAddress",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "CurrentJob",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "DepartmentID",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "DidYouHaveAnyRelativeHere",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "DoYouSpeakAnyOtherLanguages",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "EnterDate",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "FromDate",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "GraduationYear",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Hobbies",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "HowDidYouFindUs",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "InterviewStateID",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "IsHRScreened",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "LastSalary",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Major",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "MaritalStatus",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "OtherStudies",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "PassportAddress",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "PassportNumber",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "PositionAppliedFor",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "PreviousExperiencePlace",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "ReasonforLeavingtheJob",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "SchoolYouGraduatedFrom",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "ToDate",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "University",
                table: "RegisteredEmployee");

            migrationBuilder.DropColumn(
                name: "YourLevelInEnglish",
                table: "RegisteredEmployee");

            migrationBuilder.RenameColumn(
                name: "faculty",
                table: "RegisteredEmployee",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "YourLevelInFrensh",
                table: "RegisteredEmployee",
                newName: "Address");

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "RegisteredEmployee",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "User_Name",
                table: "RegisteredEmployee",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "CandidateSubmits",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DepartmentID = table.Column<long>(type: "bigint", nullable: false),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    ApplicationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    IsHRScreened = table.Column<bool>(type: "bit", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PositionAppliedFor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    ar_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    en_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateSubmits", x => x.ID);
                    table.ForeignKey(
                        name: "FK_CandidateSubmits_Departments_DepartmentID",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateSubmits_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CandidateSubmits_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CandidateSubmits_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CandidateSubmits_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RegisteredEmployee_User_Name",
                table: "RegisteredEmployee",
                column: "User_Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmit_ApplicationDate",
                table: "CandidateSubmits",
                column: "ApplicationDate");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmit_DepartmentID",
                table: "CandidateSubmits",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmit_Email_Unique",
                table: "CandidateSubmits",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmit_Status",
                table: "CandidateSubmits",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmits_DeletedByUserId",
                table: "CandidateSubmits",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmits_EmployeeID",
                table: "CandidateSubmits",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmits_InsertedByUserId",
                table: "CandidateSubmits",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateSubmits_UpdatedByUserId",
                table: "CandidateSubmits",
                column: "UpdatedByUserId");
        }
    }
}
