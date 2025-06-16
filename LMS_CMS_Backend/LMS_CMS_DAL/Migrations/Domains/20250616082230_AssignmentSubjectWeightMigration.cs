using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AssignmentSubjectWeightMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SubjectWeightTypeID",
                table: "Assignment",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_SubjectWeightTypeID",
                table: "Assignment",
                column: "SubjectWeightTypeID");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_SubjectWeightType_SubjectWeightTypeID",
                table: "Assignment",
                column: "SubjectWeightTypeID",
                principalTable: "SubjectWeightType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_SubjectWeightType_SubjectWeightTypeID",
                table: "Assignment");

            migrationBuilder.DropIndex(
                name: "IX_Assignment_SubjectWeightTypeID",
                table: "Assignment");

            migrationBuilder.DropColumn(
                name: "SubjectWeightTypeID",
                table: "Assignment");
        }
    }
}
