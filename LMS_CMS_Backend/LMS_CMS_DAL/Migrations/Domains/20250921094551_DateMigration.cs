using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class DateMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT * 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Employee' AND COLUMN_NAME = 'HireDate' 
                    AND DATA_TYPE = 'nvarchar')  -- This assumes the column type is string (nvarchar)
                BEGIN
                    ALTER TABLE Employee 
                    ALTER COLUMN HireDate DATE;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT * 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Employee' AND COLUMN_NAME = 'HireDate' 
                    AND DATA_TYPE = 'date')  -- Checking if it's already Date
                BEGIN
                    ALTER TABLE Employee 
                    ALTER COLUMN HireDate NVARCHAR(255);  -- Reverting to string
                END
            ");
        }
    }
}
