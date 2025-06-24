using AutoMapper;
using LMS_CMS_BL.DTO.ETA;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.ETA
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class TaxIssuerController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public TaxIssuerController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
        }

        #region Get All
        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Tax Issuer" }
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

            List<TaxIssuer> taxIssuers = Unit_Of_Work.taxIssuer_Repository.Select_All();

            if (taxIssuers == null || !taxIssuers.Any())
            {
                return NotFound("No tax issuers found.");
            }

            var taxIssuerDtos = _mapper.Map<List<TaxIssuerGetDTO>>(taxIssuers);

            return Ok(taxIssuerDtos);
        }
        #endregion

        #region Get By ID
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "TaxIssuer" }
        )]
        public async Task<IActionResult> GetByID(string id)
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

            TaxIssuer? taxIssuer = Unit_Of_Work.taxIssuer_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);

            if (taxIssuer == null)
            {
                return NotFound($"Tax issuer with ID {id} not found.");
            }

            var taxIssuerDto = _mapper.Map<TaxIssuerGetDTO>(taxIssuer);

            return Ok(taxIssuerDto);
        }
        #endregion

        #region Create
        [HttpPost("Add")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "TaxIssuer" }
        )]
        public IActionResult Add(TaxIssuerAddDTO taxIssuerAdd)
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

            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            TaxIssuer taxIssuer = _mapper.Map<TaxIssuer>(taxIssuerAdd);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            taxIssuer.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                taxIssuer.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                taxIssuer.InsertedByUserId = userId;
            }

            Unit_Of_Work.taxIssuer_Repository.Add(taxIssuer);
            Unit_Of_Work.SaveChanges();

            return CreatedAtAction(nameof(GetByID), new { Id = taxIssuer .ID }, taxIssuerAdd);
        }
        #endregion

        #region Edit
        [HttpPut("Edit")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "TaxIssuer" }
        )]
        public IActionResult Edit(TaxIssuerEditDTO taxIssuerDTO)
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

            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            TaxIssuer taxIssuer = Unit_Of_Work.taxIssuer_Repository.First_Or_Default(x => x.ID == taxIssuerDTO.ID && x.IsDeleted != true);

            if (taxIssuer == null)
            {
                return NotFound($"Tax Issuer with ID {taxIssuerDTO.ID} not found.");
            }

            _mapper.Map(taxIssuerDTO, taxIssuer);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            taxIssuer.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                taxIssuer.UpdatedByOctaId = userId;
                if (taxIssuer.UpdatedByUserId != null)
                {
                    taxIssuer.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                taxIssuer.UpdatedByUserId = userId;
                if (taxIssuer.UpdatedByOctaId != null)
                {
                    taxIssuer.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.taxIssuer_Repository.Update(taxIssuer);
            Unit_Of_Work.SaveChanges();

            return Ok(taxIssuer);
        }
        #endregion

        #region Delete
        [HttpDelete]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "TaxIssuer" }
        )]
        public IActionResult Delete(string id)
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

            TaxIssuer taxIssuer = Unit_Of_Work.taxIssuer_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);

            if (taxIssuer == null)
            {
                return NotFound($"Tax Issuer with ID {id} not found.");
            }

            taxIssuer.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            taxIssuer.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                taxIssuer.DeletedByOctaId = userId;
                if (taxIssuer.DeletedByUserId != null)
                {
                    taxIssuer.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                taxIssuer.DeletedByUserId = userId;
                if (taxIssuer.DeletedByOctaId != null)
                {
                    taxIssuer.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.taxIssuer_Repository.Update(taxIssuer);
            Unit_Of_Work.SaveChanges();

            return Ok("Tax Issuer deleted successfully");
        }
        #endregion
    }
}
