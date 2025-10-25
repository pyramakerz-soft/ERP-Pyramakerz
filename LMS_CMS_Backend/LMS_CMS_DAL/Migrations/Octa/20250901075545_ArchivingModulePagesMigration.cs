using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class ArchivingModulePagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 168;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 167;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 169;
            ");
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 151;
            ");

            migrationBuilder.Sql(@" 
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (328, 'Archiving Module', N'وحدة الأرشفة', 'Archiving', N'الأرشفة', NULL, 1),
                (329, 'Archiving', N'الأرشفة', 'Archiving', N'الأرشفة', 328, 1),
                (330, 'Permissions Groups', N'مجموعات الأذونات', 'Permissions Groups', N'مجموعات الأذونات', 328, 1),
                (331, 'Permissions Group Archiving', N'أرشفة مجموعة الأذونات', 'Permissions Group Archiving', N'أرشفة مجموعة الأذونات', 328, 1);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID In (328, 329, 330, 331);
            ");
        }
    }
}
