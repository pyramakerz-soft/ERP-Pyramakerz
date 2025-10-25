using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ArchivingModuleMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ArchivingTree",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FileLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ArchivingTreeParentID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_ArchivingTree", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ArchivingTree_ArchivingTree_ArchivingTreeParentID",
                        column: x => x.ArchivingTreeParentID,
                        principalTable: "ArchivingTree",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArchivingTree_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ArchivingTree_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ArchivingTree_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "PermissionGroup",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    En_Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Ar_Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_PermissionGroup", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PermissionGroup_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_PermissionGroup_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_PermissionGroup_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "PermissionGroupDetails",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Allow_Delete = table.Column<bool>(type: "bit", nullable: false),
                    Allow_Delete_For_Others = table.Column<bool>(type: "bit", nullable: false),
                    ArchivingTreeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_PermissionGroupDetails", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PermissionGroupDetails_ArchivingTree_ArchivingTreeID",
                        column: x => x.ArchivingTreeID,
                        principalTable: "ArchivingTree",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionGroupDetails_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_PermissionGroupDetails_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_PermissionGroupDetails_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "PermissionGroupEmployee",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PermissionGroupID = table.Column<long>(type: "bigint", nullable: false),
                    EmployeeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_PermissionGroupEmployee", x => x.ID);
                    table.ForeignKey(
                        name: "FK_PermissionGroupEmployee_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionGroupEmployee_Employee_EmployeeID",
                        column: x => x.EmployeeID,
                        principalTable: "Employee",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionGroupEmployee_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_PermissionGroupEmployee_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_PermissionGroupEmployee_PermissionGroup_PermissionGroupID",
                        column: x => x.PermissionGroupID,
                        principalTable: "PermissionGroup",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArchivingTree_ArchivingTreeParentID",
                table: "ArchivingTree",
                column: "ArchivingTreeParentID");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivingTree_DeletedByUserId",
                table: "ArchivingTree",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivingTree_InsertedByUserId",
                table: "ArchivingTree",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivingTree_UpdatedByUserId",
                table: "ArchivingTree",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroup_DeletedByUserId",
                table: "PermissionGroup",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroup_InsertedByUserId",
                table: "PermissionGroup",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroup_UpdatedByUserId",
                table: "PermissionGroup",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupDetails_ArchivingTreeID",
                table: "PermissionGroupDetails",
                column: "ArchivingTreeID");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupDetails_DeletedByUserId",
                table: "PermissionGroupDetails",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupDetails_InsertedByUserId",
                table: "PermissionGroupDetails",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupDetails_UpdatedByUserId",
                table: "PermissionGroupDetails",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupEmployee_DeletedByUserId",
                table: "PermissionGroupEmployee",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupEmployee_EmployeeID",
                table: "PermissionGroupEmployee",
                column: "EmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupEmployee_InsertedByUserId",
                table: "PermissionGroupEmployee",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupEmployee_PermissionGroupID",
                table: "PermissionGroupEmployee",
                column: "PermissionGroupID");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroupEmployee_UpdatedByUserId",
                table: "PermissionGroupEmployee",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PermissionGroupDetails");

            migrationBuilder.DropTable(
                name: "PermissionGroupEmployee");

            migrationBuilder.DropTable(
                name: "ArchivingTree");

            migrationBuilder.DropTable(
                name: "PermissionGroup");
        }
    }
}
