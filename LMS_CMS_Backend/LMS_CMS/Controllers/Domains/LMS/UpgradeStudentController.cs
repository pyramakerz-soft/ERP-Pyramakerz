using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class UpgradeStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public UpgradeStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        //[HttpPost]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "Upgrade Student" }
        //)]
        //public IActionResult Upgrade(UpgradeDTO upgradeDTO)
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var userClaims = HttpContext.User.Claims;
        //    var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        //    long.TryParse(userIdClaim, out long userId);
        //    var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

        //    if (userIdClaim == null || userTypeClaim == null)
        //    {
        //        return Unauthorized("User ID or Type claim not found.");
        //    }
             
        //    AcademicYear academicYearFrom = Unit_Of_Work.academicYear_Repository.First_Or_Default(
        //        s => s.ID == upgradeDTO.FromAcademicYearID && s.IsDeleted != true);
        //    if (academicYearFrom == null)
        //    {
        //        return BadRequest("This Academic Year is not found");
        //    } 

        //    AcademicYear academicYearTo = Unit_Of_Work.academicYear_Repository.First_Or_Default(
        //        s => s.ID == upgradeDTO.ToAcademicYearID && s.IsDeleted != true);
        //    if (academicYearTo == null)
        //    {
        //        return BadRequest("This Academic Year is not found");
        //    }

        //    if (upgradeDTO.IsUpgradeAfterSummerCourse)
        //    {
        //        if(academicYearFrom.SummerCourseDateFrom == null || academicYearFrom.SummerCourseDateTo == null)
        //        {
        //            return BadRequest("This Academic Year Doesn't have Summer Course Date");
        //        }
        //    }

        //    List<Classroom> classrooms = Unit_Of_Work.classroom_Repository.FindBy(d => d.IsDeleted != true && d.AcademicYearID == academicYearFrom.ID);
        //    List<StudentGrade> studentGrades = Unit_Of_Work.studentGrade_Repository.FindBy(
        //        d => d.IsDeleted != true && d.AcademicYearID == academicYearFrom.ID && d.GradeID);
             

        //    //TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
        //    //grade.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
        //    //if (userTypeClaim == "octa")
        //    //{
        //    //    grade.InsertedByOctaId = userId;
        //    //}
        //    //else if (userTypeClaim == "employee")
        //    //{
        //    //    grade.InsertedByUserId = userId;
        //    //}
        //    //Unit_Of_Work.grade_Repository.Add(grade);
        //    //Unit_Of_Work.SaveChanges();
        //    return Ok();
        //}
    }
}
