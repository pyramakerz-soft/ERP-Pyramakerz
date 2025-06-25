using Amazon.S3;
using Amazon.SecretsManager;
using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.Zatca;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.Zatca;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System.Text;
using Zatca.EInvoice.SDK.Contracts;
using Zatca.EInvoice.SDK.Contracts.Models;

namespace LMS_CMS_PL.Controllers.Domains.ZatcaInegration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ZatcaController : ControllerBase
    {
        private readonly ICsrGenerator _csrGenerator;
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IConfiguration _config;
        private readonly IAmazonSecretsManager _secretsManager;
        private readonly DomainService _domainService;
        private readonly IMapper _mapper;

        public ZatcaController(ICsrGenerator csrGenerator, DbContextFactoryService dbContextFactory, IConfiguration config, IAmazonSecretsManager secretsManager, DomainService domainService, IMapper mapper)
        {
            _csrGenerator = csrGenerator;
            _dbContextFactory = dbContextFactory;
            _config = config;
            _secretsManager = secretsManager;
            _domainService = domainService;
            _mapper = mapper;
        }

        #region Generate PCSID
        [HttpPost("GeneratePCSID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Zatca Electronic-Invoice" }
        )]
        public async Task<IActionResult> GeneratePCSID(long otp, long schoolPcId)
        {
            string certificates = Path.Combine(Directory.GetCurrentDirectory(), "Invoices/Certificates");

            if (!Directory.Exists(certificates)) 
                Directory.CreateDirectory(certificates);

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            SchoolPCs schoolPc = await Unit_Of_Work.schoolPCs_Repository.FindByIncludesAsync(
                d => d.ID == schoolPcId && d.IsDeleted != true,
                query => query.Include(s => s.School)
            );

            if (schoolPc is null)
                return NotFound("School PC not found.");

            string commonName = schoolPc.School.Name;
            string serialNumber = $"1-{schoolPcId}|2-{schoolPc.PCName}|3-{schoolPc.SerialNumber}";
            string organizationIdentifier = schoolPc.School.VatNumber;
            string organizationUnitName = schoolPc.School.Name;
            string organizationName = schoolPc.School.Name;
            string countryName = "SA";
            string invoiceType = "0100";
            string locationAddress = schoolPc.School.City;
            string industryBusinessCategory = "Learning";

            CsrGenerationDto csrGeneration = new(
                commonName,
                serialNumber,
                organizationIdentifier,
                organizationUnitName,
                organizationName,
                countryName,
                invoiceType,
                locationAddress,
                industryBusinessCategory
            );

            string pcName = $"PC{schoolPc.ID}_{schoolPc.School.ID}";

            //S3Service s3SecretManager = new S3Service(_secretsManager);

            var csrSteps = ZatcaServices.GenerateCSRandPrivateKey(csrGeneration);

            string csrContent = csrSteps[1].ResultedValue;
            //string csrPath = Path.Combine(certificates, $"{pcName}_CSR.csr");
            //System.IO.File.WriteAllText(csrPath, csrContent);

            string privateKeyContent = csrSteps[2].ResultedValue;
            //string privateKeyPath = Path.Combine(certificates, $"{pcName}_PrivateKey.pem");
            //System.IO.File.WriteAllText(privateKeyPath, privateKeyContent);

            //bool addCSR = await s3SecretManager.CreateOrUpdateSecretAsync($"{pcName}CSR", csrContent);
            //if (!addCSR)
            //    return BadRequest("Adding CSR failed!");

            //bool addPrivateKey = await s3SecretManager.CreateOrUpdateSecretAsync($"{pcName}PrivateKey", privateKeyContent);
            //if (!addPrivateKey)
            //    return BadRequest("Adding Private Key failed!");

            //await InvoicingServices.GeneratePublicKey(publicKeyPath, privateKeyPath);

            string version = _config.GetValue<string>("ZatcaVersion");

            string csrPayload = Convert.ToBase64String(Encoding.UTF8.GetBytes(csrContent));
            var csrObj = new { csr = csrPayload };
            string csrJson = JsonConvert.SerializeObject(csrObj);

            string csid = await ZatcaServices.GenerateCSID(csrJson, otp, version, _config);

            //bool addCSID = await s3SecretManager.CreateOrUpdateSecretAsync($"{pcName}CSID", csid);

            //if (!addCSID)
            //    return BadRequest("Adding CSID failed!");

            dynamic csidJson = JsonConvert.DeserializeObject(csid);

            string user = csidJson.binarySecurityToken;
            string secret = csidJson.secret;

            string token = $"{user}:{secret}";
            byte[] tokenBytes = Encoding.UTF8.GetBytes(token);
            string tokenBase64 = Convert.ToBase64String(tokenBytes);

            string requestId = csidJson.requestID.ToString();

            string pcsid = await ZatcaServices.GeneratePCSID(tokenBase64, version, requestId, _config);

            //bool addPCSID = await s3SecretManager.CreateOrUpdateSecretAsync($"{pcName}PCSID", pcsid);

            //if (!addPCSID)
            //    return BadRequest("Adding PCSID failed!");

            string certificateDate = ZatcaServices.GetCertificateDate(pcsid);

            schoolPc.CertificateDate = DateOnly.Parse(certificateDate);
            schoolPc.UpdatedAt = DateTime.Now;

            Unit_Of_Work.schoolPCs_Repository.Update(schoolPc);
            Unit_Of_Work.SaveChanges();

            return Ok(certificateDate);
        }
        #endregion

        #region Update PCSID
        //[HttpPost("UpdatePCSID")]
        ////[Authorize_Endpoint_(
        ////    allowedTypes: new[] { "octa", "employee" },
        ////    pages: new[] { "" }
        ////)]
        //public async Task<IActionResult> UpdatePCSID(string version, long otp, long schoolPcId)
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    SchoolPCs schoolPc = await Unit_Of_Work.schoolPCs_Repository.FindByIncludesAsync(
        //        d => d.ID == schoolPcId && d.IsDeleted != true,
        //        query => query.Include(s => s.School)
        //    );

        //    if (schoolPc is null)
        //        return NotFound("School PC not found.");

        //    string invoices = Path.Combine(Directory.GetCurrentDirectory(), "Invoices/CSR");
        //    string csrPath = Path.Combine(invoices, "CSR.csr");
        //    string csidPath = Path.Combine(invoices, "CSID.json");
        //    string pcsidPath = Path.Combine(invoices, "PCSID.json");

        //    string pcName = $"PC{schoolPc.ID}{schoolPc.School.ID}";

        //    S3Service s3 = new S3Service(_config, "AWS:Region");
        //    string csrContent = await s3.GetSecret($"{pcName}CSR");

        //    string csrPayload = Convert.ToBase64String(Encoding.UTF8.GetBytes(csrContent));
        //    var csrObj = new { csr = csrPayload };
        //    string csrJson = JsonConvert.SerializeObject(csrObj);

        //    string csid = await InvoicingServices.GenerateCSID(csrJson, otp, version, _config);



        //    dynamic csidJson = JsonConvert.DeserializeObject(csid);
        //    string formattedCsid = JsonConvert.SerializeObject(csidJson, Newtonsoft.Json.Formatting.Indented);
        //    await System.IO.File.WriteAllTextAsync(csidPath, formattedCsid);

        //    string oldPcsidContent = await System.IO.File.ReadAllTextAsync(pcsidPath);
        //    dynamic oldPcsidJson = JsonConvert.DeserializeObject(oldPcsidContent);
        //    string formattedOldPcsid = JsonConvert.SerializeObject(oldPcsidJson, Newtonsoft.Json.Formatting.Indented);

        //    string user = oldPcsidJson.binarySecurityToken;
        //    string secret = oldPcsidJson.secret;

        //    string token = $"{user}:{secret}";
        //    byte[] tokenBytes = Encoding.UTF8.GetBytes(token);
        //    string tokenBase64 = Convert.ToBase64String(tokenBytes);

        //    string csrContent = await System.IO.File.ReadAllTextAsync(csrPath);

        //    string csrContentEncoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(csrContent));

        //    string pcsid = await InvoicingServices.UpdatePCSID(tokenBase64, csrContentEncoded, version, otp.ToString(), _config);

        //    string formattedPcsid = JsonConvert.SerializeObject(JsonConvert.DeserializeObject(pcsid), Newtonsoft.Json.Formatting.Indented);

        //    await System.IO.File.WriteAllTextAsync(pcsidPath, formattedPcsid);

        //    return Ok(formattedPcsid);
        //}
        #endregion

        #region Report Invoice
        [HttpPost("ReportInvoice")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Zatca Electronic-Invoice" }
        )]
        public async Task<IActionResult> ReportInvoice(long masterId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            InventoryMaster master = await Unit_Of_Work.inventoryMaster_Repository.FindByIncludesAsync(
                d => d.ID == masterId &&
                d.IsDeleted != true &&
                (d.FlagId == 11 || d.FlagId == 12),
                query => query.Include(s => s.School)
            );

            if (master is null)
                return NotFound("Invoice not found.");

            SchoolPCs pc = Unit_Of_Work.schoolPCs_Repository.First_Or_Default(
                d => d.ID == master.SchoolPCId && d.IsDeleted != true
            );

            if (pc == null)
            {
                return NotFound("PC not found.");
            }

            if (pc.CertificateDate == null)
            {
                return BadRequest("Please Create the Certificate.");
            }

            if (pc.CertificateDate.Value <= DateOnly.FromDateTime(DateTime.Now.AddDays(1)))
            {
                return BadRequest("Please Update the Certificate.");
            }

            string dateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            string date = DateTime.Parse(dateTime).ToString("yyyy-MM-dd");
            string time = DateTime.Parse(dateTime).ToString("HH:mm:ss").Replace(":", "");

            string xmlPath = string.Empty;
            if (master.FlagId == 11)
                xmlPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/XMLInvoices");

            if (master.FlagId == 12)
                xmlPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/XMLCredits");

            if (master.IsValid == 0 || master.IsValid == null)
            {
                string pcName = $"PC{master.SchoolPCId}{master.School?.ID}";

                AmazonS3Client secretS3Client = new AmazonS3Client();
                S3Service s3 = new S3Service(_config, "AWS:Region");

                InventoryMaster lastMaster = Unit_Of_Work.inventoryMaster_Repository
                    .SelectQuery<InventoryMaster>(i => i.IsDeleted != true && (i.FlagId == 11 || i.FlagId == 12))
                    .OrderByDescending(i => i.ID)
                    .FirstOrDefault();

                string lastInvoiceHash = "";
                if (master.FlagId == 11 || master.FlagId == 12)
                    lastInvoiceHash = lastMaster?.InvoiceHash;

                bool result = await ZatcaServices.GenerateInvoiceXML(xmlPath, master, lastInvoiceHash, s3, dateTime);

                if (!result)
                    return BadRequest("Failed to generate XML file.");

                string certContent = await s3.GetSecret($"{pcName}PCSID");

                dynamic certObject = JsonConvert.DeserializeObject(certContent);
                string token = certObject.binarySecurityToken;
                string secret = certObject.secret;

                HttpResponseMessage response = await ZatcaServices.InvoiceReporting(xmlPath, token, secret, _config);
                response.EnsureSuccessStatusCode();

                string responseContent = await response.Content.ReadAsStringAsync();
                dynamic responseJson = JsonConvert.DeserializeObject(responseContent);
                master.Status = responseJson.reportingStatus;

                if (response.IsSuccessStatusCode)
                {
                    master.IsValid = 1;
                }
                else
                {
                    master.IsValid = 0;
                }

                Unit_Of_Work.inventoryMaster_Repository.Update(master);
                Unit_Of_Work.SaveChanges();

                //var request = HttpContext.Request;
                //var domain = request.Host.Host;
                //var hostParts = request.Host.Value.Split('.');
                //string subDomain = hostParts.Length > 2 ? hostParts[0] : "test";

                var domain = _domainService.GetDomain(HttpContext);
                string subDomainValue = _domainService.GetSubdomain(HttpContext);
                string subDomain = !subDomainValue.IsNullOrEmpty() ? subDomainValue : "test";

                S3Service s3Client = new S3Service(secretS3Client, _config, "AWS:Bucket", "AWS:Folder");

                string subDirectory = string.Empty;
                if (master.FlagId == 11)
                    subDirectory = "Invoices/";
                else if (master.FlagId == 12)
                    subDirectory = "Credits/";

                bool uploaded = await s3Client.UploadAsync(xmlPath, subDirectory, $"{domain}/{subDomain}");

                if (!uploaded)
                    return BadRequest("Uploading Invoice failed!");

                xmlPath = Path.Combine(xmlPath, $"{master.School.CRN}_{date.Replace("-", "")}T{time.Replace(":", "")}_{date}-{master.StoreID}_{master.FlagId}_{master.ID}.xml");

                if (System.IO.File.Exists(xmlPath))
                {
                    System.IO.File.Delete(xmlPath);
                }
            }

            return master.IsValid == 1 ? Ok(master.Status) : BadRequest(master.Status);
        }
        #endregion

        #region Report Invoices
        [HttpPost("ReportInvoices")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Zatca Electronic-Invoice" }
        )]
        public async Task<IActionResult> ReportInvoices(InvoiceSubmitDTO dto)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<InventoryMaster> masters = new();
            if (dto.selectedInvoices == null)
            {
                masters = await Unit_Of_Work.inventoryMaster_Repository.Select_All_With_IncludesById<List<InventoryMaster>>(
                    d => d.SchoolId == dto.schoolId &&
                    d.IsDeleted != true &&
                    (d.FlagId == 11 || d.FlagId == 12),
                    query => query.Include(s => s.School)
                );

                if (masters is null || masters.Count == 0)
                    return NotFound("No invoices found.");
            }
            else
            {
                InventoryMaster master = new();
                foreach (var invId in dto.selectedInvoices)
                {
                    master = Unit_Of_Work.inventoryMaster_Repository.First_Or_Default(x => x.ID == invId);

                    if (master != null)
                        masters.Add(master);
                }
            }            

            //var request = HttpContext.Request;
            //var domain = request.Host.Host;
            //var hostParts = request.Host.Value.Split('.');
            //string subDomain = hostParts.Length > 2 ? hostParts[0] : "test";

            var domain = _domainService.GetDomain(HttpContext);
            string subDomainValue = _domainService.GetSubdomain(HttpContext);
            string subDomain = !subDomainValue.IsNullOrEmpty() ? subDomainValue : "test";

            if (masters != null && masters.Count > 0)
            {
                foreach (var master in masters)
                {
                    SchoolPCs pc = Unit_Of_Work.schoolPCs_Repository.First_Or_Default(
                    d => d.ID == master.SchoolPCId && d.IsDeleted != true
                    );

                    if (pc == null)
                    {
                        return NotFound("PC not found.");
                    }

                    if (pc.CertificateDate == null)
                    {
                        return BadRequest("Please Create the Certificate.");
                    }

                    if (pc.CertificateDate.Value <= DateOnly.FromDateTime(DateTime.Now.AddDays(1)))
                    {
                        return BadRequest("Please Update the Certificate.");
                    }

                    if (master.IsValid == 0 || master.IsValid == null)
                    {
                        try
                        {
                            string dateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                            string date = DateTime.Parse(dateTime).ToString("yyyy-MM-dd");
                            string time = DateTime.Parse(dateTime).ToString("HH:mm:ss").Replace(":", "");

                            string xmlPath = string.Empty;
                            if (master.FlagId == 11)
                                xmlPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/XMLInvoices");

                            if (master.FlagId == 12)
                                xmlPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/XMLCredits");

                            if (master.IsValid == 0 || master.IsValid == null)
                            {
                                string pcName = $"PC{master.SchoolPCId}{master.School?.ID}";

                                AmazonS3Client secretS3Client = new AmazonS3Client();
                                S3Service s3 = new S3Service(_config, "AWS:Region");

                                InventoryMaster? lastMaster = Unit_Of_Work.inventoryMaster_Repository
                                    .SelectQuery<InventoryMaster>(i => i.IsDeleted != true && (i.FlagId == 11 || i.FlagId == 12))
                                    .OrderByDescending(i => i.ID)
                                    .FirstOrDefault();

                                string lastInvoiceHash = "";
                                if (master.FlagId == 11 || master.FlagId == 12)
                                    lastInvoiceHash = lastMaster?.InvoiceHash;

                                bool result = await ZatcaServices.GenerateInvoiceXML(xmlPath, master, lastInvoiceHash, s3, dateTime);

                                if (!result)
                                    return BadRequest("Failed to generate XML file.");

                                string certContent = await s3.GetSecret($"{pcName}PCSID");

                                dynamic certObject = JsonConvert.DeserializeObject(certContent);
                                string token = certObject.binarySecurityToken;
                                string secret = certObject.secret;

                                HttpResponseMessage response = await ZatcaServices.InvoiceReporting(xmlPath, token, secret, _config);
                                response.EnsureSuccessStatusCode();

                                string responseContent = await response.Content.ReadAsStringAsync();
                                dynamic responseJson = JsonConvert.DeserializeObject(responseContent);
                                master.Status = responseJson.reportingStatus;

                                if (response.IsSuccessStatusCode)
                                {
                                    master.IsValid = 1;
                                }
                                else
                                {
                                    master.IsValid = 0;
                                }

                                Unit_Of_Work.inventoryMaster_Repository.Update(master);
                                Unit_Of_Work.SaveChanges();

                                S3Service s3Client = new S3Service(secretS3Client, _config, "AWS:Bucket", "AWS:Folder");

                                string subDirectory = string.Empty;
                                if (master.FlagId == 11)
                                    subDirectory = "Invoices/";
                                else if (master.FlagId == 12)
                                    subDirectory = "Credits/";

                                bool uploaded = await s3Client.UploadAsync(xmlPath, subDirectory, $"{domain}/{subDomain}");

                                if (!uploaded)
                                    return BadRequest("Uploading Invoice failed!");

                                xmlPath = Path.Combine(xmlPath, $"{master.School.CRN}_{date.Replace("-", "")}T{time.Replace(":", "")}_{date}-{master.StoreID}_{master.FlagId}_{master.ID}.xml");

                                if (System.IO.File.Exists(xmlPath))
                                {
                                    System.IO.File.Delete(xmlPath);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            return BadRequest($"Error reporting invoice {master.ID}: {ex.Message}");
                        }
                    }
                }
            }

            Unit_Of_Work.SaveChanges();

            return Ok();
        }
        #endregion

        #region Filter by School and Date
        [HttpGet("FilterBySchoolAndDate")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Zatca Electronic-Invoice" }
        )]
        public async Task<IActionResult> FilterBySchoolAndDate(long schoolId, string startDate, string endDate, int pageNumber = 1, int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            string[] sdParts = startDate.Split("/");
            Array.Reverse(sdParts);
            startDate = string.Join("-", sdParts);

            string[] edParts = endDate.Split("/");
            Array.Reverse(edParts);
            endDate = string.Join("-", edParts);

            DateTime.TryParse(startDate, out DateTime start);
            DateTime.TryParse(endDate, out DateTime end);

            start = start.Date;
            end = end.Date;

            if (end < start)
                return BadRequest("Start date must be equal or greater than End date");
            
            int totalRecords = await Unit_Of_Work.inventoryMaster_Repository
               .CountAsync(f => f.IsDeleted != true && (f.FlagId == 11 || f.FlagId == 12));

            List<InventoryMaster> mastersBySchool = await Unit_Of_Work.inventoryMaster_Repository.SelectQuery<InventoryMaster>(
                d => d.SchoolId == schoolId && 
                d.IsDeleted != true &&
                (d.FlagId == 11 || d.FlagId == 12))
                .ToListAsync();

            if (mastersBySchool is null || mastersBySchool.Count == 0)
                return NotFound("No invoices found.");

            List<InventoryMaster> mastersByDate = mastersBySchool
                .Where(d => DateTime.Parse(d.Date).Date >= start && DateTime.Parse(d.Date).Date <= end)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            if (mastersByDate is null || mastersByDate.Count == 0)
                return NotFound("No invoices found.");

            List<InventoryMasterGetDTO> DTO = _mapper.Map<List<InventoryMasterGetDTO>>(mastersByDate);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTO, Pagination = paginationMetadata });
        }
        #endregion
    }
}