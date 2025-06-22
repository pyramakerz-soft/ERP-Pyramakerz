namespace LMS_CMS_PL.Services
{
    public class FileWordPdfValidationService
    {
        private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx" };
        private readonly string[] _allowedMimeTypes =
        { "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };


        public string? ValidateDocumentFile(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName)?.ToLower();
            if (!_allowedExtensions.Contains(extension))
            {
                return "Only PDF or Word documents (pdf, doc, docx) are allowed.";
            }

            if (!_allowedMimeTypes.Contains(file.ContentType))
            {
                return "Invalid document format. Allowed types are PDF, Word (.doc or .docx).";
            }

            return null;
        }
    }
}
