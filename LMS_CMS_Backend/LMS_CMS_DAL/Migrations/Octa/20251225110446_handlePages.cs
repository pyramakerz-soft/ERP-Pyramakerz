using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class handlePages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE Page
                SET 
                    en_name = 'Accounting',
                    ar_name = N'المحاسبة',
                    enDisplayName_name = 'Accounting',
                    arDisplayName_name = N'المحاسبة',
                    Page_ID = null   -- الرجوع إلى Accounting
                    WHERE ID = 48;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
