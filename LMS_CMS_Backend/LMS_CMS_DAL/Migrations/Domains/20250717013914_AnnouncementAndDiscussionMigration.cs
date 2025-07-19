using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class AnnouncementAndDiscussionMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Announcement",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ImageLink = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_Announcement", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Announcement_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Announcement_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Announcement_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "DiscussionRoom",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MeetingLink = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecordLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRepeatedWeekly = table.Column<bool>(type: "bit", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    table.PrimaryKey("PK_DiscussionRoom", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DiscussionRoom_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DiscussionRoom_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DiscussionRoom_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "RegisteredEmployee",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    User_Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    en_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ar_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAccepted = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegisteredEmployee", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UserType",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserType", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DiscussionRoomStudentClassroom",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DiscussionRoomID = table.Column<long>(type: "bigint", nullable: false),
                    StudentClassroomID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_DiscussionRoomStudentClassroom", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DiscussionRoomStudentClassroom_DiscussionRoom_DiscussionRoomID",
                        column: x => x.DiscussionRoomID,
                        principalTable: "DiscussionRoom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DiscussionRoomStudentClassroom_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DiscussionRoomStudentClassroom_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DiscussionRoomStudentClassroom_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_DiscussionRoomStudentClassroom_StudentClassroom_StudentClassroomID",
                        column: x => x.StudentClassroomID,
                        principalTable: "StudentClassroom",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AnnouncementSharedTo",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnnouncementID = table.Column<long>(type: "bigint", nullable: false),
                    UserTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_AnnouncementSharedTo", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AnnouncementSharedTo_Announcement_AnnouncementID",
                        column: x => x.AnnouncementID,
                        principalTable: "Announcement",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AnnouncementSharedTo_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AnnouncementSharedTo_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AnnouncementSharedTo_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_AnnouncementSharedTo_UserType_UserTypeID",
                        column: x => x.UserTypeID,
                        principalTable: "UserType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_DeletedByUserId",
                table: "Announcement",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_InsertedByUserId",
                table: "Announcement",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Announcement_UpdatedByUserId",
                table: "Announcement",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementSharedTo_AnnouncementID",
                table: "AnnouncementSharedTo",
                column: "AnnouncementID");

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementSharedTo_DeletedByUserId",
                table: "AnnouncementSharedTo",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementSharedTo_InsertedByUserId",
                table: "AnnouncementSharedTo",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementSharedTo_UpdatedByUserId",
                table: "AnnouncementSharedTo",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AnnouncementSharedTo_UserTypeID",
                table: "AnnouncementSharedTo",
                column: "UserTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoom_DeletedByUserId",
                table: "DiscussionRoom",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoom_InsertedByUserId",
                table: "DiscussionRoom",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoom_UpdatedByUserId",
                table: "DiscussionRoom",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoomStudentClassroom_DeletedByUserId",
                table: "DiscussionRoomStudentClassroom",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoomStudentClassroom_DiscussionRoomID",
                table: "DiscussionRoomStudentClassroom",
                column: "DiscussionRoomID");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoomStudentClassroom_InsertedByUserId",
                table: "DiscussionRoomStudentClassroom",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoomStudentClassroom_StudentClassroomID",
                table: "DiscussionRoomStudentClassroom",
                column: "StudentClassroomID");

            migrationBuilder.CreateIndex(
                name: "IX_DiscussionRoomStudentClassroom_UpdatedByUserId",
                table: "DiscussionRoomStudentClassroom",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RegisteredEmployee_Email",
                table: "RegisteredEmployee",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegisteredEmployee_User_Name",
                table: "RegisteredEmployee",
                column: "User_Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserType_Title",
                table: "UserType",
                column: "Title",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnnouncementSharedTo");

            migrationBuilder.DropTable(
                name: "DiscussionRoomStudentClassroom");

            migrationBuilder.DropTable(
                name: "RegisteredEmployee");

            migrationBuilder.DropTable(
                name: "Announcement");

            migrationBuilder.DropTable(
                name: "UserType");

            migrationBuilder.DropTable(
                name: "DiscussionRoom");
        }
    }
}
