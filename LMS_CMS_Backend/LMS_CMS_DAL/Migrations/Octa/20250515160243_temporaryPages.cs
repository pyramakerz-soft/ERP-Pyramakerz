using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Octa
{
    /// <inheritdoc />
    public partial class temporaryPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (207, 'Request', N'طلبات', 'Request', N'الطلبات', 180, 1),
                (208, 'Chat', N'المحادثة', 'Chat', N'المحادثة', 180, 1),
                (209, 'Notification', N'الإشعارات', 'Notification', N'الإشعارات', 180, 1);

                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (210, 'Internal Maintenance', N'الصيانة الداخلية', 'Internal Maintenance', N'الصيانة الداخلية', 177, 1),
                (211, 'External Maintenance', N'الصيانة الخارجية', 'External Maintenance', N'الصيانة الخارجية', 177, 1);

                INSERT INTO Page(ID, en_name, ar_name, enDisplayName_name, arDisplayName_name, Page_ID, IsDisplay) VALUES
                (212, 'Virtual Meeting', N'اجتماع افتراضي', 'Virtual Meeting', N'اجتماع افتراضي', 174, 1);
            ");
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM Page WHERE ID IN (207, 208, 209, 210, 211, 212);
            ");
        }
    }
}
