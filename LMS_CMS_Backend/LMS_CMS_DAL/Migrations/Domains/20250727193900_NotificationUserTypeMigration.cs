using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class NotificationUserTypeMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "UserTypeID",
                table: "Notification",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notification_UserTypeID",
                table: "Notification",
                column: "UserTypeID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_UserType_UserTypeID",
                table: "Notification",
                column: "UserTypeID",
                principalTable: "UserType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_UserType_UserTypeID",
                table: "Notification");

            migrationBuilder.DropIndex(
                name: "IX_Notification_UserTypeID",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "UserTypeID",
                table: "Notification");
        }
    }
}
