using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class bonusType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bonus_BonusType_BounsTypeID",
                table: "Bonus");

            migrationBuilder.RenameColumn(
                name: "BounsTypeID",
                table: "Bonus",
                newName: "BonusTypeID");

            migrationBuilder.RenameIndex(
                name: "IX_Bonus_BounsTypeID",
                table: "Bonus",
                newName: "IX_Bonus_BonusTypeID");

            migrationBuilder.AddForeignKey(
                name: "FK_Bonus_BonusType_BonusTypeID",
                table: "Bonus",
                column: "BonusTypeID",
                principalTable: "BonusType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bonus_BonusType_BonusTypeID",
                table: "Bonus");

            migrationBuilder.RenameColumn(
                name: "BonusTypeID",
                table: "Bonus",
                newName: "BounsTypeID");

            migrationBuilder.RenameIndex(
                name: "IX_Bonus_BonusTypeID",
                table: "Bonus",
                newName: "IX_Bonus_BounsTypeID");

            migrationBuilder.AddForeignKey(
                name: "FK_Bonus_BonusType_BounsTypeID",
                table: "Bonus",
                column: "BounsTypeID",
                principalTable: "BonusType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
