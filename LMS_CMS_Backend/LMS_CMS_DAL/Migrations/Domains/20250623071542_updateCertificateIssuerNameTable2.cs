using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class updateCertificateIssuerNameTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MyGetDate",
                table: "CertificatesIssuerNames");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "CertificatesIssuerNames");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MyGetDate",
                table: "CertificatesIssuerNames",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "CertificatesIssuerNames",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
