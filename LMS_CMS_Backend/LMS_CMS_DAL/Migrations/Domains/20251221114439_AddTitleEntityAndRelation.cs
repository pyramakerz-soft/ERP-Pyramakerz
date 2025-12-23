using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AddTitleEntityAndRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Titles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByOctaId",
                table: "Titles",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByUserId",
                table: "Titles",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsertedAt",
                table: "Titles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByOctaId",
                table: "Titles",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByUserId",
                table: "Titles",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Titles",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Titles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByOctaId",
                table: "Titles",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByUserId",
                table: "Titles",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Titles_DeletedByUserId",
                table: "Titles",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Titles_InsertedByUserId",
                table: "Titles",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Titles_UpdatedByUserId",
                table: "Titles",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Titles_Employee_DeletedByUserId",
                table: "Titles",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Titles_Employee_InsertedByUserId",
                table: "Titles",
                column: "InsertedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_Titles_Employee_UpdatedByUserId",
                table: "Titles",
                column: "UpdatedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Titles_Employee_DeletedByUserId",
                table: "Titles");

            migrationBuilder.DropForeignKey(
                name: "FK_Titles_Employee_InsertedByUserId",
                table: "Titles");

            migrationBuilder.DropForeignKey(
                name: "FK_Titles_Employee_UpdatedByUserId",
                table: "Titles");

            migrationBuilder.DropIndex(
                name: "IX_Titles_DeletedByUserId",
                table: "Titles");

            migrationBuilder.DropIndex(
                name: "IX_Titles_InsertedByUserId",
                table: "Titles");

            migrationBuilder.DropIndex(
                name: "IX_Titles_UpdatedByUserId",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "DeletedByOctaId",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "InsertedAt",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "InsertedByOctaId",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "InsertedByUserId",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "UpdatedByOctaId",
                table: "Titles");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "Titles");
        }
    }
}
