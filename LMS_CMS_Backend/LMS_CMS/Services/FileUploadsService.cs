using Amazon.S3;

namespace LMS_CMS_PL.Services
{
    public class FileUploadsService
    {
        private readonly IConfiguration _configuration;
        private readonly DomainService _domainService;

        public FileUploadsService(IConfiguration configuration, DomainService domainService)
        {
            _configuration = configuration;
            _domainService = domainService;
        }
         
        public string GetFileUrl(string? filePath, HttpRequest request)
        {
            if (string.IsNullOrEmpty(filePath))
                return string.Empty;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                AmazonS3Client s3Client = new AmazonS3Client();
                S3Service s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");
                return s3Service.GetFileUrl(filePath);
            }
            else
            {
                string serverUrl = $"{request.Scheme}://{request.Host}/";
                return $"{serverUrl}{filePath.Replace("\\", "/")}";
            }
        }

        public async Task<string> UploadFileAsync(IFormFile file, string basePath, long entityId, HttpContext httpContext)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                var domain = _domainService.GetDomain(httpContext);
                string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();
                string fullPath = $"{basePath}/{entityId}";

                AmazonS3Client s3Client = new AmazonS3Client();
                S3Service s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");

                bool uploaded = await s3Service.UploadFileAsync(file, fullPath, $"{domain}/{subDomain}");
                if (uploaded)
                {
                    return $"{fullPath}/{file.FileName}";
                }

                return string.Empty;
            }
            else
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", basePath);
                var entityFolder = Path.Combine(baseFolder, entityId.ToString());

                if (!Directory.Exists(entityFolder))
                {
                    Directory.CreateDirectory(entityFolder);
                }

                var filePath = Path.Combine(entityFolder, file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Path.Combine("Uploads", basePath, entityId.ToString(), file.FileName);
            }
        }

        public async Task<string> ReplaceFileAsync(IFormFile? newFile, string? oldFilePath, string basePath, long entityId, HttpContext httpContext)
        {
            if (newFile == null)
                return oldFilePath ?? string.Empty;

            bool isProduction = _configuration.GetValue<bool>("IsProduction");

            if (isProduction)
            {
                var domain = _domainService.GetDomain(httpContext);
                string subDomain = httpContext.Request.Headers["Domain-Name"].ToString();

                var s3Client = new AmazonS3Client();
                var s3Service = new S3Service(s3Client, _configuration, "AWS:Bucket", "AWS:Folder");

                // Delete old file if exists
                if (!string.IsNullOrEmpty(oldFilePath))
                {
                    await s3Service.DeleteFileAsync($"{basePath}/{entityId}", $"{domain}/{subDomain}", Path.GetFileName(oldFilePath));
                }

                // Upload new one
                bool uploaded = await s3Service.UploadFileAsync(newFile, $"{basePath}/{entityId}", $"{domain}/{subDomain}");
                if (uploaded)
                {
                    return $"{_configuration["AWS:Folder"]}/{domain}/{subDomain}/{basePath}/{entityId}/{newFile.FileName}";
                }

                return oldFilePath ?? string.Empty;
            }
            else
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", basePath);
                var entityFolder = Path.Combine(baseFolder, entityId.ToString());

                // Clean old folder
                if (Directory.Exists(entityFolder))
                {
                    Directory.Delete(entityFolder, true);
                }

                Directory.CreateDirectory(entityFolder);

                // Save new file
                var filePath = Path.Combine(entityFolder, newFile.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await newFile.CopyToAsync(stream);
                }

                return Path.Combine("Uploads", basePath, entityId.ToString(), newFile.FileName);
            }
        }
    }
}
