using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassroomSubjectController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory; 
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ClassroomSubjectController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpPost("Generate/{classsId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Subject" }
        )]
        public async Task<IActionResult> GetAsync(long classsId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.ID == classsId && d.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("No Class with this ID");
            }  

            return Ok();
        }
    }
}
