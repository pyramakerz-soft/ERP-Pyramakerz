using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class SocialWorkerIssue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CertificateType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    File = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TopSpace = table.Column<int>(type: "int", nullable: false),
                    LefySpace = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_CertificateType", x => x.ID);
                    table.ForeignKey(
                        name: "FK_CertificateType_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CertificateType_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CertificateType_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "IssuesType",
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
                    table.PrimaryKey("PK_IssuesType", x => x.ID);
                    table.ForeignKey(
                        name: "FK_IssuesType_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_IssuesType_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_IssuesType_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "SocialWorkerMedal",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    File = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_SocialWorkerMedal", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedal_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedal_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedal_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "CertificateStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentID = table.Column<long>(type: "bigint", nullable: false),
                    CertificateTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_CertificateStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_CertificateStudent_CertificateType_CertificateTypeID",
                        column: x => x.CertificateTypeID,
                        principalTable: "CertificateType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CertificateStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CertificateStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CertificateStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_CertificateStudent_Student_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Student",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StudentIssue",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    StudentID = table.Column<long>(type: "bigint", nullable: false),
                    ClassroomID = table.Column<long>(type: "bigint", nullable: false),
                    IssuesTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_StudentIssue", x => x.ID);
                    table.ForeignKey(
                        name: "FK_StudentIssue_Classroom_ClassroomID",
                        column: x => x.ClassroomID,
                        principalTable: "Classroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentIssue_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StudentIssue_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StudentIssue_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_StudentIssue_IssuesType_IssuesTypeID",
                        column: x => x.IssuesTypeID,
                        principalTable: "IssuesType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentIssue_Student_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Student",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SocialWorkerMedalStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentID = table.Column<long>(type: "bigint", nullable: false),
                    SocialWorkerMedalID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_SocialWorkerMedalStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedalStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedalStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedalStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedalStudent_SocialWorkerMedal_SocialWorkerMedalID",
                        column: x => x.SocialWorkerMedalID,
                        principalTable: "SocialWorkerMedal",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SocialWorkerMedalStudent_Student_StudentID",
                        column: x => x.StudentID,
                        principalTable: "Student",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CertificateStudent_CertificateTypeID",
                table: "CertificateStudent",
                column: "CertificateTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateStudent_DeletedByUserId",
                table: "CertificateStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateStudent_InsertedByUserId",
                table: "CertificateStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateStudent_StudentID",
                table: "CertificateStudent",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateStudent_UpdatedByUserId",
                table: "CertificateStudent",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateType_DeletedByUserId",
                table: "CertificateType",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateType_InsertedByUserId",
                table: "CertificateType",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CertificateType_UpdatedByUserId",
                table: "CertificateType",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_IssuesType_DeletedByUserId",
                table: "IssuesType",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_IssuesType_InsertedByUserId",
                table: "IssuesType",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_IssuesType_UpdatedByUserId",
                table: "IssuesType",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedal_DeletedByUserId",
                table: "SocialWorkerMedal",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedal_InsertedByUserId",
                table: "SocialWorkerMedal",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedal_UpdatedByUserId",
                table: "SocialWorkerMedal",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedalStudent_DeletedByUserId",
                table: "SocialWorkerMedalStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedalStudent_InsertedByUserId",
                table: "SocialWorkerMedalStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedalStudent_SocialWorkerMedalID",
                table: "SocialWorkerMedalStudent",
                column: "SocialWorkerMedalID");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedalStudent_StudentID",
                table: "SocialWorkerMedalStudent",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_SocialWorkerMedalStudent_UpdatedByUserId",
                table: "SocialWorkerMedalStudent",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentIssue_ClassroomID",
                table: "StudentIssue",
                column: "ClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_StudentIssue_DeletedByUserId",
                table: "StudentIssue",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentIssue_InsertedByUserId",
                table: "StudentIssue",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentIssue_IssuesTypeID",
                table: "StudentIssue",
                column: "IssuesTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_StudentIssue_StudentID",
                table: "StudentIssue",
                column: "StudentID");

            migrationBuilder.CreateIndex(
                name: "IX_StudentIssue_UpdatedByUserId",
                table: "StudentIssue",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CertificateStudent");

            migrationBuilder.DropTable(
                name: "SocialWorkerMedalStudent");

            migrationBuilder.DropTable(
                name: "StudentIssue");

            migrationBuilder.DropTable(
                name: "CertificateType");

            migrationBuilder.DropTable(
                name: "SocialWorkerMedal");

            migrationBuilder.DropTable(
                name: "IssuesType");
        }
    }
}
