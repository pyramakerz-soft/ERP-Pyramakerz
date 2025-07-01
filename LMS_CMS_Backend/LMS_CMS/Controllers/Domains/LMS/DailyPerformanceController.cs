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
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class DailyPerformanceController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DailyPerformanceController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }
        /////////////////////////////////////////////

        [HttpGet("GetMasterByClassSubject/{ClassId}/{SubjectId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
          )]
        public async Task<IActionResult> GetAsync(long ClassId , long SubjectId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<DailyPerformanceMaster> Data;

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            Data = await Unit_Of_Work.dailyPerformanceMaster_Repository
                .Select_All_With_IncludesById<DailyPerformanceMaster>(
                    f => f.IsDeleted != true && f.ClassroomID == ClassId && f.SubjectID == SubjectId,
                    query => query.Include(m => m.Subject).ThenInclude(s => s.Grade),
                    query => query.Include(m => m.Classroom),
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.Student),
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.StudentPerformance).ThenInclude(sp => sp.PerformanceType)
                );


            if (Data == null || Data.Count == 0)
            {
                return NotFound();
            }

            List<DailyPerformanceMasterGetDTO> Dto = mapper.Map<List<DailyPerformanceMasterGetDTO>>(Data);

            return Ok(Dto);
        }

        /////////////////////////////////////////////

        [HttpGet("GetById/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> GetByIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
                return Unauthorized("User ID or Type claim not found.");

            var data = await Unit_Of_Work.dailyPerformanceMaster_Repository
                .FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == id,
                    query => query.Include(m => m.Subject).ThenInclude(s => s.Grade),
                    query => query.Include(m => m.Classroom),
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.Student),
                    query => query.Include(m => m.DailyPerformances).ThenInclude(dp => dp.StudentPerformance).ThenInclude(sp => sp.PerformanceType)
                );

            if (data == null)
                return NotFound();

            var dto = mapper.Map<DailyPerformanceMasterGetDTO>(data);

            // ✅ Extract unique PerformanceTypeIDs from DTO
            var uniquePerformanceTypeIds = dto.DailyPerformances
                .SelectMany(p => p.StudentPerformance)
                .Select(sp => sp.PerformanceTypeID)
                .Distinct()
                .ToList();
            List<PerformanceType> performanceTypes = Unit_Of_Work.performanceType_Repository.FindBy(s => uniquePerformanceTypeIds.Contains(s.ID));

            List<PerformanceTypeGetDTO> performance = mapper.Map<List<PerformanceTypeGetDTO>>(performanceTypes);
            // ✅ Return both master DTO and list of unique type IDs
            return Ok(new
            {
                master = dto,
                performanceTypes = performance
            });
        }

        /////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Enter Daily Performance", "Daily Performance" }
        )]
        public async Task<IActionResult> Add(DailyPerformanceMasterAddDTO NewData)
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
            if (NewData == null)
            {
                return BadRequest("Type is empty");
            }

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(s=>s.ID== NewData.SubjectID && s.IsDeleted != true);
            if (subject == null)
            {
                return BadRequest("There is no subject with this id");
            }

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(s => s.ID == NewData.ClassroomID && s.IsDeleted != true);
            if (classroom == null)
            {
                return BadRequest("There is no classroom with this id");
            }

            DailyPerformanceMaster dailyPerformanceMaster = mapper.Map<DailyPerformanceMaster>(NewData);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            dailyPerformanceMaster.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                dailyPerformanceMaster.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                dailyPerformanceMaster.InsertedByUserId = userId;
            }
            Unit_Of_Work.dailyPerformanceMaster_Repository.Add(dailyPerformanceMaster);

            Unit_Of_Work.SaveChanges();
            return Ok(NewData);
        }

    }
}
