using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class IndexAY : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "IX_AcademicYear_SchoolID",
                table: "AcademicYear",
                newName: "IX_AcademicYear_SchoolID_New");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "IX_AcademicYear_SchoolID_New",
                table: "AcademicYear",
                newName: "IX_AcademicYear_SchoolID");
        }
    }
}
