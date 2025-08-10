using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class ChatAndRequestsMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChatMessage",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeenOrNot = table.Column<bool>(type: "bit", nullable: false),
                    ForwardedOrNot = table.Column<bool>(type: "bit", nullable: false),
                    SenderID = table.Column<long>(type: "bigint", nullable: false),
                    ReceiverID = table.Column<long>(type: "bigint", nullable: false),
                    SenderUserTypeID = table.Column<long>(type: "bigint", nullable: false),
                    ReceiverUserTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_ChatMessage", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ChatMessage_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ChatMessage_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ChatMessage_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_ChatMessage_UserType_ReceiverUserTypeID",
                        column: x => x.ReceiverUserTypeID,
                        principalTable: "UserType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChatMessage_UserType_SenderUserTypeID",
                        column: x => x.SenderUserTypeID,
                        principalTable: "UserType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Request",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Link = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileLink = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SeenOrNot = table.Column<bool>(type: "bit", nullable: false),
                    ForwardedOrNot = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedOrNot = table.Column<bool>(type: "bit", nullable: true),
                    SenderID = table.Column<long>(type: "bigint", nullable: false),
                    ReceiverID = table.Column<long>(type: "bigint", nullable: false),
                    TransfereeID = table.Column<long>(type: "bigint", nullable: true),
                    SenderUserTypeID = table.Column<long>(type: "bigint", nullable: false),
                    ReceiverUserTypeID = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_Request", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Request_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Request_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Request_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_Request_UserType_ReceiverUserTypeID",
                        column: x => x.ReceiverUserTypeID,
                        principalTable: "UserType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Request_UserType_SenderUserTypeID",
                        column: x => x.SenderUserTypeID,
                        principalTable: "UserType",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessageAttachment",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChatMessageID = table.Column<long>(type: "bigint", nullable: false),
                    FileLink = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessageAttachment", x => x.ID);
                    table.ForeignKey(
                        name: "FK_ChatMessageAttachment_ChatMessage_ChatMessageID",
                        column: x => x.ChatMessageID,
                        principalTable: "ChatMessage",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_DeletedByUserId",
                table: "ChatMessage",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_InsertedByUserId",
                table: "ChatMessage",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_ReceiverUserTypeID",
                table: "ChatMessage",
                column: "ReceiverUserTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_SenderUserTypeID",
                table: "ChatMessage",
                column: "SenderUserTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessage_UpdatedByUserId",
                table: "ChatMessage",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessageAttachment_ChatMessageID",
                table: "ChatMessageAttachment",
                column: "ChatMessageID");

            migrationBuilder.CreateIndex(
                name: "IX_Request_DeletedByUserId",
                table: "Request",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Request_InsertedByUserId",
                table: "Request",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Request_ReceiverUserTypeID",
                table: "Request",
                column: "ReceiverUserTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Request_SenderUserTypeID",
                table: "Request",
                column: "SenderUserTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Request_UpdatedByUserId",
                table: "Request",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessageAttachment");

            migrationBuilder.DropTable(
                name: "Request");

            migrationBuilder.DropTable(
                name: "ChatMessage");
        }
    }
}
