using Amazon.S3.Model;
using Amazon.S3;
using Microsoft.AspNetCore.StaticFiles;
using Amazon.SecretsManager.Model;
using Amazon.SecretsManager;
using Newtonsoft.Json;
using Amazon;

namespace LMS_CMS_PL.Services
{
    public class S3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly IAmazonSecretsManager _secretsManager;
        private readonly string _bucketName;
        private readonly string _folder;
        private readonly string _region;

        public S3Service(IAmazonSecretsManager secretsManager)
        {
            _secretsManager = secretsManager;
        }

        public S3Service(IConfiguration config, string region)
        {
            _region = config[region] ?? "";
        }

        public S3Service(IAmazonS3 s3Client, IConfiguration config, string bucketName, string folder)
        {
            _s3Client = s3Client;
            _bucketName = config[bucketName] ?? throw new ArgumentNullException(bucketName);
            _folder = config[folder] ?? "";
        }

        public async Task<bool> UploadFileAsync(string path, string subDirectory, string domain)
        {
            try
            {
                if (File.Exists(path))
                {
                    using var fileStream = new FileStream(path, FileMode.Open, FileAccess.Read);
                    return await UploadFile(fileStream, Path.GetFileName(path), subDirectory, domain);
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> UploadFilesAsync(string path, string subDirectory, string domain)
        {
            try
            {
                if (Directory.Exists(path))
                {
                    var files = Directory.GetFiles(path, "*", SearchOption.AllDirectories);
                    foreach (var file in files)
                    {
                        var relativePath = Path.GetRelativePath(path, file).Replace("\\", "/");
                        using var fileStream = new FileStream(file, FileMode.Open, FileAccess.Read);
                        await UploadFile(fileStream, relativePath, subDirectory, domain);
                    }

                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        private async Task<bool> UploadFile(FileStream fileStream, string fileName, string subDirectory, string domain)
        {
            var key = $"{domain}/{_folder}{subDirectory}{fileName}";

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = GetContentType(fileStream)
            };

            try
            {
                var response = await _s3Client.PutObjectAsync(request);

                return response.HttpStatusCode == System.Net.HttpStatusCode.OK;
            }
            catch (AmazonS3Exception s3Ex)
            {
                Console.Error.WriteLine($"S3 Error: {s3Ex.Message}");
                return false;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Upload Error: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> CreateOrUpdateSecretAsync(string secretName, string secretValue)
        {
            try
            {
                UpdateSecretRequest updateRequest = new UpdateSecretRequest
                {
                    SecretId = secretName,
                    SecretString = secretValue,
                };

                UpdateSecretResponse updateResponse = await _secretsManager.UpdateSecretAsync(updateRequest);
                return !string.IsNullOrEmpty(updateResponse.ARN);
            }
            catch (ResourceNotFoundException)
            {
                CreateSecretRequest createRequest = new CreateSecretRequest
                {
                    Name = secretName,
                    SecretString = secretValue,
                };

                CreateSecretResponse createResponse = await _secretsManager.CreateSecretAsync(createRequest);
                return !string.IsNullOrEmpty(createResponse.ARN);
            }
            catch (Amazon.SecretsManager.Model.InvalidRequestException)
            {
                CreateSecretRequest createRequest = new CreateSecretRequest
                {
                    Name = secretName,
                    SecretString = secretValue,
                };

                CreateSecretResponse createResponse = await _secretsManager.CreateSecretAsync(createRequest);
                return !string.IsNullOrEmpty(createResponse.ARN);
            }
            catch (Exception ex)
            {
                // Wrap the exception to provide context.
                throw new Exception($"Error creating or updating secret {secretName}: {ex.Message}", ex);
            }
        }

        public async Task<string> GetSecret(string secretName)
        {
            IAmazonSecretsManager client = new AmazonSecretsManagerClient(RegionEndpoint.GetBySystemName(_region));

            GetSecretValueRequest request = new GetSecretValueRequest
            {
                SecretId = secretName,
                VersionStage = "AWSCURRENT",
            };

            GetSecretValueResponse response;

            try
            {
                response = await client.GetSecretValueAsync(request);
            }
            catch (Exception e)
            {
                throw e;
            }

            return response.SecretString;
        }

        private string GetContentType(FileStream fileStream)
        {
            var provider = new FileExtensionContentTypeProvider();

            provider.Mappings[".pem"] = "application/x-pem-file";
            provider.Mappings[".csr"] = "application/pkcs10";
            provider.Mappings[".xml"] = "application/xml";
            provider.Mappings[".json"] = "application/json";

            if (!provider.TryGetContentType(fileStream.Name, out string contentType))
            {
                contentType = "application/octet-stream";
            }

            return contentType;
        }
    }
}
