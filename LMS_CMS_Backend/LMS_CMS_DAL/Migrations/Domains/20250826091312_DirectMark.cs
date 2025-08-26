using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DirectMark : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DirectMarkClassroomStudent");

            migrationBuilder.CreateTable(
                name: "DirectMark",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnglishName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ArabicName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Mark = table.Column<float>(type: "real", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
                    SubjectWeightTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_DirectMark", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DirectMark_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMark_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMark_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMark_SubjectWeightType_SubjectWeightTypeID",
                        column: x => x.SubjectWeightTypeID,
                        principalTable: "SubjectWeightType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectMark_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DirectMarkClasses",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DirectMarkID = table.Column<long>(type: "bigint", nullable: false),
                    ClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_DirectMarkClasses", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DirectMarkClasses_Classroom_ClassroomID",
                        column: x => x.ClassroomID,
                        principalTable: "Classroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectMarkClasses_DirectMark_DirectMarkID",
                        column: x => x.DirectMarkID,
                        principalTable: "DirectMark",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectMarkClasses_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClasses_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClasses_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "DirectMarkClassesStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Degree = table.Column<float>(type: "real", nullable: true),
                    DirectMarkID = table.Column<long>(type: "bigint", nullable: false),
                    StudentClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_DirectMarkClassesStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DirectMarkClassesStudent_DirectMark_DirectMarkID",
                        column: x => x.DirectMarkID,
                        principalTable: "DirectMark",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectMarkClassesStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassesStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassesStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassesStudent_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DirectMark_DeletedByUserId",
                table: "DirectMark",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMark_InsertedByUserId",
                table: "DirectMark",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMark_SubjectID",
                table: "DirectMark",
                column: "SubjectID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMark_SubjectWeightTypeID",
                table: "DirectMark",
                column: "SubjectWeightTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMark_UpdatedByUserId",
                table: "DirectMark",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClasses_ClassroomID",
                table: "DirectMarkClasses",
                column: "ClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClasses_DeletedByUserId",
                table: "DirectMarkClasses",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClasses_DirectMarkID",
                table: "DirectMarkClasses",
                column: "DirectMarkID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClasses_InsertedByUserId",
                table: "DirectMarkClasses",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClasses_UpdatedByUserId",
                table: "DirectMarkClasses",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassesStudent_DeletedByUserId",
                table: "DirectMarkClassesStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassesStudent_DirectMarkID",
                table: "DirectMarkClassesStudent",
                column: "DirectMarkID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassesStudent_InsertedByUserId",
                table: "DirectMarkClassesStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassesStudent_StudentClassroomID",
                table: "DirectMarkClassesStudent",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassesStudent_UpdatedByUserId",
                table: "DirectMarkClassesStudent",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DirectMarkClasses");

            migrationBuilder.DropTable(
                name: "DirectMarkClassesStudent");

            migrationBuilder.DropTable(
                name: "DirectMark");

            migrationBuilder.CreateTable(
                name: "DirectMarkClassroomStudent",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    StudentClassroomID = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    WeightTypeID = table.Column<long>(type: "bigint", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    Mark = table.Column<float>(type: "real", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectMarkClassroomStudent", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DirectMarkClassroomStudent_WeightType_WeightTypeID",
                        column: x => x.WeightTypeID,
                        principalTable: "WeightType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_DeletedByUserId",
                table: "DirectMarkClassroomStudent",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_InsertedByUserId",
                table: "DirectMarkClassroomStudent",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_StudentClassroomID",
                table: "DirectMarkClassroomStudent",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_UpdatedByUserId",
                table: "DirectMarkClassroomStudent",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DirectMarkClassroomStudent_WeightTypeID",
                table: "DirectMarkClassroomStudent",
                column: "WeightTypeID");
        }
    }
}
