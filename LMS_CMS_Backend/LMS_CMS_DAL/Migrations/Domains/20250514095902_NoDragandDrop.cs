 using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class NoDragandDrop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DragAndDropAnswer");

            migrationBuilder.AddColumn<string>(
                name: "Answer",
                table: "SubBankQuestion",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Answer",
                table: "SubBankQuestion");

            migrationBuilder.CreateTable(
                name: "DragAndDropAnswer",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    SubBankQuestionID = table.Column<long>(type: "bigint", nullable: false),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DragAndDropAnswer", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DragAndDropAnswer_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DragAndDropAnswer_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DragAndDropAnswer_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DragAndDropAnswer_SubBankQuestion_SubBankQuestionID",
                        column: x => x.SubBankQuestionID,
                        principalTable: "SubBankQuestion",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DragAndDropAnswer_DeletedByUserId",
                table: "DragAndDropAnswer",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DragAndDropAnswer_InsertedByUserId",
                table: "DragAndDropAnswer",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DragAndDropAnswer_SubBankQuestionID",
                table: "DragAndDropAnswer",
                column: "SubBankQuestionID");

            migrationBuilder.CreateIndex(
                name: "IX_DragAndDropAnswer_UpdatedByUserId",
                table: "DragAndDropAnswer",
                column: "UpdatedByUserId");
        }
    }
}
