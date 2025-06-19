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
    public class AssignmentStudentQuestionController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AssignmentStudentQuestionController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////////////////////////////////

        [HttpGet("GetByAssignmentID/{id}")]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" }
              //,
              //pages: new[] { "Assignment" }
          )]
        public async Task<IActionResult> GetByID(long id)
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

            List<AssignmentStudent> assignmentStudents = await Unit_Of_Work.assignmentStudent_Repository.Select_All_With_IncludesById<AssignmentStudent>(s=>s.AssignmentID==id && s.IsDeleted!= true,
                query => query.Include(e => e.StudentClassroom).ThenInclude(t=>t.Student));

            if (assignmentStudents == null || assignmentStudents.Count == 0)
            {
                return NotFound();
            }

            List<AssignmentStudentGetDTO> DTO = mapper.Map<List<AssignmentStudentGetDTO>>(assignmentStudents);

            return Ok(DTO);
        }
    }
}
