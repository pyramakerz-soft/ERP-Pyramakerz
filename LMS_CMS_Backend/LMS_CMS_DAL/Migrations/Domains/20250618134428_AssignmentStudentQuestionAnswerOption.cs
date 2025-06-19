using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AssignmentStudentQuestionAnswerOption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Answer",
                table: "AssignmentStudentQuestion",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "AnswerOptionID",
                table: "AssignmentStudentQuestion",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "QuestionBankID",
                table: "AssignmentStudentQuestion",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateTable(
                name: "AssignmentStudentQuestionAnswerOption",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Order = table.Column<long>(type: "bigint", nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AssignmentStudentQuestionID = table.Column<long>(type: "bigint", nullable: false),
                    SelectedOpionID = table.Column<long>(type: "bigint", nullable: true),
                    SubBankQuestionID = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentStudentQuestionAnswerOption", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestionAnswerOption_AssignmentStudentQuestion_AssignmentStudentQuestionID",
                        column: x => x.AssignmentStudentQuestionID,
                        principalTable: "AssignmentStudentQuestion",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestionAnswerOption_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestionAnswerOption_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestionAnswerOption_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestionAnswerOption_QuestionBankOption_SelectedOpionID",
                        column: x => x.SelectedOpionID,
                        principalTable: "QuestionBankOption",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AssignmentStudentQuestionAnswerOption_SubBankQuestion_SubBankQuestionID",
                        column: x => x.SubBankQuestionID,
                        principalTable: "SubBankQuestion",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestion_AnswerOptionID",
                table: "AssignmentStudentQuestion",
                column: "AnswerOptionID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestion_QuestionBankID",
                table: "AssignmentStudentQuestion",
                column: "QuestionBankID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestionAnswerOption_AssignmentStudentQuestionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "AssignmentStudentQuestionID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestionAnswerOption_DeletedByUserId",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestionAnswerOption_InsertedByUserId",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestionAnswerOption_SelectedOpionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "SelectedOpionID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestionAnswerOption_SubBankQuestionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "SubBankQuestionID");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentStudentQuestionAnswerOption_UpdatedByUserId",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestion_QuestionBankOption_AnswerOptionID",
                table: "AssignmentStudentQuestion",
                column: "AnswerOptionID",
                principalTable: "QuestionBankOption",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestion_QuestionBank_QuestionBankID",
                table: "AssignmentStudentQuestion",
                column: "QuestionBankID",
                principalTable: "QuestionBank",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestion_QuestionBankOption_AnswerOptionID",
                table: "AssignmentStudentQuestion");

            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestion_QuestionBank_QuestionBankID",
                table: "AssignmentStudentQuestion");

            migrationBuilder.DropTable(
                name: "AssignmentStudentQuestionAnswerOption");

            migrationBuilder.DropIndex(
                name: "IX_AssignmentStudentQuestion_AnswerOptionID",
                table: "AssignmentStudentQuestion");

            migrationBuilder.DropIndex(
                name: "IX_AssignmentStudentQuestion_QuestionBankID",
                table: "AssignmentStudentQuestion");

            migrationBuilder.DropColumn(
                name: "Answer",
                table: "AssignmentStudentQuestion");

            migrationBuilder.DropColumn(
                name: "AnswerOptionID",
                table: "AssignmentStudentQuestion");

            migrationBuilder.DropColumn(
                name: "QuestionBankID",
                table: "AssignmentStudentQuestion");
        }
    }
}
