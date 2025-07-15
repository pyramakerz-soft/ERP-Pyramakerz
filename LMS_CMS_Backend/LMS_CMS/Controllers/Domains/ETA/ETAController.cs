using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.ETA;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Text;

namespace LMS_CMS_PL.Controllers.Domains.ETA
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ETAController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;

        public ETAController(DbContextFactoryService dbContextFactory, IConfiguration config, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _config = config;
            _mapper = mapper;
        }

        #region Submit Invoice
        [HttpPost("SubmitInvoice")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "ETA Electronic-Invoice" }
        )]
        public async Task<IActionResult> SubmitInvoice(long masterId, int etaPosID = 0, long salesInvoiceId = 0)
        {
            string apiBaseUrl = "https://api.invoicing.eta.gov.eg";
            string idSrvBaseUrl = "https://id.eta.gov.eg";

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            InventoryMaster master = await Unit_Of_Work.inventoryMaster_Repository.FindByIncludesAsync(
                d => d.ID == masterId &&
                (d.FlagId == 11 || d.FlagId == 12) &&
                d.IsDeleted != true,
                query => query.Include(s => s.TaxIssuer),
                query => query.Include(s => s.School),
                query => query.Include(s => s.Student),
                query => query.Include(s => s.InventoryDetails)
                    .ThenInclude(detail => detail.ShopItem)
            );

            if (master is null)
                return NotFound("No Invoice found.");

            string dateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

            string inv = $"{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json";

            string jsonPath = string.Empty;
            if (master.FlagId == 11)
                jsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONInvoices/{inv}");
            if (master.FlagId == 12)
                jsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONCredits/{inv}");


            if (master.InvoiceType == 'P')
            {
                string token = EtaServices.AuthenticatePOS(Unit_Of_Work, etaPosID);

                string result = string.Empty;

                if (!string.IsNullOrEmpty(token))
                {
                    result = EtaServices.receiptsubmissions(Unit_Of_Work, master, salesInvoiceId);
                }
            }

            if (master.InvoiceType == 'B')
            {
                if (master.School == null)
                    return NotFound("School not found");

                string token = EtaServices.Login(master.School);
                bool jsonResult = EtaServices.GenerateJsonInvoice(master, Unit_Of_Work, _config, dateTime);

                if (master.IsValid == 0 || master.IsValid == null)
                {
                    string signedJson = System.IO.File.ReadAllText(jsonPath);
                    byte[] jsonDataBytes = Encoding.UTF8.GetBytes(signedJson);

                    string result = string.Empty;

                    if (!string.IsNullOrEmpty(token))
                    {
                        result = EtaServices.PostRequest(new Uri(apiBaseUrl + "/api/v1/documentsubmissions"), jsonDataBytes, "application/json", "POST", token);
                    }

                    if (!string.IsNullOrEmpty(result))
                    {
                        dynamic result0 = JsonConvert.DeserializeObject(result);

                        if (result0.acceptedDocuments.Count > 0)
                        {
                            string uuid = result0.acceptedDocuments[0].uuid;
                            string longId = result0.acceptedDocuments[0].longId;

                            master.uuid = uuid;
                            master.ShareLongId = longId;
                            master.IsValid = 1;
                            master.EtaInsertedDate = DateTime.Parse(dateTime);

                            Unit_Of_Work.inventoryMaster_Repository.Update(master);
                            await Unit_Of_Work.SaveChangesAsync();

                            return Ok(new { uuid, longId });
                        }

                        if (result0.rejectedDocuments.Count > 0)
                        {
                            string msg = "";

                            foreach (var detail in result0.rejectedDocuments[0].error.details)
                            {
                                msg += $"{detail.propertyPath} - {detail.message}\r\n";
                            }

                            return BadRequest(new { msg });
                        }
                    }
                }
            }

            if (System.IO.File.Exists(jsonPath))
                System.IO.File.Delete(jsonPath);

            return Ok();
        }
        #endregion

        #region Submit Invoices
        [HttpPost("SubmitInvoices")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "ETA Electronic-Invoice" }
        )]
        public async Task<IActionResult> SubmitInvoices([FromBody] InvoiceSubmitDTO dto)
        {
            string apiBaseUrl = "https://api.invoicing.eta.gov.eg";
            string idSrvBaseUrl = "https://id.eta.gov.eg";

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<InventoryMaster> masters = new();

            if (dto.selectedInvoices == null)
            {
                masters = await Unit_Of_Work.inventoryMaster_Repository.Select_All_With_IncludesById<List<InventoryMaster>>(
                    d => d.SchoolId == dto.schoolId &&
                    (d.FlagId == 11 || d.FlagId == 12) &&
                    d.IsDeleted != true,
                    query => query.Include(s => s.TaxIssuer),
                    query => query.Include(s => s.School),
                    query => query.Include(s => s.Student),
                    query => query.Include(s => s.InventoryDetails)
                        .ThenInclude(detail => detail.ShopItem)
                );

                if (masters is null || masters.Count == 0)
                    return NotFound("No Invoices found.");
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

            School school = Unit_Of_Work.school_Repository.First_Or_Default(x => x.ID == dto.schoolId && x.IsDeleted != true);

            if (school is null)
                return NotFound("School not found.");

            string token = EtaServices.Login(school);

            if (masters != null || masters?.Count > 0)
            {
                foreach (var master in masters)
                {
                    string dateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

                    bool jsonResult = EtaServices.GenerateJsonInvoice(master, Unit_Of_Work, _config, dateTime);

                    string inv = $"{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json";

                    string jsonPath = string.Empty;
                    if (master.FlagId == 11)
                        jsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONInvoices/{inv}");
                    if (master.FlagId == 12)
                        jsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONCredits/{inv}");

                    if (master.IsValid == 0 || master.IsValid == null)
                    {
                        string signedJson = System.IO.File.ReadAllText(jsonPath);
                        byte[] jsonDataBytes = Encoding.UTF8.GetBytes(signedJson);

                        string result = string.Empty;

                        if (!string.IsNullOrEmpty(token))
                        {
                            result = EtaServices.PostRequest(new Uri(apiBaseUrl + "/api/v1/documentsubmissions"), jsonDataBytes, "application/json", "POST", token);
                        }

                        if (!string.IsNullOrEmpty(result))
                        {
                            dynamic result0 = JsonConvert.DeserializeObject(result);

                            if (result0.acceptedDocuments.Count > 0)
                            {
                                string uuid = result0.acceptedDocuments[0].uuid;
                                string longId = result0.acceptedDocuments[0].longId;

                                master.uuid = uuid;
                                master.ShareLongId = longId;
                                master.IsValid = 1;
                                master.EtaInsertedDate = DateTime.Parse(dateTime);

                                Unit_Of_Work.inventoryMaster_Repository.Update(master);
                                await Unit_Of_Work.SaveChangesAsync();

                                return Ok(new { uuid, longId });
                            }

                            if (result0.rejectedDocuments.Count > 0)
                            {
                                string msg = "";

                                foreach (var detail in result0.rejectedDocuments[0].error.details)
                                {
                                    msg += $"{detail.propertyPath} - {detail.message}\r\n";
                                }

                                return BadRequest(new { msg });
                            }
                        }
                    }

                    if (System.IO.File.Exists(jsonPath))
                        System.IO.File.Delete(jsonPath);
                }
            }

            return Ok();
        }
        #endregion

        #region Filter by School and Date
        [HttpGet("FilterBySchoolAndDate")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "ETA Electronic-Invoice" }
        )]
        public async Task<IActionResult> FilterBySchoolAndDate(long schoolId, DateTime startDate, DateTime endDate, int pageNumber = 1, int pageSize = 10)
        {

            if (endDate < startDate)
                return BadRequest("Start date must be equal or greater than End date");

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            int totalRecords = await Unit_Of_Work.inventoryMaster_Repository
               .CountAsync(f => f.IsDeleted != true && (f.FlagId == 11 || f.FlagId == 12));

            List<InventoryMaster> result = await Unit_Of_Work.inventoryMaster_Repository.Select_All_With_IncludesById_Pagination<InventoryMaster>(
                d => d.SchoolId == schoolId &&
                d.IsDeleted != true &&
                (d.FlagId == 11 || d.FlagId == 12) &&
                d.Date.Date >= startDate && d.Date.Date <= endDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (result is null || result.Count == 0)
                return NotFound("No invoices found.");

            List<InventoryMasterGetDTO> DTO = _mapper.Map<List<InventoryMasterGetDTO>>(result);

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
