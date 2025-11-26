using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class UpdatingEntriesFunAndAccEntriesScripts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsConvertedToPurchase",
                table: "InventoryMaster");

            migrationBuilder.RenameIndex(
                name: "IX_TimeTable_AcademicYearID",
                table: "TimeTable",
                newName: "IX_TimeTable_AcademicYearID_New");

            migrationBuilder.RenameIndex(
                name: "IX_Subject_GradeID",
                table: "Subject",
                newName: "IX_Subject_GradeID_New");

            migrationBuilder.RenameIndex(
                name: "IX_RemedialTimeTable_AcademicYearID",
                table: "RemedialTimeTable",
                newName: "IX_RemedialTimeTable_AcademicYearID_New");

            migrationBuilder.RenameIndex(
                name: "IX_Grade_SectionID",
                table: "Grade",
                newName: "IX_Grade_SectionID_New");

            migrationBuilder.RenameIndex(
                name: "IX_Floor_buildingID",
                table: "Floor",
                newName: "IX_Floor_buildingID_New");

            migrationBuilder.RenameIndex(
                name: "IX_Classroom_GradeID",
                table: "Classroom",
                newName: "IX_Classroom_GradeID_New");

            migrationBuilder.RenameIndex(
                name: "IX_Classroom_AcademicYearID",
                table: "Classroom",
                newName: "IX_Classroom_AcademicYearID_New");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "IX_TimeTable_AcademicYearID_New",
                table: "TimeTable",
                newName: "IX_TimeTable_AcademicYearID");

            migrationBuilder.RenameIndex(
                name: "IX_Subject_GradeID_New",
                table: "Subject",
                newName: "IX_Subject_GradeID");

            migrationBuilder.RenameIndex(
                name: "IX_RemedialTimeTable_AcademicYearID_New",
                table: "RemedialTimeTable",
                newName: "IX_RemedialTimeTable_AcademicYearID");

            migrationBuilder.RenameIndex(
                name: "IX_Grade_SectionID_New",
                table: "Grade",
                newName: "IX_Grade_SectionID");

            migrationBuilder.RenameIndex(
                name: "IX_Floor_buildingID_New",
                table: "Floor",
                newName: "IX_Floor_buildingID");

            migrationBuilder.RenameIndex(
                name: "IX_Classroom_GradeID_New",
                table: "Classroom",
                newName: "IX_Classroom_GradeID");

            migrationBuilder.RenameIndex(
                name: "IX_Classroom_AcademicYearID_New",
                table: "Classroom",
                newName: "IX_Classroom_AcademicYearID");

            migrationBuilder.AddColumn<bool>(
                name: "IsConvertedToPurchase",
                table: "InventoryMaster",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
