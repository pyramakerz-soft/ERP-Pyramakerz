using AutoMapper;
using LMS_CMS_BL.DTO.Clinic;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.ClinicModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Clinic
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class HygieneTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public HygieneTypeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        #region Get
        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Types" }
        )]
        public async Task<IActionResult> Get()
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

            List<HygieneType> HygieneTypes = await Unit_Of_Work.hygieneType_Repository
                .Select_All_With_IncludesById<HygieneType>(
                t => t.IsDeleted != true,
                query => query.Include(x => x.InsertedByEmployee));

            if (HygieneTypes == null || HygieneTypes.Count == 0)
            {
                return NotFound();
            }

            List<HygieneTypeGetDTO> HygieneTypesDto = _mapper.Map<List<HygieneTypeGetDTO>>(HygieneTypes);

            return Ok(HygieneTypesDto);
        }
        #endregion

        #region GetByID
        [HttpGet("id")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Types" }
        )]
        public async Task<IActionResult> GetById(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0)
            {
                return BadRequest("Enter Bus Company ID");
            }

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;

            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            HygieneType hygieneType = await Unit_Of_Work.hygieneType_Repository
                .FindByIncludesAsync(
                h => h.Id == id && h.IsDeleted != true,
                query => query.Include(x => x.InsertedByEmployee));

            if (hygieneType == null)
            {
                return NotFound();
            }

            HygieneTypeGetDTO hygieneTypeDto = _mapper.Map<HygieneTypeGetDTO>(hygieneType);

            return Ok(hygieneTypeDto);
        }
        #endregion

        #region Add Hygiene Type
        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Types" }
        )]
        public IActionResult Add(HygieneTypeAddDTO hygieneTypeDto)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (!ModelState.IsValid)
            {
                return BadRequest("Please enter the Name field.");
            }

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            HygieneType hygieneType = _mapper.Map<HygieneType>(hygieneTypeDto);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            hygieneType.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                hygieneType.InsertedByOctaId = userId;
            }

            else if (userTypeClaim == "employee")
            {
                hygieneType.InsertedByUserId = userId;
            }

            Unit_Of_Work.hygieneType_Repository.Add(hygieneType);
            Unit_Of_Work.SaveChanges();

            return Ok(hygieneTypeDto);
        }
        #endregion

        #region Update Hygiene Type
        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Hygiene Types" }
        )]
        public IActionResult Update(HygieneTypePutDTO hygieneTypeDto)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;

            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            HygieneType hygieneType = Unit_Of_Work.hygieneType_Repository.First_Or_Default(h => h.Id == hygieneTypeDto.ID && h.IsDeleted != true);

            if (hygieneType == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Hygiene Types", roleId, userId, hygieneType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            _mapper.Map(hygieneTypeDto, hygieneType);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            hygieneType.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                hygieneType.UpdatedByOctaId = userId;
                if (hygieneType.UpdatedByUserId != null)
                {
                    hygieneType.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                hygieneType.UpdatedByUserId = userId;
                if (hygieneType.UpdatedByOctaId != null)
                {
                    hygieneType.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.hygieneType_Repository.Update(hygieneType);
            Unit_Of_Work.SaveChanges();

            return Ok(hygieneTypeDto);
        }
        #endregion

        #region Delete Hygiene Type
        [HttpDelete]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Hygiene Types" }
        )]
        public IActionResult Delete(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);
            long.TryParse(userIdClaim, out long userId);
            
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (id == 0)
            {
                return BadRequest("Hygiene ID cannot be null.");
            }

            HygieneType hygieneType = Unit_Of_Work.hygieneType_Repository.Select_By_Id(id);

            if (hygieneType == null || hygieneType.IsDeleted == true)
            {
                return NotFound("No Hygiene Type with this ID");
            }
            
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Hygiene Types", roleId, userId, hygieneType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            hygieneType.IsDeleted = true;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            hygieneType.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                hygieneType.DeletedByOctaId = userId;
                if (hygieneType.DeletedByUserId != null)
                {
                    hygieneType.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                hygieneType.DeletedByUserId = userId;
                if (hygieneType.DeletedByOctaId != null)
                {
                    hygieneType.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.hygieneType_Repository.Update(hygieneType);
            Unit_Of_Work.SaveChanges();

            return Ok("Hygiene Type deleted successfully");
        }
        #endregion
    }
}
