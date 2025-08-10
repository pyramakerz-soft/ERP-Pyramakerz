using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class RemoveAudtableFromChatMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessage_Employee_DeletedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessage_Employee_InsertedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessage_Employee_UpdatedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessage_DeletedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessage_InsertedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessage_UpdatedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "DeletedByOctaId",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "InsertedAt",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "InsertedByOctaId",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "InsertedByUserId",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "UpdatedByOctaId",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "ChatMessage");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ChatMessage",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByOctaId",
                table: "ChatMessage",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByUserId",
                table: "ChatMessage",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsertedAt",
                table: "ChatMessage",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByOctaId",
                table: "ChatMessage",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByUserId",
                table: "ChatMessage",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ChatMessage",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "ChatMessage",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByOctaId",
                table: "ChatMessage",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByUserId",
                table: "ChatMessage",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_DeletedByUserId",
                table: "ChatMessage",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_InsertedByUserId",
                table: "ChatMessage",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_UpdatedByUserId",
                table: "ChatMessage",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessage_Employee_DeletedByUserId",
                table: "ChatMessage",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessage_Employee_InsertedByUserId",
                table: "ChatMessage",
                column: "InsertedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMessage_Employee_UpdatedByUserId",
                table: "ChatMessage",
                column: "UpdatedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");
        }
    }
}
