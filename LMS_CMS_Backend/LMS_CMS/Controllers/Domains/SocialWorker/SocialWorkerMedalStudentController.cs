using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class SocialWorkerMedalStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SocialWorkerMedalStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }


        ////////////////////////////

        [HttpGet("GetByStudentId/{StudentId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Add Medal To Student" }
        )]
        public async Task<IActionResult> GetByStudentId(long StudentId)
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

            List<SocialWorkerMedalStudent> types = await Unit_Of_Work.socialWorkerMedalStudent_Repository.Select_All_With_IncludesById<SocialWorkerMedalStudent>(
                    sem => sem.IsDeleted != true && sem.StudentID == StudentId,
                     query => query.Include(emp => emp.Student),
                     query => query.Include(emp => emp.InsertedByEmployee),
                    query => query.Include(emp => emp.SocialWorkerMedal));

            if (types == null || types.Count == 0)
            {
                return NotFound();
            }

            List<SocialWorkerMedalStudentGetDTO> Dto = mapper.Map<List<SocialWorkerMedalStudentGetDTO>>(types);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in Dto)
            {
                if (!string.IsNullOrEmpty(item.SocialWorkerMedalFile))
                {
                    item.SocialWorkerMedalFile = $"{serverUrl}{item.SocialWorkerMedalFile.Replace("\\", "/")}";
                }
            }
            return Ok(Dto);
        }

        ////////////////////////////


        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Add Medal To Student" }
         )]
        public async Task<IActionResult> Add(SocialWorkerMedalStudentAddDTO type)
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

            Student stu = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == type.StudentID && s.IsDeleted != true);
            if (stu == null)
            {
                return BadRequest("student id not exist");
            }

            SocialWorkerMedal s = Unit_Of_Work.socialWorkerMedal_Repository.First_Or_Default(s => s.ID == type.SocialWorkerMedalID && s.IsDeleted != true);
            if (s == null)
            {
                return BadRequest("SocialWorkerMedal id not exist");
            }
            SocialWorkerMedalStudent Type = mapper.Map<SocialWorkerMedalStudent>(type);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            Type.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                Type.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                Type.InsertedByUserId = userId;
            }
            Unit_Of_Work.socialWorkerMedalStudent_Repository.Add(Type);

            Unit_Of_Work.SaveChanges();
            return Ok(type);
        }
    }
}
