using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class UpdateConnectionStateArabicDataMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ConnectionStatus
                SET Ar_Title = N'متصل'
                WHERE En_Title = 'Online';

                UPDATE ConnectionStatus
                SET Ar_Title = N'غير متصل'
                WHERE En_Title = 'Offline';

                UPDATE ConnectionStatus
                SET Ar_Title = N'مشغول'
                WHERE En_Title = 'Busy';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ConnectionStatus
                SET Ar_Title = 'متصل'
                WHERE En_Title = 'Online';

                UPDATE ConnectionStatus
                SET Ar_Title = 'غير متصل'
                WHERE En_Title = 'Offline';

                UPDATE ConnectionStatus
                SET Ar_Title = 'مشغول'
                WHERE En_Title = 'Busy';
            ");
        }
    }
}
