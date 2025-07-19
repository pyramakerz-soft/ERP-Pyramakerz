using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class UserTypesInsertMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO UserType (ID, Title) VALUES (1, 'employee');
                INSERT INTO UserType (ID, Title) VALUES (2, 'student');
                INSERT INTO UserType (ID, Title) VALUES (3, 'parent'); 
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM AcademicDegrees  WHERE ID IN (1, 2, 3);
            ");
        }
    }
}
