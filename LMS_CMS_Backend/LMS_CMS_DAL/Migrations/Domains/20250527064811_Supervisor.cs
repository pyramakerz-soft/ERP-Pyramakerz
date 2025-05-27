using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class Supervisor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GradeSupervisor",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GradeID = table.Column<long>(type: "bigint", nullable: false),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GradeSupervisor", x => x.ID);
                    table.ForeignKey(
                        name: "FK_GradeSupervisor_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GradeSupervisor_Grade_GradeID",
                        column: x => x.GradeID,
                        principalTable: "Grade",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubjectSupervisor",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectSupervisor", x => x.ID);
                    table.ForeignKey(
                        name: "FK_SubjectSupervisor_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubjectSupervisor_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GradeSupervisor_EmployeeID",
                table: "GradeSupervisor",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_GradeSupervisor_GradeID",
                table: "GradeSupervisor",
                column: "GradeID");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectSupervisor_EmployeeID",
                table: "SubjectSupervisor",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectSupervisor_SubjectID",
                table: "SubjectSupervisor",
                column: "SubjectID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GradeSupervisor");

            migrationBuilder.DropTable(
                name: "SubjectSupervisor");
        }
    }
}
