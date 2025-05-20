using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class SchoolAndSemesterMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Semester_Days_WeekEndDayID",
                table: "Semester");

            migrationBuilder.DropForeignKey(
                name: "FK_Semester_Days_WeekStartDayID",
                table: "Semester");

            migrationBuilder.DropIndex(
                name: "IX_Semester_WeekEndDayID",
                table: "Semester");

            migrationBuilder.DropIndex(
                name: "IX_Semester_WeekStartDayID",
                table: "Semester");

            migrationBuilder.DropColumn(
                name: "WeekEndDayID",
                table: "Semester");

            migrationBuilder.DropColumn(
                name: "WeekStartDayID",
                table: "Semester");

            migrationBuilder.RenameColumn(
                name: "CountryID",
                table: "TaxIssuers",
                newName: "CountryCode");

            migrationBuilder.AddColumn<string>(
                name: "AdditionalInfo",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BuildingNumber",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CountryCode",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Floor",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Governate",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LandMark",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegionCity",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Room",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Student",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TypeID",
                table: "Student",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemCode",
                table: "ShopItem",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UnitType",
                table: "ShopItem",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DaysID",
                table: "School",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "WeekEndDayID",
                table: "School",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "WeekStartDayID",
                table: "School",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EtaInsertedDate",
                table: "InventoryMaster",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Student_TypeID",
                table: "Student",
                column: "TypeID");

            migrationBuilder.CreateIndex(
                name: "IX_School_DaysID",
                table: "School",
                column: "DaysID");

            migrationBuilder.CreateIndex(
                name: "IX_School_WeekEndDayID",
                table: "School",
                column: "WeekEndDayID");

            migrationBuilder.CreateIndex(
                name: "IX_School_WeekStartDayID",
                table: "School",
                column: "WeekStartDayID");

            migrationBuilder.AddForeignKey(
                name: "FK_School_Days_DaysID",
                table: "School",
                column: "DaysID",
                principalTable: "Days",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_School_Days_WeekEndDayID",
                table: "School",
                column: "WeekEndDayID",
                principalTable: "Days",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_School_Days_WeekStartDayID",
                table: "School",
                column: "WeekStartDayID",
                principalTable: "Days",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Student_TaxCustomer_TypeID",
                table: "Student",
                column: "TypeID",
                principalTable: "TaxCustomer",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_School_Days_DaysID",
                table: "School");

            migrationBuilder.DropForeignKey(
                name: "FK_School_Days_WeekEndDayID",
                table: "School");

            migrationBuilder.DropForeignKey(
                name: "FK_School_Days_WeekStartDayID",
                table: "School");

            migrationBuilder.DropForeignKey(
                name: "FK_Student_TaxCustomer_TypeID",
                table: "Student");

            migrationBuilder.DropIndex(
                name: "IX_Student_TypeID",
                table: "Student");

            migrationBuilder.DropIndex(
                name: "IX_School_DaysID",
                table: "School");

            migrationBuilder.DropIndex(
                name: "IX_School_WeekEndDayID",
                table: "School");

            migrationBuilder.DropIndex(
                name: "IX_School_WeekStartDayID",
                table: "School");

            migrationBuilder.DropColumn(
                name: "AdditionalInfo",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "BuildingNumber",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "CountryCode",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "Floor",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "Governate",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "LandMark",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "RegionCity",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "Room",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "TypeID",
                table: "Student");

            migrationBuilder.DropColumn(
                name: "ItemCode",
                table: "ShopItem");

            migrationBuilder.DropColumn(
                name: "UnitType",
                table: "ShopItem");

            migrationBuilder.DropColumn(
                name: "DaysID",
                table: "School");

            migrationBuilder.DropColumn(
                name: "WeekEndDayID",
                table: "School");

            migrationBuilder.DropColumn(
                name: "WeekStartDayID",
                table: "School");

            migrationBuilder.DropColumn(
                name: "EtaInsertedDate",
                table: "InventoryMaster");

            migrationBuilder.RenameColumn(
                name: "CountryCode",
                table: "TaxIssuers",
                newName: "CountryID");

            migrationBuilder.AddColumn<long>(
                name: "WeekEndDayID",
                table: "Semester",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "WeekStartDayID",
                table: "Semester",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Semester_WeekEndDayID",
                table: "Semester",
                column: "WeekEndDayID");

            migrationBuilder.CreateIndex(
                name: "IX_Semester_WeekStartDayID",
                table: "Semester",
                column: "WeekStartDayID");

            migrationBuilder.AddForeignKey(
                name: "FK_Semester_Days_WeekEndDayID",
                table: "Semester",
                column: "WeekEndDayID",
                principalTable: "Days",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Semester_Days_WeekStartDayID",
                table: "Semester",
                column: "WeekStartDayID",
                principalTable: "Days",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
