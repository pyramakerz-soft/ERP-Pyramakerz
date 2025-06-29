using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DailyPerformanceMster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyPerformance_Subject_SubjectID",
                table: "DailyPerformance");

            migrationBuilder.RenameColumn(
                name: "SubjectID",
                table: "DailyPerformance",
                newName: "DailyPerformanceMasterID");

            migrationBuilder.RenameIndex(
                name: "IX_DailyPerformance_SubjectID",
                table: "DailyPerformance",
                newName: "IX_DailyPerformance_DailyPerformanceMasterID");

            migrationBuilder.CreateTable(
                name: "DailyPerformanceMaster",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubjectID = table.Column<long>(type: "bigint", nullable: false),
                    ClassroomID = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyPerformanceMaster", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DailyPerformanceMaster_Classroom_ClassroomID",
                        column: x => x.ClassroomID,
                        principalTable: "Classroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyPerformanceMaster_Subject_SubjectID",
                        column: x => x.SubjectID,
                        principalTable: "Subject",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyPerformanceMaster_ClassroomID",
                table: "DailyPerformanceMaster",
                column: "ClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_DailyPerformanceMaster_SubjectID",
                table: "DailyPerformanceMaster",
                column: "SubjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyPerformance_DailyPerformanceMaster_DailyPerformanceMasterID",
                table: "DailyPerformance",
                column: "DailyPerformanceMasterID",
                principalTable: "DailyPerformanceMaster",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyPerformance_DailyPerformanceMaster_DailyPerformanceMasterID",
                table: "DailyPerformance");

            migrationBuilder.DropTable(
                name: "DailyPerformanceMaster");

            migrationBuilder.RenameColumn(
                name: "DailyPerformanceMasterID",
                table: "DailyPerformance",
                newName: "SubjectID");

            migrationBuilder.RenameIndex(
                name: "IX_DailyPerformance_DailyPerformanceMasterID",
                table: "DailyPerformance",
                newName: "IX_DailyPerformance_SubjectID");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyPerformance_Subject_SubjectID",
                table: "DailyPerformance",
                column: "SubjectID",
                principalTable: "Subject",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
