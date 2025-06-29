using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DailyPerformanceMsterAuditableEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "DailyPerformanceMaster",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByOctaId",
                table: "DailyPerformanceMaster",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByUserId",
                table: "DailyPerformanceMaster",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsertedAt",
                table: "DailyPerformanceMaster",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByOctaId",
                table: "DailyPerformanceMaster",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByUserId",
                table: "DailyPerformanceMaster",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "DailyPerformanceMaster",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "DailyPerformanceMaster",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByOctaId",
                table: "DailyPerformanceMaster",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByUserId",
                table: "DailyPerformanceMaster",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DailyPerformanceMaster_DeletedByUserId",
                table: "DailyPerformanceMaster",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyPerformanceMaster_InsertedByUserId",
                table: "DailyPerformanceMaster",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DailyPerformanceMaster_UpdatedByUserId",
                table: "DailyPerformanceMaster",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyPerformanceMaster_Employee_DeletedByUserId",
                table: "DailyPerformanceMaster",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyPerformanceMaster_Employee_InsertedByUserId",
                table: "DailyPerformanceMaster",
                column: "InsertedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyPerformanceMaster_Employee_UpdatedByUserId",
                table: "DailyPerformanceMaster",
                column: "UpdatedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyPerformanceMaster_Employee_DeletedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropForeignKey(
                name: "FK_DailyPerformanceMaster_Employee_InsertedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropForeignKey(
                name: "FK_DailyPerformanceMaster_Employee_UpdatedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropIndex(
                name: "IX_DailyPerformanceMaster_DeletedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropIndex(
                name: "IX_DailyPerformanceMaster_InsertedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropIndex(
                name: "IX_DailyPerformanceMaster_UpdatedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "DeletedByOctaId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "InsertedAt",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "InsertedByOctaId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "InsertedByUserId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "UpdatedByOctaId",
                table: "DailyPerformanceMaster");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "DailyPerformanceMaster");
        }
    }
}
