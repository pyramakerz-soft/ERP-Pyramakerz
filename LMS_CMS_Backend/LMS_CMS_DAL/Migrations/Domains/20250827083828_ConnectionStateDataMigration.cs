using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ConnectionStateDataMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO ConnectionStatus (En_Title, Ar_Title)
                    VALUES ('Online', 'متصل'),
                           ('Offline', 'غير متصل'),
                           ('Busy', 'مشغول');
            ");

            // Set default ConnectionStatus to 'Online' for all existing users
            migrationBuilder.Sql(@"
                UPDATE Employee
                SET ConnectionStatusID = 1
                WHERE ConnectionStatusID IS NULL;

                UPDATE Parent
                SET ConnectionStatusID = 1
                WHERE ConnectionStatusID IS NULL;

                UPDATE Student
                SET ConnectionStatusID = 1
                WHERE ConnectionStatusID IS NULL;
            ");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Employee
                SET ConnectionStatusID = NULL
                WHERE ConnectionStatusID = 1;

                UPDATE Parent
                SET ConnectionStatusID = NULL
                WHERE ConnectionStatusID = 1;

                UPDATE Student
                SET ConnectionStatusID = NULL
                WHERE ConnectionStatusID = 1;
            ");

            migrationBuilder.Sql("DELETE FROM Page WHERE ID BETWEEN 1 AND 3;");
        }
    }
}
