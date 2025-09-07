using AutoMapper;
using LMS_CMS_BL.DTO.HR;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.HR;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.HR
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AnnualVacationEmployeeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AnnualVacationEmployeeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "Conduct Level" }
        )]
        public async Task<IActionResult> EditAsync(OfficialHolidaysAddDTO newHoliday)
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

            if (newHoliday == null)
            {
                return BadRequest("Conduct cannot be null");
            }
            if (newHoliday.ID == null)
            {
                return BadRequest("id can not be null");
            }

            OfficialHolidays officialHolidays = Unit_Of_Work.officialHolidays_Repository.First_Or_Default(s => s.ID == newHoliday.ID && s.IsDeleted != true);
            if (officialHolidays == null)
            {
                return BadRequest("conduct Level not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conduct Level", roleId, userId, officialHolidays);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newHoliday, officialHolidays);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            officialHolidays.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                officialHolidays.UpdatedByOctaId = userId;
                if (officialHolidays.UpdatedByUserId != null)
                {
                    officialHolidays.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                officialHolidays.UpdatedByUserId = userId;
                if (officialHolidays.UpdatedByOctaId != null)
                {
                    officialHolidays.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.officialHolidays_Repository.Update(officialHolidays);
            Unit_Of_Work.SaveChanges();
            return Ok(newHoliday);
        }
    }
}
