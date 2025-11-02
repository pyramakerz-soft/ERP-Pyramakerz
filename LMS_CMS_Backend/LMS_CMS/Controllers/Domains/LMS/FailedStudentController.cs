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
    public class FailedStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper; 

        public FailedStudentController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
        }

        [HttpGet("GetByAcademicYearID/{yearID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee"},
            pages: new[] { "Failed Students" }
        )]
        public async Task<IActionResult> GetByAcademicYearID(long yearID)
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

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == yearID);
            if (academicYear == null)
            {
                return BadRequest("No Academic Year with this ID");
            }

            List<FailedStudents> failedStudents = await Unit_Of_Work.failedStudents_Repository.Select_All_With_IncludesById<FailedStudents>(
                    d => d.IsDeleted != true && d.AcademicYearID == yearID,
                    query => query.Include(d => d.Grade),
                    query => query.Include(d => d.Student),
                    query => query.Include(d => d.AcademicYear),
                    query => query.Include(d => d.Subject)
                    );

            if (failedStudents == null || failedStudents.Count == 0)
            {
                return NotFound();
            }

            List<FailedStudentsGet> failedStudentsDTOs = mapper.Map<List<FailedStudentsGet>>(failedStudents);

            return Ok(failedStudentsDTOs);
        }
    }
}
