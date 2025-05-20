using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LMS_CMS_PL.Controllers.Domains.ETA
{
    [Route("api/[controller]")]
    [ApiController]
    public class ETAController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public ETAController(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        [HttpGet]
        //#region Report Invoice
        //[HttpPost("ReportInvoice")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public async Task<IActionResult> SendToETA(long masterId)
        {
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

            //string dateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

            string lsonPath = string.Empty;
            if (master.FlagId == 11)
                lsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONInvoices/{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json");
            if (master.FlagId == 12)
                lsonPath = Path.Combine(Directory.GetCurrentDirectory(), $"Invoices/JSONInvoices/{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json");



            return Ok();
        }
    }
}
