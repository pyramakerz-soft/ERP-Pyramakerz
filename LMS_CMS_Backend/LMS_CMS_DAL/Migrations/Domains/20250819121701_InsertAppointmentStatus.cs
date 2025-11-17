using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class InsertAppointmentStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO AppointmentStatus (ID, Name) VALUES (1, 'Pending');
                INSERT INTO AppointmentStatus (ID, Name) VALUES (2, 'Deny');
                INSERT INTO AppointmentStatus (ID, Name) VALUES (3, 'Accept'); 
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM AppointmentStatus WHERE ID IN (1, 2, 3)");
        }
    }
}
