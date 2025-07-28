using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class NotificationAuditMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "NotificationSharedTo",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByOctaId",
                table: "NotificationSharedTo",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByUserId",
                table: "NotificationSharedTo",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsertedAt",
                table: "NotificationSharedTo",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByOctaId",
                table: "NotificationSharedTo",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByUserId",
                table: "NotificationSharedTo",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "NotificationSharedTo",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "NotificationSharedTo",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByOctaId",
                table: "NotificationSharedTo",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByUserId",
                table: "NotificationSharedTo",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Notification",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByOctaId",
                table: "Notification",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByUserId",
                table: "Notification",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsertedAt",
                table: "Notification",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByOctaId",
                table: "Notification",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByUserId",
                table: "Notification",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Notification",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Notification",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByOctaId",
                table: "Notification",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByUserId",
                table: "Notification",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSharedTo_DeletedByUserId",
                table: "NotificationSharedTo",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSharedTo_InsertedByUserId",
                table: "NotificationSharedTo",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSharedTo_UpdatedByUserId",
                table: "NotificationSharedTo",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_DeletedByUserId",
                table: "Notification",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_InsertedByUserId",
                table: "Notification",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_UpdatedByUserId",
                table: "Notification",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Employee_DeletedByUserId",
                table: "Notification",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Employee_InsertedByUserId",
                table: "Notification",
                column: "InsertedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Employee_UpdatedByUserId",
                table: "Notification",
                column: "UpdatedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationSharedTo_Employee_DeletedByUserId",
                table: "NotificationSharedTo",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationSharedTo_Employee_InsertedByUserId",
                table: "NotificationSharedTo",
                column: "InsertedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationSharedTo_Employee_UpdatedByUserId",
                table: "NotificationSharedTo",
                column: "UpdatedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Employee_DeletedByUserId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Employee_InsertedByUserId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Employee_UpdatedByUserId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationSharedTo_Employee_DeletedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationSharedTo_Employee_InsertedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationSharedTo_Employee_UpdatedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropIndex(
                name: "IX_NotificationSharedTo_DeletedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropIndex(
                name: "IX_NotificationSharedTo_InsertedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropIndex(
                name: "IX_NotificationSharedTo_UpdatedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropIndex(
                name: "IX_Notification_DeletedByUserId",
                table: "Notification");

            migrationBuilder.DropIndex(
                name: "IX_Notification_InsertedByUserId",
                table: "Notification");

            migrationBuilder.DropIndex(
                name: "IX_Notification_UpdatedByUserId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "DeletedByOctaId",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "InsertedAt",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "InsertedByOctaId",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "InsertedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "UpdatedByOctaId",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "NotificationSharedTo");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "DeletedByOctaId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "InsertedAt",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "InsertedByOctaId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "InsertedByUserId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "UpdatedByOctaId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Notification");
        }
    }
}
