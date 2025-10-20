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

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Dashboard" }
        )] 
        public async Task<IActionResult> GetAsync(int year, int? month)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(HttpContext);

            long FollowUpCount = _clinic_Service.CountOfFollowUps(year, month, HttpContext);
            decimal FeesAmount = _account_Service.FeesCalculated(year, month, HttpContext);
            var (NotAnswered, AnsweredOnTime, AnsweredLate) = _lMS_Service.AssignmentSubmissionCount(year, month, HttpContext);
            var (AcceptedCount, DeclinedCount, Pending, WaitingListCount) = _registration_Service.RegistrationFormStateCount(year, month, HttpContext);
            var (AcceptedRequestCount, DeclinedRequestCount, RequestPending) = _communication_Service.RequestStateCount(year, month, HttpContext);
            decimal TotalSalaries = _hr_Service.TotalSalaries(year, month, HttpContext);
            int StudentCountInCurrentActive = _lMS_Service.StudentCount(HttpContext);
            int ClassroomCountInCurrentActive = _lMS_Service.ClassroomCount(HttpContext);
            int InventoryLowItemsToday = await _inventory_Service.LowItemsAsync(HttpContext);
            Dictionary<string, decimal> InventoryPurchase = _inventory_Service.Purchase(year, month, HttpContext);
            Dictionary<string, decimal> InventorySales = _inventory_Service.Sales(year, month, HttpContext);
            var categoryRankings = await _ecommerce_Service.GetTopRequestedItemsByCategoryAsync(year, month, HttpContext);

            return Ok(new
            {
                FollowUpCount,
                FeesAmount,
                SubmissionsCount = new
                {
                    NotAnswered,
                    AnsweredOnTime,
                    AnsweredLate
                },
                RegistrationFormStateCount = new
                {
                    AcceptedCount,
                    DeclinedCount,
                    Pending,
                    WaitingListCount
                },
                RequestStateCount = new
                {
                    AcceptedRequestCount,
                    DeclinedRequestCount,
                    RequestPending
                },
                TotalSalaries,
                StudentCountInCurrentActive,
                ClassroomCountInCurrentActive,
                InventoryLowItemsToday,
                InventoryPurchase,
                InventorySales,
                categoryRankings
            });
        }

    }
}
