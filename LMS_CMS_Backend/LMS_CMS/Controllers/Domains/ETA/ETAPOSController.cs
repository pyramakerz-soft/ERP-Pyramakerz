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

        public ETAPOSController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
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

            int totalRecords = await Unit_Of_Work.assignment_Repository
               .CountAsync(f => f.IsDeleted != true);

            List<ETAPOS> ETAPOSs = await Unit_Of_Work.pos_Repository
                .Select_All_With_IncludesById_Pagination<ETAPOS>(
                    f => f.IsDeleted != true)
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

            ETAPOS ETAPOS = Unit_Of_Work.pos_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);

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

            Unit_Of_Work.pos_Repository.Update(newETAPOS);
            Unit_Of_Work.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = newETAPOS.ID }, posDto);
        }
        #endregion

        #region Update
        [HttpPut("Edit")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Point Of Sale" }
        )]
        public async Task<ActionResult> Update(POSEditDTO posDto)
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

            ETAPOS existingETAPOS = Unit_Of_Work.pos_Repository.First_Or_Default(x => x.ID == posDto.ID && x.IsDeleted != true);

            if (existingETAPOS == null)
            {
                return NotFound($"ETAPOS with ID {posDto.ID} not found.");
            }

            _mapper.Map(posDto, existingETAPOS);

            Unit_Of_Work.pos_Repository.Update(existingETAPOS);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
        #endregion

        #region Delete
        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Point Of Sale" }
        )]
        public async Task<ActionResult> Delete(int id)
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

            ETAPOS existingETAPOS = Unit_Of_Work.pos_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);

            if (existingETAPOS == null)
            {
                return NotFound($"ETAPOS with ID {id} not found.");
            }

            existingETAPOS.IsDeleted = true;

            Unit_Of_Work.pos_Repository.Update(existingETAPOS);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }
        #endregion
    }
}
