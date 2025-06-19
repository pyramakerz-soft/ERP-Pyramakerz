using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AddDataInAssignmentTypeMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO AssignmentType (ID, EnglishName, ArabicName) VALUES (1, 'Textbook Assignment', N'واجبات الكتاب المدرسي');
                INSERT INTO AssignmentType (ID, EnglishName, ArabicName) VALUES (2, 'Fixed Question Assignment', N'تعيين سؤال ثابت');
                INSERT INTO AssignmentType (ID, EnglishName, ArabicName) VALUES (3, 'Randomized Question Assignment', N'تعيين أسئلة عشوائية');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM AssignmentType  WHERE ID IN (1, 2, 3);
            ");
        }
    }
}
