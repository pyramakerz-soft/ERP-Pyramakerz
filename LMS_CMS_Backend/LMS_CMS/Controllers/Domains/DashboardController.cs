using AutoMapper;
using LMS_CMS_PL.Services.FileValidations;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LMS_CMS_PL.Services.Dashboard;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_PL.Attribute;

namespace LMS_CMS_PL.Controllers.Domains
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper; 
        private readonly Clinic_Service _clinic_Service;
        private readonly Accounting_Service _account_Service;
        private readonly LMS_Service _lMS_Service;
        private readonly Registration_Service _registration_Service;
        private readonly Communication_Service _communication_Service;
        private readonly HR_Service _hr_Service;
        private readonly Inventory_Service _inventory_Service;
        private readonly ECommerce_Service _ecommerce_Service;

        public DashboardController(DbContextFactoryService dbContextFactory, IMapper mapper, Clinic_Service clinic_Service, Accounting_Service accounting_Service, LMS_Service lMS_Service, 
            Registration_Service registration_Service, Communication_Service communication_Service, HR_Service hr_Service, Inventory_Service inventory_Service, ECommerce_Service ecommerce_Service)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _clinic_Service = clinic_Service;
            _account_Service = accounting_Service;
            _lMS_Service = lMS_Service;
            _registration_Service = registration_Service;
            _communication_Service = communication_Service;
            _hr_Service = hr_Service;
            _inventory_Service = inventory_Service;
            _ecommerce_Service = ecommerce_Service;
        }

        [HttpGet("GetTodaysData")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Dashboard" }
        )] 
        public async Task<IActionResult> GetAsync()
        { 
            int StudentCountInCurrentActive = _lMS_Service.StudentCount(HttpContext);
            int ClassroomCountInCurrentActive = _lMS_Service.ClassroomCount(HttpContext);
            int InventoryLowItemsToday = await _inventory_Service.LowItemsAsync(HttpContext);

            return Ok(new
            { 
                StudentCountInCurrentActive,
                ClassroomCountInCurrentActive,
                InventoryLowItemsToday
            });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////// 
        
        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }, 
            pages: new[] { "Dashboard" }
        )]
        public async Task<IActionResult> GetAsync(int year, int? month)
        { 
            var followUpTask = Task.Run(() => _clinic_Service.CountOfFollowUps(year, month, HttpContext));
            var feesTask = Task.Run(() => _account_Service.FeesCalculated(year, month, HttpContext));
            var submissionsTask = Task.Run(() => _lMS_Service.AssignmentSubmissionCount(year, month, HttpContext));
            var registrationTask = Task.Run(() => _registration_Service.RegistrationFormStateCount(year, month, HttpContext));
            var requestTask = Task.Run(() => _communication_Service.RequestStateCount(year, month, HttpContext));
            var salariesTask = Task.Run(() => _hr_Service.TotalSalaries(year, month, HttpContext));
            var purchaseTask = Task.Run(() => _inventory_Service.Purchase(year, month, HttpContext));
            var salesTask = Task.Run(() => _inventory_Service.Sales(year, month, HttpContext));
            var categoryTask = _ecommerce_Service.GetTopRequestedItemsByCategoryAsync(year, month, HttpContext); // already async

            // Wait for all to finish together
            await Task.WhenAll(followUpTask, feesTask, submissionsTask, registrationTask, requestTask,
                               salariesTask, purchaseTask, salesTask, categoryTask);

            // Extract results
            long FollowUpCount = followUpTask.Result;
            decimal FeesAmount = feesTask.Result;
            var (NotAnswered, AnsweredOnTime, AnsweredLate) = submissionsTask.Result;
            var (AcceptedCount, DeclinedCount, Pending, WaitingListCount) = registrationTask.Result;
            var (AcceptedRequestCount, DeclinedRequestCount, RequestPending) = requestTask.Result;
            decimal TotalSalaries = salariesTask.Result;
            Dictionary<string, decimal> InventoryPurchase = purchaseTask.Result;
            Dictionary<string, decimal> InventorySales = salesTask.Result;
            var categoryRankings = categoryTask.Result;

            return Ok(new
            {
                FollowUpCount,
                FeesAmount,
                SubmissionsCount = new { NotAnswered, AnsweredOnTime, AnsweredLate },
                RegistrationFormStateCount = new { AcceptedCount, DeclinedCount, Pending, WaitingListCount },
                RequestStateCount = new { AcceptedRequestCount, DeclinedRequestCount, RequestPending },
                TotalSalaries,
                InventoryPurchase,
                InventorySales,
                categoryRankings
            });
        }

    }
}
