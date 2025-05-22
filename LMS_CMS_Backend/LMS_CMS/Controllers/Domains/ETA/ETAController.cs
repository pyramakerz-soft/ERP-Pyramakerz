using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.ETA;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Text;

namespace LMS_CMS_PL.Controllers.Domains.ETA
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class ETAController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public ETAController(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        [HttpPost("SendToETA")]
        //#region Report Invoice
        //[HttpPost("ReportInvoice")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> SendToETA(long masterId)
        {
            string apiBaseUrl = "https://api.invoicing.eta.gov.eg";
            string idSrvBaseUrl = "https://id.eta.gov.eg";

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            InventoryMaster master = await Unit_Of_Work.inventoryMaster_Repository.FindByIncludesAsync(
                d => d.ID == masterId &&
                d.IsDeleted != true &&
                (d.FlagId == 11 || d.FlagId == 12) &&
                d.IsDeleted != true,
                query => query.Include(s => s.TaxIssuer)
            );

            if (master is null)
                return NotFound("Invoice not found.");

            string token = EtaServices.Login(Unit_Of_Work, master.School.ID);

            //string dateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

            string jsonPath = string.Empty;
            if (master.FlagId == 11)
                jsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONInvoices/{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json");
            if (master.FlagId == 12)
                jsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONInvoices/{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json");

            if (master.IsValid == 0 || master.IsValid == null)
            {
                string signedJson = System.IO.File.ReadAllText(jsonPath);
                byte[] jsonDataBytes = Encoding.UTF8.GetBytes(signedJson);

                string result = string.Empty;

                if (string.IsNullOrEmpty(token))
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

            return Ok();
        }
    }
}
