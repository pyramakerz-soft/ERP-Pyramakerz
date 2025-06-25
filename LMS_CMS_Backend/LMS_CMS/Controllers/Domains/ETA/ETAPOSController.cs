using AutoMapper;
using LMS_CMS_BL.DTO.ETA;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.ETA
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ETAPOSController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ETAPOSController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        #region Get All
        [HttpGet("GetAll")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Point Of Sale" }
        )]
        public async Task<ActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            int totalRecords = await Unit_Of_Work.pos_Repository
               .CountAsync(f => f.IsDeleted != true);

            List<ETAPOS> ETAPOSs = await Unit_Of_Work.pos_Repository
                .Select_All_With_IncludesById_Pagination<ETAPOS>(
                    f => f.IsDeleted != true,
                    query => query.Include(x => x.InsertedByEmployee))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (ETAPOSs == null || ETAPOSs.Count == 0)
            {
                return NotFound("No ETAPOS records found.");
            }

            var ETAPOSDtos = _mapper.Map<List<POSGetDTO>>(ETAPOSs);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = ETAPOSDtos, Pagination = paginationMetadata });
        }
        #endregion

        #region Get By ID
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Point Of Sale" }
        )]
        public async Task<ActionResult> GetById(int id)
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

            ETAPOS ETAPOS = await Unit_Of_Work.pos_Repository
                .FindByIncludesAsync(
                x => x.ID == id && x.IsDeleted != true,
                query => query.Include(x => x.InsertedByEmployee));

            if (ETAPOS == null)
            {
                return NotFound($"ETAPOS with ID {id} not found.");
            }

            var ETAPOSDto = _mapper.Map<POSGetDTO>(ETAPOS);

            return Ok(ETAPOSDto);
        }
        #endregion

        #region Add
        [HttpPost("Add")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Point Of Sale" }
        )]
        public async Task<ActionResult> Add(POSAddDTO posDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;

            long.TryParse(userIdClaim, out long userId);

            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            ETAPOS newETAPOS = _mapper.Map<ETAPOS>(posDto);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            newETAPOS.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                newETAPOS.InsertedByOctaId = userId;
                if (newETAPOS.InsertedByUserId != null)
                {
                    newETAPOS.InsertedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                newETAPOS.InsertedByUserId = userId;
                if (newETAPOS.InsertedByOctaId != null)
                {
                    newETAPOS.InsertedByOctaId = null;
                }
            }

            Unit_Of_Work.pos_Repository.Add(newETAPOS);
            Unit_Of_Work.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = newETAPOS.ID }, posDto);
        }
        #endregion

        #region Update
        [HttpPut("Edit")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Point Of Sale" }
        )]
        public async Task<IActionResult> Update(POSEditDTO posDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

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

            ETAPOS existingETAPOS = Unit_Of_Work.pos_Repository.First_Or_Default(x => x.ID == posDto.ID && x.IsDeleted != true);

            if (existingETAPOS == null)
            {
                return NotFound($"ETAPOS with ID {posDto.ID} not found.");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Point Of Sale", roleId, userId, existingETAPOS);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (userTypeClaim == "octa")
            {
                existingETAPOS.UpdatedByOctaId = userId;
                if (existingETAPOS.UpdatedByUserId != null)
                {
                    existingETAPOS.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                existingETAPOS.UpdatedByUserId = userId;
                if (existingETAPOS.UpdatedByOctaId != null)
                {
                    existingETAPOS.UpdatedByOctaId = null;
                }
            }

            _mapper.Map(posDto, existingETAPOS);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            existingETAPOS.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            Unit_Of_Work.pos_Repository.Update(existingETAPOS);
            Unit_Of_Work.SaveChanges();

            return Ok(posDto);
        }
        #endregion

        #region Delete
        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Point Of Sale" }
        )]
        public async Task<IActionResult> Delete(int id)
        {
            if (id == 0)
            {
                return BadRequest("POS ID cannot be null.");
            }

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

            ETAPOS existingETAPOS = Unit_Of_Work.pos_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);

            if (existingETAPOS == null)
            {
                return NotFound($"POS with ID {id} not found.");
            }
            else
            {
                if (userTypeClaim == "employee")
                {
                    IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Point Of Sale", roleId, userId, existingETAPOS);
                    if (accessCheck != null)
                    {
                        return accessCheck;
                    }
                }

                existingETAPOS.IsDeleted = true;
                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                existingETAPOS.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    existingETAPOS.DeletedByOctaId = userId;
                    if (existingETAPOS.DeletedByUserId != null)
                    {
                        existingETAPOS.DeletedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    existingETAPOS.DeletedByUserId = userId;
                    if (existingETAPOS.DeletedByOctaId != null)
                    {
                        existingETAPOS.DeletedByOctaId = null;
                    }
                }
                Unit_Of_Work.pos_Repository.Update(existingETAPOS);
                Unit_Of_Work.SaveChanges();
                return Ok(new { message = "POS has Successfully been deleted" });
            }
        }
        #endregion
    }
}
