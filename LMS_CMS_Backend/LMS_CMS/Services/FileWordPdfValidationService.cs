
namespace LMS_CMS_PL.Services
{
    public class FileWordPdfValidationService
    {
        private readonly string[] _allowedExtensions = { ".pdf", ".doc", ".docx" };
        private readonly string[] _allowedMimeTypes = { "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

        private readonly Dictionary<string, (byte[] signature, int offset)> _fileSignatures = new()
        {
            { ".pdf", (new byte[] { 0x25, 0x50, 0x44, 0x46 }, 0) },  
            { ".doc", (new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 }, 0) },  
            { ".docx", (new byte[] { 0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00 }, 0) }  
        };

        private async Task<bool> IsValidDocx(Stream stream)
        {
            try
            {
                // DOCX is a ZIP archive containing specific files
                stream.Seek(0, SeekOrigin.Begin);
                using var zipArchive = new System.IO.Compression.ZipArchive(stream);
                return zipArchive.Entries.Any(e => e.FullName.StartsWith("word/"));
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> HasValidPdfStructure(Stream stream)
        {
            try
            {
                // Check for PDF footer with %%EOF
                stream.Seek(-128, SeekOrigin.End); // Look in last 128 bytes
                var buffer = new byte[128];
                await stream.ReadAsync(buffer.AsMemory(0, buffer.Length));
                return System.Text.Encoding.ASCII.GetString(buffer).Contains("%%EOF");
            }
            catch
            {
                return false;
            }
        }

        public async Task<string?> ValidateDocumentFileAsync(IFormFile file)
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
            
            if (!_allowedExtensions.Contains(extension))
            {
                return "Only PDF or Word documents (pdf, doc, docx) are allowed.";
            }

            if (!_allowedMimeTypes.Contains(file.ContentType))
            {
                return "Invalid document format. Allowed types are PDF, Word (.doc or .docx).";
            }

            try
            {
                using var stream = file.OpenReadStream();
                var signatureInfo = _fileSignatures[extension];
                var header = new byte[signatureInfo.signature.Length + signatureInfo.offset];

                await stream.ReadAsync(header.AsMemory(0, header.Length));

                var actualSignature = header.Skip(signatureInfo.offset)
                                           .Take(signatureInfo.signature.Length)
                                           .ToArray();

                if (!actualSignature.SequenceEqual(signatureInfo.signature))
                {
                    return $"File content doesn't match its extension. Expected {extension} document.";
                }

                // 5. Additional format-specific validation
                if (extension == ".docx")
                {
                    if (!await IsValidDocx(stream))
                    {
                        return "The DOCX file appears to be incomplete or corrupted.";
                    }
                }
                else if (extension == ".pdf")
                {
                    if (!await HasValidPdfStructure(stream))
                    {
                        return "The PDF file appears to be incomplete or corrupted.";
                    }
                }
            }
            catch (Exception ex)
            {
                return $"Unable to verify document content: {ex.Message}";
            }


            return null;
        }
    }
}
