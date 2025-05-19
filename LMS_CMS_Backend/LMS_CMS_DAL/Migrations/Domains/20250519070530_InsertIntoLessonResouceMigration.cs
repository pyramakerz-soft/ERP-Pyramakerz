using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LMS_CMS_DAL.Migrations.Domains
{
    /// <inheritdoc />
    public partial class InsertIntoLessonResouceMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                INSERT INTO LessonResourceType(EnglishName, ArabicName) VALUES
                ('Image', N'صورة'),
                ('Video', N'فيديو'),
                ('Link', N'رابط'); 
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM LessonResourceType
                WHERE EnglishName IN ('Image', 'Video', 'Link');
            ");
        }
    }
}
