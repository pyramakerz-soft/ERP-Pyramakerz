using AutoMapper;
using LMS_CMS_BL.DTO.Inventory;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_DAL.Models.Domains.Inventory;
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
    //[Authorize]
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
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> SubmitInvoice(long masterId, int etaPosID = 0)
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
                return NotFound("Invoice not found.");

            ETAPOS etaPos = Unit_Of_Work.pos_Repository.First_Or_Default(x => x.ID == etaPosID && x.IsDeleted != true);

            if (etaPos is null)
                return NotFound("ETAPOS not found.");

            string token = EtaServices.Login(Unit_Of_Work, master.School.ID);

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

            return Ok();
        }
        #endregion

        #region Submit Invoice
        [HttpPost("SendInvoices")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> SendInvoices(long schoolId)
        {
            string apiBaseUrl = "https://api.invoicing.eta.gov.eg";
            string idSrvBaseUrl = "https://id.eta.gov.eg";

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<InventoryMaster> masters = await Unit_Of_Work.inventoryMaster_Repository.Select_All_With_IncludesById<List<InventoryMaster>>(
                d => d.SchoolId == schoolId &&
                (d.FlagId == 11 || d.FlagId == 12) &&
                d.IsDeleted != true,
                query => query.Include(s => s.TaxIssuer),
                query => query.Include(s => s.School),
                query => query.Include(s => s.Student),
                query => query.Include(s => s.InventoryDetails)
                    .ThenInclude(detail => detail.ShopItem)
            );

            if (masters is null || masters.Count == 0)
                return NotFound("Invoice not found.");

            string token = EtaServices.Login(Unit_Of_Work, schoolId);

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

            return Ok();
        }
        #endregion

        #region Filter by School and Date
        [HttpPost("FilterBySchoolAndDate")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> FilterBySchoolAndDate(long schoolId, string startDate, string endDate, int pageNumber = 1, int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DateTime start = DateTime.Parse(startDate).Date;
            DateTime end = DateTime.Parse(endDate).Date;

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

            List<InventoryMasterGetDTO> DTO = _mapper.Map<List<InventoryMasterGetDTO>>(mastersByDate);

            return Ok(DTO);
        }
        #endregion

        #region Submit Receipt
        [HttpPost("SubmitReceipt")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> SubmitReceipt(long masterId, int etaPosID)
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
                return NotFound("Invoice not found.");

            ETAPOS etaPos = Unit_Of_Work.pos_Repository.First_Or_Default(x => x.ID == etaPosID && x.IsDeleted != true);

            if (etaPos is null)
                return NotFound("ETAPOS not found.");

            string token = EtaServices.Login(Unit_Of_Work, master.School.ID);

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
                    //result = EtaServices.receiptsubmissions(new Uri(apiBaseUrl + "/api/v1/documentsubmissions"), jsonDataBytes, "application/json", "POST", token);
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

            return Ok();
        }
        #endregion
    }
}
