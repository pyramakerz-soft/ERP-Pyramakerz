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
    public class DirectMarkClassesController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public DirectMarkClassesController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        //////////////////
        
        [HttpGet("ByDirectMarkId/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent" },
            pages: new[] { "Academic Years" }
        )]
        public async Task<IActionResult> GetByDirectMarkIdAsync(long id)
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

            List<DirectMarkClasses> directMarkClasses = await Unit_Of_Work.directMarkClasses_Repository.Select_All_With_IncludesById<DirectMarkClasses>(
                    sem => sem.IsDeleted != true && sem.DirectMarkID == id,
                    query => query.Include(emp => emp.Classroom));

            if (directMarkClasses == null || directMarkClasses.Count == 0)
            {
                return NotFound();
            }

            List<DirectMarkClassesGetDTO> DTO = mapper.Map<List<DirectMarkClassesGetDTO>>(directMarkClasses);

            return Ok(DTO);
        }
    }
}
