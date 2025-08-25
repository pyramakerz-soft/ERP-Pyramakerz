using AutoMapper;
using LMS_CMS_BL.DTO.SocialWorker;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.SocialWorker;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.SocialWorker
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ProcedureTypeController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ProcedureTypeController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
        allowedTypes: new[] { "octa", "employee" },
        pages: new[] { "Procedure Types" }
        )]
        public IActionResult Get()
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

            List<ProcedureType> procedureTypes = Unit_Of_Work.procedureType_Repository.FindBy(t => t.IsDeleted != true);

            if (procedureTypes == null || procedureTypes.Count == 0)
            {
                return NotFound();
            }

            List<ProcedureTypeGetDTO> Dto = mapper.Map<List<ProcedureTypeGetDTO>>(procedureTypes);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Procedure Types" }
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

            ProcedureType procedureType = Unit_Of_Work.procedureType_Repository.First_Or_Default(sem => sem.IsDeleted != true && sem.ID == id);

            if (procedureType == null)
            {
                return NotFound();
            }

            ProcedureTypeGetDTO Dto = mapper.Map<ProcedureTypeGetDTO>(procedureType);

            return Ok(Dto);
        }

        ////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          pages: new[] { "Procedure Types" }
        )]
        public async Task<IActionResult> Add(ProcedureTypeAddDTO NewProcedureType)
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
            if (NewProcedureType == null)
            {
                return BadRequest("Conduct is empty");
            }

            ProcedureType procedureType = mapper.Map<ProcedureType>(NewProcedureType);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            procedureType.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                procedureType.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                procedureType.InsertedByUserId = userId;
            }
            Unit_Of_Work.procedureType_Repository.Add(procedureType);
            Unit_Of_Work.SaveChanges();
            return Ok(NewProcedureType);
        }

        ////////////////////////////////


        [HttpPut]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowEdit: 1,
           pages: new[] { "Procedure Types" }
       )]
        public async Task<IActionResult> EditAsync(ProcedureTypeAddDTO newProcedureType)
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

            if (newProcedureType == null)
            {
                return BadRequest("Procedure Type cannot be null");
            }
            if (newProcedureType.ID == null)
            {
                return BadRequest("id can not be null");
            }

            ProcedureType procedureType = Unit_Of_Work.procedureType_Repository.First_Or_Default(s => s.ID == newProcedureType.ID && s.IsDeleted != true);
            if (procedureType == null)
            {
                return BadRequest("Procedure Type not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Procedure Types", roleId, userId, procedureType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newProcedureType, procedureType);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            procedureType.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                procedureType.UpdatedByOctaId = userId;
                if (procedureType.UpdatedByUserId != null)
                {
                    procedureType.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                procedureType.UpdatedByUserId = userId;
                if (procedureType.UpdatedByOctaId != null)
                {
                    procedureType.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.procedureType_Repository.Update(procedureType);
            Unit_Of_Work.SaveChanges();
            return Ok(newProcedureType);
        }

        ////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowDelete: 1,
          pages: new[] { "Procedure Types" }
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
            ProcedureType procedureType = Unit_Of_Work.procedureType_Repository.First_Or_Default(s => s.ID == id && s.IsDeleted != true);
            if (procedureType == null)
            {
                return BadRequest("Type not exist");
            }
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Procedure Types", roleId, userId, procedureType);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }


            procedureType.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            procedureType.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                procedureType.DeletedByOctaId = userId;
                if (procedureType.DeletedByUserId != null)
                {
                    procedureType.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                procedureType.DeletedByUserId = userId;
                if (procedureType.DeletedByOctaId != null)
                {
                    procedureType.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.procedureType_Repository.Update(procedureType);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
