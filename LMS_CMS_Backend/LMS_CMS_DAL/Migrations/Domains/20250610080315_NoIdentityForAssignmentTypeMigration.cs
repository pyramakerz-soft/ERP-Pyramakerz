using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class NoIdentityForAssignmentTypeMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.AlterColumn<long>(
            //    name: "ID",
            //    table: "AssignmentType",
            //    type: "bigint",
            //    nullable: false,
            //    oldClrType: typeof(long),
            //    oldType: "bigint")
            //    .OldAnnotation("SqlServer:Identity", "1, 1");




            // 1. Drop foreign key constraint from Assignment table
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_AssignmentType_AssignmentTypeID",
                table: "Assignment");

            // 2. Drop primary key constraint on AssignmentType
            migrationBuilder.DropPrimaryKey(
                name: "PK_AssignmentType",
                table: "AssignmentType");

            // 3. Add temporary column without IDENTITY
            migrationBuilder.AddColumn<long>(
                name: "TempID",
                table: "AssignmentType",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            // 4. Drop the old ID column
            migrationBuilder.DropColumn(
                name: "ID",
                table: "AssignmentType");

            // 5. Rename TempID to ID
            migrationBuilder.RenameColumn(
                name: "TempID",
                table: "AssignmentType",
                newName: "ID");

            // 6. Add primary key back
            migrationBuilder.AddPrimaryKey(
                name: "PK_AssignmentType",
                table: "AssignmentType",
                column: "ID");

            // 7. Recreate foreign key
            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_AssignmentType_AssignmentTypeID",
                table: "Assignment",
                column: "AssignmentTypeID",
                principalTable: "AssignmentType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.AlterColumn<long>(
            //    name: "ID",
            //    table: "AssignmentType",
            //    type: "bigint",
            //    nullable: false,
            //    oldClrType: typeof(long),
            //    oldType: "bigint")
            //    .Annotation("SqlServer:Identity", "1, 1");

            // 1. Drop foreign key constraint from Assignment table
            migrationBuilder.DropForeignKey(
                name: "FK_Assignment_AssignmentType_AssignmentTypeID",
                table: "Assignment");

            // 2. Drop primary key constraint on AssignmentType
            migrationBuilder.DropPrimaryKey(
                name: "PK_AssignmentType",
                table: "AssignmentType");

            // 3. Add temporary column with IDENTITY
            migrationBuilder.AddColumn<long>(
                name: "TempID",
                table: "AssignmentType",
                type: "bigint",
                nullable: false,
                defaultValue: 0L)
                .Annotation("SqlServer:Identity", "1, 1");

            // 4. Drop current ID column
            migrationBuilder.DropColumn(
                name: "ID",
                table: "AssignmentType");

            // 5. Rename TempID back to ID
            migrationBuilder.RenameColumn(
                name: "TempID",
                table: "AssignmentType",
                newName: "ID");

            // 6. Add primary key constraint again
            migrationBuilder.AddPrimaryKey(
                name: "PK_AssignmentType",
                table: "AssignmentType",
                column: "ID");

            // 7. Re-add the foreign key to Assignment
            migrationBuilder.AddForeignKey(
                name: "FK_Assignment_AssignmentType_AssignmentTypeID",
                table: "Assignment",
                column: "AssignmentTypeID",
                principalTable: "AssignmentType",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
