
namespace LMS_CMS_PL.Services
{
    public class FileExcelValidationService
    {
        private readonly string[] _allowedExcelExtensions = { ".xls", ".xlsx" };
        private readonly string[] _allowedExcelMimeTypes = { "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };

        private readonly Dictionary<string, byte[]> _fileSignatures = new()
        {
            { ".xls", new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 } }, 
            { ".xlsx", new byte[] { 0x50, 0x4B, 0x03, 0x04 } }  
        };

        public async Task<string?> ValidateExcelFileAsync(IFormFile file)
        {
            if (file.FileName.Contains('\0') || file.FileName.Contains("%00"))
            {
                return "Invalid file name - potential security threat detected.";
            }

            var extension = Path.GetExtension(file.FileName)?.ToLower();
            
            if (string.IsNullOrEmpty(extension))
            {
                return "File has no extension.";
            }

            if (!_allowedExcelExtensions.Contains(extension))
            {
                return "Only Excel files (xls, xlsx) are allowed.";
            }

            if (!_allowedExcelMimeTypes.Contains(file.ContentType))
            {
                return "Invalid Excel file type. Allowed types are: xls, xlsx.";
            }

            try
            {
                using var stream = file.OpenReadStream();
                var headerSize = extension == ".xlsx" ? 4 : 8; // XLSX needs 4 bytes, XLS needs 8
                var header = new byte[headerSize];

                await stream.ReadAsync(header.AsMemory(0, headerSize));

                if (_fileSignatures.TryGetValue(extension, out var signature))
                {
                    if (!header.Take(signature.Length).SequenceEqual(signature))
                    {
                        return $"File content doesn't match its extension. Expected {extension} file.";
                    }
                }
            }
            catch (Exception ex)
            {
                return $"Unable to verify Excel file content: {ex.Message}";
            }

            // Optional: Additional Excel-specific validation
            if (extension == ".xlsx")
            {
                try
                {
                    // Quick check for ZIP structure (XLSX is a ZIP archive)
                    using var zipArchive = new System.IO.Compression.ZipArchive(file.OpenReadStream());
                    if (!zipArchive.Entries.Any(e => e.FullName.StartsWith("xl/")))
                    {
                        return "The XLSX file appears to be missing required Excel components.";
                    }
                }
                catch
                {
                    return "The file is not a valid XLSX format (invalid ZIP structure).";
                }

            }
            
            return null;
        }
    }
}
