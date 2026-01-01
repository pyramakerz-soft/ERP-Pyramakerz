using AutoMapper;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.Administration
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class SocialInsuranceController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public SocialInsuranceController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////////////////////////////////////////////////////////////////////// GET: api/with-domain/SocialInsurance

        [HttpGet]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" })]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var socialInsurance = await Unit_Of_Work.socialInsurance_Repository
                .Select_All_With_IncludesById<SocialInsurance>(x => x.IsDeleted != true);

            if (socialInsurance == null || socialInsurance.Count == 0)
                return NotFound();

            var dtos = mapper.Map<List<SocialInsuranceGetDTO>>(socialInsurance);
            return Ok(dtos);
        }
        ///////////////////////////////////////////////////////////////////////////////// GET: api/with-domain/SocialInsurance/ID
        [HttpGet("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Social insurance Office" })]
        public IActionResult GetById(int id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var entity = Unit_Of_Work.socialInsurance_Repository
                .First_Or_Default(x => x.Id == id && x.IsDeleted != true);

            if (entity == null)
                return NotFound();

            return Ok(mapper.Map<SocialInsuranceGetDTO>(entity));
        }

        ///////////////////////////////////////////////////////////////////////////////// POST
        [HttpPost]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, pages: new[] { "Social insurance Office" })]
        public IActionResult Add([FromBody] SocialInsuranceAddDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
                return Unauthorized();

            long.TryParse(userIdClaim, out long userId);

            SocialInsurance entity = mapper.Map<SocialInsurance>(dto);

           
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            entity.CreatedDate = TimeZoneInfo.ConvertTime(dto.CreatedDate == default ? DateTime.Now : dto.CreatedDate, cairoZone);
            entity.InsertedAt = entity.CreatedDate;

            if (userTypeClaim == "octa")
                entity.InsertedByOctaId = userId;
            else
                entity.InsertedByUserId = userId;

            Unit_Of_Work.socialInsurance_Repository.Add(entity);
            Unit_Of_Work.SaveChanges();

            return Ok(mapper.Map<SocialInsuranceGetDTO>(entity));
        }

        ///////////////////////////////////////////////////////////////////////////////// PUT

        [HttpPut]

        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowEdit: 1, pages: new[] { "Social insurance Office" })]
        public IActionResult Edit([FromBody] SocialInsuranceEditDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            var entity = Unit_Of_Work.socialInsurance_Repository
                .First_Or_Default(x => x.Id == dto.Id && x.IsDeleted != true);

            if (entity == null)
                return NotFound("No Social Insurance record found");


            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Social insurance Office", roleId, userId, entity);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(dto, entity);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            entity.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                entity.UpdatedByOctaId = userId;
                entity.UpdatedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                entity.UpdatedByUserId = userId;
                entity.UpdatedByOctaId = null;
            }

            Unit_Of_Work.socialInsurance_Repository.Update(entity);
            Unit_Of_Work.SaveChanges();

            return Ok(dto);
        }

        ///////////////////////////////////////////////////////////////////////////////// DELETE (Soft Delete)
        [HttpDelete("{id}")]
        [Authorize_Endpoint_(allowedTypes: new[] { "octa", "employee" }, allowDelete: 1, pages: new[] { "Social insurance Office" })]
        public IActionResult Delete(int id)
        {
            if (id == 0)
            {
                return BadRequest("Enter valid Social Insurance ID");
            } 

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(userTypeClaim))
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            var entity = Unit_Of_Work.socialInsurance_Repository
                .First_Or_Default(x => x.Id == id && x.IsDeleted != true);

            if (entity == null)
                return NotFound();

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Social insurance Office", roleId, userId, entity);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            entity.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            entity.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                entity.DeletedByOctaId = userId;
                entity.DeletedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                entity.DeletedByUserId = userId;
                entity.DeletedByOctaId = null;
            }

            Unit_Of_Work.socialInsurance_Repository.Update(entity);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

    }
}

