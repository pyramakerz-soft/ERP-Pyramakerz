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

        public DashboardController(DbContextFactoryService dbContextFactory, IMapper mapper, Clinic_Service clinic_Service)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
            _clinic_Service = clinic_Service;
        }

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Dashboard" }
        )]
        public IActionResult Get(int year, int? month)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            long followUpCount = _clinic_Service.CountOfFollowUps(year, month, HttpContext);

            return Ok(followUpCount);
        }
    }
}
