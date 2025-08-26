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
    public class DirectMarkClassesStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DirectMarkClassesStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////
        
        [HttpGet("GetByDirectMarkId/{DirectMarkId}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Semester" }
        )]
        public async Task<IActionResult> GetAsync(long DirectMarkId)
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
            List<DirectMarkClassesStudent> DirectMarkClassesStudents = await Unit_Of_Work.directMarkClassesStudent_Repository.Select_All_With_IncludesById<DirectMarkClassesStudent>(
                    sem => sem.IsDeleted != true && sem.DirectMarkID== DirectMarkId,
                    query => query.Include(emp => emp.StudentClassroom).ThenInclude(a=>a.Student),
                    query => query.Include(emp => emp.DirectMark));

            if (DirectMarkClassesStudents == null || DirectMarkClassesStudents.Count == 0)
            {
                return NotFound();
            }

            List<DirectMarkClassesStudentGetDTO> DTO = mapper.Map<List<DirectMarkClassesStudentGetDTO>>(DirectMarkClassesStudents);

            return Ok(DTO);
        }

        /////////////////


        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Academic Years" }
        )]
        public IActionResult Edit(List<DirectMarkClassesStudentEditDTO> NewDirectMarkClassesStudent)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            foreach (var mark in NewDirectMarkClassesStudent)
            {
                DirectMarkClassesStudent directMarkClassesStudent = Unit_Of_Work.directMarkClassesStudent_Repository.First_Or_Default(s => s.ID == mark.ID);
                if(directMarkClassesStudent == null)
                {
                    return NotFound("No DirectMarkClassesStudent with this ID");
                }
                directMarkClassesStudent.Degree=mark.Degree;

                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                directMarkClassesStudent.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    directMarkClassesStudent.UpdatedByOctaId = userId;
                    if (directMarkClassesStudent.UpdatedByUserId != null)
                    {
                        directMarkClassesStudent.UpdatedByUserId = null;
                    }

                }
                else if (userTypeClaim == "employee")
                {
                    directMarkClassesStudent.UpdatedByUserId = userId;
                    if (directMarkClassesStudent.UpdatedByOctaId != null)
                    {
                        directMarkClassesStudent.UpdatedByOctaId = null;
                    }
                }
                Unit_Of_Work.directMarkClassesStudent_Repository.Update(directMarkClassesStudent);
                Unit_Of_Work.SaveChanges();
            }

            return Ok(NewDirectMarkClassesStudent);

        }
    }
}
