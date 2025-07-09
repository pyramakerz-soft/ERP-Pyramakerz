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
    public class TimeTableController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public TimeTableController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////
        
        [HttpPost]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" }
              //,
              //pages: new[] { "Building" }
          )]
        public async Task<IActionResult> GenerateAsync(long SchoolId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s=>s.ID == SchoolId && s.IsDeleted !=true);
            if(school == null)
            {
                return BadRequest("No School With This Id");
            }

            AcademicYear academicYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(a=>a.SchoolID== SchoolId && a.IsDeleted != true && a.IsActive== true);
            if (academicYear == null)
            {
                return BadRequest("There is no active academic year in this school");
            }

            ///////// Create TimeTable First
            TimeTable timeTable = new TimeTable();
            timeTable.AcademicYearID = academicYear.ID;
            Unit_Of_Work.academicYear_Repository.Add(academicYear);
            Unit_Of_Work.SaveChanges();

            List<Grade> Grades = await Unit_Of_Work.grade_Repository.Select_All_With_IncludesById<Grade>(sem => sem.IsDeleted != true && sem.Section.SchoolID == SchoolId,
                                    query => query.Include(emp => emp.Section));

            if (Grades == null || Grades.Count == 0)
            {
                return BadRequest("There is no grades in this school");
            }

            List<long> gradesIds = Grades.Select(g=>g.ID).ToList();
            List<Classroom> classes = Unit_Of_Work.classroom_Repository.FindBy(c => gradesIds.Contains(c.GradeID));
            List<string> days = new List<string>();


            return Ok();
        }

    }
}
