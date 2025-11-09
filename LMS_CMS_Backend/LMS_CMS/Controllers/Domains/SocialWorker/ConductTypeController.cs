using AutoMapper;
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
    public class ConductTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ConductTypeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////
        
        [HttpGet("BySchool/{SchoolId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Conduct Types", "Conducts", "Conducts Report" }
        )]
        public async Task<IActionResult> GetBySchool(long SchoolId)
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

            List<ConductType> conductTypes =await Unit_Of_Work.conductType_Repository.Select_All_With_IncludesById<ConductType>(
                    sem => sem.IsDeleted != true && sem.SchoolID == SchoolId,
                    query => query.Include(emp => emp.ConductLevel),
                    query => query.Include(emp => emp.ConductTypeSections),
                    query => query.Include(emp => emp.School));

            if (conductTypes == null || conductTypes.Count == 0)
            {
                return NotFound();
            }

            List<ConductTypeGetDTO> Dto = mapper.Map<List<ConductTypeGetDTO>>(conductTypes);

            return Ok(Dto);
        }


        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Conduct Types" }
         )]
        public async Task<IActionResult> GetById(long id)
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

            ConductType conductType =await Unit_Of_Work.conductType_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id,
                    query => query.Include(emp => emp.ConductLevel),
                    query => query.Include(emp => emp.ConductTypeSections
                        .Where(a => a.IsDeleted != true))
                        .ThenInclude(a => a.Section),
                    query => query.Include(emp => emp.School));

            if (conductType == null)
            {
                return NotFound();
            }

            ConductTypeGetDTO Dto = mapper.Map<ConductTypeGetDTO>(conductType);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Conduct Types" }
        )]
        public async Task<IActionResult> Add(ConductTypeAddDTO NewConduct)
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
            if (NewConduct == null)
            {
                return BadRequest("Conduct is empty");
            }

            ConductLevel conductLevel = Unit_Of_Work.conductLevel_Repository.First_Or_Default(s=>s.ID==NewConduct.ConductLevelID && s.IsDeleted != true );
            if(conductLevel == null)
            {
                return BadRequest("There is no ConductLevel with this Id");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == NewConduct.SchoolID && s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("There is no School with this Id");
            }

            ConductType conduct = mapper.Map<ConductType>(NewConduct);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conduct.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conduct.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                conduct.InsertedByUserId = userId;
            }
            Unit_Of_Work.conductType_Repository.Add(conduct);
            Unit_Of_Work.SaveChanges();

            foreach (var sectionId in NewConduct.Sectiondids)
            {
                ConductTypeSection conductTypeSection = new ConductTypeSection();
                conductTypeSection.SectionID= sectionId;
                conductTypeSection.ConductTypeID= conduct.ID;
                Unit_Of_Work.conductTypeSection_Repository.Add(conductTypeSection);
            }
            Unit_Of_Work.SaveChanges();
            return Ok(NewConduct);
        }

        ////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         allowEdit: 1,
         pages: new[] { "Conduct Types" }
        )]
        public async Task<IActionResult> EditAsync(ConductTypeEditDTO NewConduct)
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

            if (NewConduct == null)
            {
                return BadRequest("Conduct cannot be null");
            }
            if (NewConduct.ID == null)
            {
                return BadRequest("id can not be null");
            }

            ConductLevel conductLevel = Unit_Of_Work.conductLevel_Repository.First_Or_Default(s => s.ID == NewConduct.ConductLevelID && s.IsDeleted != true);
            if (conductLevel == null)
            {
                return BadRequest("conduct Level not exist");
            }

            School school = Unit_Of_Work.school_Repository.First_Or_Default(s => s.ID == NewConduct.SchoolID && s.IsDeleted != true);
            if (school == null)
            {
                return BadRequest("There is no School with this Id");
            }

            ConductType conductType = Unit_Of_Work.conductType_Repository.First_Or_Default(s => s.ID == NewConduct.ID && s.IsDeleted != true);
            if (conductType == null)
            {
                return BadRequest("Conduct Type not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Conduct Types", roleId, userId, conductType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(NewConduct, conductType);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conductType.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conductType.UpdatedByOctaId = userId;
                if (conductType.UpdatedByUserId != null)
                {
                    conductType.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                conductType.UpdatedByUserId = userId;
                if (conductType.UpdatedByOctaId != null)
                {
                    conductType.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.conductType_Repository.Update(conductType);
            Unit_Of_Work.SaveChanges();

            List<ConductTypeSection> ExistedSections = Unit_Of_Work.conductTypeSection_Repository
                .FindBy(s => s.ConductTypeID == NewConduct.ID && s.IsDeleted != true);

            List<long> ExistedSectionIds = ExistedSections.Select(s => s.SectionID).ToList();
            foreach (var sectionId in NewConduct.Sectiondids)
            {
                if (!ExistedSectionIds.Contains(sectionId))
                {
                    var conductTypeSection = new ConductTypeSection
                    {
                        SectionID = sectionId,
                        ConductTypeID = NewConduct.ID
                    };
                    Unit_Of_Work.conductTypeSection_Repository.Add(conductTypeSection);
                }
            }
            foreach (var existing in ExistedSections)
            {
                if (!NewConduct.Sectiondids.Contains(existing.SectionID))
                {
                    existing.IsDeleted = true;
                    Unit_Of_Work.conductTypeSection_Repository.Update(existing);
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok(NewConduct);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Conduct Types" }
        )]
        public IActionResult Delete(long id)
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

            if (id == null)
            {
                return BadRequest("id cannot be null");
            }

            ConductType conductType = Unit_Of_Work.conductType_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (conductType == null)
            {
                return BadRequest("Conduct Type not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Conduct Types", roleId, userId, conductType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            conductType.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            conductType.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                conductType.DeletedByOctaId = userId;
                if (conductType.DeletedByUserId != null)
                {
                    conductType.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                conductType.DeletedByUserId = userId;
                if (conductType.DeletedByOctaId != null)
                {
                    conductType.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.conductType_Repository.Update(conductType);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }

    }
}
