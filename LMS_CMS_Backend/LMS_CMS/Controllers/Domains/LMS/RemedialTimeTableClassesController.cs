using AutoMapper;
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
    public class RemedialTimeTableClassesController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public RemedialTimeTableClassesController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////

        [HttpDelete()]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         allowDelete: 1,
         pages: new[] { "Remedial TimeTable" }
     )]
        public IActionResult Delete(List<long> ids)
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
            foreach (var id in ids)
            {
                RemedialTimeTableClasses remedialTimeTableClass = Unit_Of_Work.remedialTimeTableClasses_Repository.Select_By_Id(id);

                if (remedialTimeTableClass != null || remedialTimeTableClass.IsDeleted != true)
                {

                    if (userTypeClaim == "employee")
                    {
                        IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Remedial TimeTable", roleId, userId, remedialTimeTableClass);
                        if (accessCheck != null)
                        {
                            return accessCheck;
                        }
                    }

                    remedialTimeTableClass.IsDeleted = true;
                    TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                    remedialTimeTableClass.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        remedialTimeTableClass.DeletedByOctaId = userId;
                        if (remedialTimeTableClass.DeletedByUserId != null)
                        {
                            remedialTimeTableClass.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        remedialTimeTableClass.DeletedByUserId = userId;
                        if (remedialTimeTableClass.DeletedByOctaId != null)
                        {
                            remedialTimeTableClass.DeletedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.remedialTimeTableClasses_Repository.Update(remedialTimeTableClass);
                    Unit_Of_Work.SaveChanges();
                }

            }
            return Ok();
        }
    }
}
