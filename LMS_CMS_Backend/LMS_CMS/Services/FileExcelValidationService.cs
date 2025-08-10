namespace LMS_CMS_PL.Services
{
    public class FileExcelValidationService
    {
        private readonly string[] _allowedExcelExtensions = { ".xls", ".xlsx" };
        private readonly string[] _allowedExcelMimeTypes = { "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };

        public string? ValidateExcelFile(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName)?.ToLower();
            if (!_allowedExcelExtensions.Contains(extension))
            {
                return "Only Excel files (xls, xlsx) are allowed.";
            }

            if (!_allowedExcelMimeTypes.Contains(file.ContentType))
            {
                return "Invalid Excel file type. Allowed types are: xls, xlsx.";
            }

            return null;
        }
    }
}
