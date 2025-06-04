using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AssignmentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee"},
            pages: new[] { "Assignment" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            List<Assignment> Assignment = await Unit_Of_Work.assignment_Repository.Select_All_With_IncludesById<Assignment>(
                    sem => sem.IsDeleted != true,
                    query => query.Include(d => d.AssignmentType),
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.AssignmentClassroomStudents.Where(e => e.IsDeleted != true)));

            if (Assignment == null || Assignment.Count == 0)
            {
                return NotFound();
            }

            List<AssignmentGetDTO> AcademicYearDTOs = mapper.Map<List<AssignmentGetDTO>>(Assignment);

            return Ok(AcademicYearDTOs);
        }
    }
}
