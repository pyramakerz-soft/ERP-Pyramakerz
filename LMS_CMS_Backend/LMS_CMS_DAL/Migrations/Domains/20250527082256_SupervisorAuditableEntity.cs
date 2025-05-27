using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class SupervisorAuditableEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "SubjectSupervisor",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByOctaId",
                table: "SubjectSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByUserId",
                table: "SubjectSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsertedAt",
                table: "SubjectSupervisor",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByOctaId",
                table: "SubjectSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByUserId",
                table: "SubjectSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "SubjectSupervisor",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "SubjectSupervisor",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByOctaId",
                table: "SubjectSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByUserId",
                table: "SubjectSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "GradeSupervisor",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByOctaId",
                table: "GradeSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeletedByUserId",
                table: "GradeSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InsertedAt",
                table: "GradeSupervisor",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByOctaId",
                table: "GradeSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "InsertedByUserId",
                table: "GradeSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "GradeSupervisor",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "GradeSupervisor",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByOctaId",
                table: "GradeSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UpdatedByUserId",
                table: "GradeSupervisor",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubjectSupervisor_DeletedByUserId",
                table: "SubjectSupervisor",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectSupervisor_InsertedByUserId",
                table: "SubjectSupervisor",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SubjectSupervisor_UpdatedByUserId",
                table: "SubjectSupervisor",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GradeSupervisor_DeletedByUserId",
                table: "GradeSupervisor",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GradeSupervisor_InsertedByUserId",
                table: "GradeSupervisor",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GradeSupervisor_UpdatedByUserId",
                table: "GradeSupervisor",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_GradeSupervisor_Employee_DeletedByUserId",
                table: "GradeSupervisor",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GradeSupervisor_Employee_InsertedByUserId",
                table: "GradeSupervisor",
                column: "InsertedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_GradeSupervisor_Employee_UpdatedByUserId",
                table: "GradeSupervisor",
                column: "UpdatedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_SubjectSupervisor_Employee_DeletedByUserId",
                table: "SubjectSupervisor",
                column: "DeletedByUserId",
                principalTable: "Employee",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubjectSupervisor_Employee_InsertedByUserId",
                table: "SubjectSupervisor",
                column: "InsertedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");

            migrationBuilder.AddForeignKey(
                name: "FK_SubjectSupervisor_Employee_UpdatedByUserId",
                table: "SubjectSupervisor",
                column: "UpdatedByUserId",
                principalTable: "Employee",
                principalColumn: "ID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GradeSupervisor_Employee_DeletedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropForeignKey(
                name: "FK_GradeSupervisor_Employee_InsertedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropForeignKey(
                name: "FK_GradeSupervisor_Employee_UpdatedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropForeignKey(
                name: "FK_SubjectSupervisor_Employee_DeletedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropForeignKey(
                name: "FK_SubjectSupervisor_Employee_InsertedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropForeignKey(
                name: "FK_SubjectSupervisor_Employee_UpdatedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropIndex(
                name: "IX_SubjectSupervisor_DeletedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropIndex(
                name: "IX_SubjectSupervisor_InsertedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropIndex(
                name: "IX_SubjectSupervisor_UpdatedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropIndex(
                name: "IX_GradeSupervisor_DeletedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropIndex(
                name: "IX_GradeSupervisor_InsertedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropIndex(
                name: "IX_GradeSupervisor_UpdatedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "DeletedByOctaId",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "InsertedAt",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "InsertedByOctaId",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "InsertedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "UpdatedByOctaId",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "SubjectSupervisor");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "DeletedByOctaId",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "DeletedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "InsertedAt",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "InsertedByOctaId",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "InsertedByUserId",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "UpdatedByOctaId",
                table: "GradeSupervisor");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "GradeSupervisor");
        }
    }
}
