using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AssignmentStudentQuestionAnswerOptionrelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_AssignmentStudentQuestion_AssignmentStudentQuestionID",
                table: "AssignmentStudentQuestionAnswerOption");

            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_QuestionBankOption_SelectedOpionID",
                table: "AssignmentStudentQuestionAnswerOption");

            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_SubBankQuestion_SubBankQuestionID",
                table: "AssignmentStudentQuestionAnswerOption");

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_AssignmentStudentQuestion_AssignmentStudentQuestionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "AssignmentStudentQuestionID",
                principalTable: "AssignmentStudentQuestion",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_QuestionBankOption_SelectedOpionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "SelectedOpionID",
                principalTable: "QuestionBankOption",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_SubBankQuestion_SubBankQuestionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "SubBankQuestionID",
                principalTable: "SubBankQuestion",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_AssignmentStudentQuestion_AssignmentStudentQuestionID",
                table: "AssignmentStudentQuestionAnswerOption");

            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_QuestionBankOption_SelectedOpionID",
                table: "AssignmentStudentQuestionAnswerOption");

            migrationBuilder.DropForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_SubBankQuestion_SubBankQuestionID",
                table: "AssignmentStudentQuestionAnswerOption");

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_AssignmentStudentQuestion_AssignmentStudentQuestionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "AssignmentStudentQuestionID",
                principalTable: "AssignmentStudentQuestion",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_QuestionBankOption_SelectedOpionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "SelectedOpionID",
                principalTable: "QuestionBankOption",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_AssignmentStudentQuestionAnswerOption_SubBankQuestion_SubBankQuestionID",
                table: "AssignmentStudentQuestionAnswerOption",
                column: "SubBankQuestionID",
                principalTable: "SubBankQuestion",
                principalColumn: "ID");
        }
    }
}
