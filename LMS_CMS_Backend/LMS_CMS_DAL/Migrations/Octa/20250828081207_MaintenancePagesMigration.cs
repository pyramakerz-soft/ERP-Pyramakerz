using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class MaintenancePagesMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@" 
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (319, 'Maintenance Employees', N'موظفي الصيانة', 'Maintenance Employees', N'موظفي الصيانة', 176, 1),  
                (320, 'Maintenance Companies', N'شركات الصيانة', 'Maintenance Companies', N'شركات الصيانة', 176, 1),  
                (321, 'Maintenance Items', N'عناصر الصيانة', 'Maintenance Items', N'عناصر الصيانة', 176, 1);
            ");

            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID = 211;  
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET en_name = 'Maintenance Module', ar_name = N'وحدة الصيانة', arDisplayName_name = N'الصيانة', enDisplayName_name = 'Maintenance' WHERE ID = 154;
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET en_name = 'Maintenance', ar_name = N'الصيانة', arDisplayName_name = N'الصيانة', enDisplayName_name = 'Maintenance' WHERE ID = 210;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
             
            migrationBuilder.Sql(@"
                UPDATE Page SET en_name = 'Internal Maintenance', ar_name = N'الصيانة الداخلية', 
                arDisplayName_name = N'الصيانة الداخلية', enDisplayName_name = 'Internal Maintenance' WHERE ID = 210;
            ");

            migrationBuilder.Sql(@"
                UPDATE Page SET en_name = 'Maintenance Module', ar_name = N'الصيانة', 
                arDisplayName_name = N'الصيانة', enDisplayName_name = 'Maintenance' WHERE ID = 154;
            ");
             
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) 
                VALUES (211, 'External Maintenance', N'الصيانة الخارجية', 'External Maintenance', N'الصيانة الخارجية', 175, 1);
            ");
             
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (319, 320, 321);
            ");
        }
    }
}
