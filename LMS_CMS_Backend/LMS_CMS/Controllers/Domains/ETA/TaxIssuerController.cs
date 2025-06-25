using AutoMapper;
using LMS_CMS_BL.DTO.ETA;
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
        //[HttpGet("Get")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "Tax Issuer" }
        //)]
        //public async Task<IActionResult> Get()
        //{
        //    UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

        //    var userClaims = HttpContext.User.Claims;
        //    var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
        //    long.TryParse(userIdClaim, out long userId);

        //    var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

        //    if (userIdClaim == null || userTypeClaim == null)
        //    {
        //        return Unauthorized("User ID or Type claim not found.");
        //    }

        //    List<TaxIssuer> taxIssuers = await Unit_Of_Work.taxIssuer_Repository
        //        .Select_All_With_IncludesById<TaxIssuer>(x => x.IsDeleted != true,
        //        query => query.Include(x => x.InsertedByEmployee),
        //        query => query.Include(x => x.TaxCustomer));

        //    if (taxIssuers == null || !taxIssuers.Any())
        //    {
        //        return NotFound("No tax issuers found.");
        //    }

        //    var taxIssuerDtos = _mapper.Map<List<TaxIssuerGetDTO>>(taxIssuers);

        //    return Ok(taxIssuerDtos);
        //}
        #endregion

        #region Get By ID
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Tax Issuer" }
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

            TaxIssuer? taxIssuer = await Unit_Of_Work.taxIssuer_Repository
                .FindByIncludesAsync(x => x.ID == id && x.IsDeleted != true,
                query => query.Include(x => x.InsertedByEmployee),
                query => query.Include(x => x.TaxCustomer));

            if (taxIssuer == null)
            {
                return NotFound($"Tax issuer with ID {id} not found.");
            }

            var taxIssuerDto = _mapper.Map<TaxIssuerGetDTO>(taxIssuer);

            return Ok(taxIssuerDto);
        }
        #endregion

        #region Edit
        [HttpPut("Edit")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Tax Issuer" }
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

            TaxCustomer taxCustomer = Unit_Of_Work.taxCustomer_Repository.First_Or_Default(x => x.ID == taxIssuerDTO.TypeID);

            if (taxCustomer == null)
                return NotFound("Type ID is not found!");

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

            return Ok(taxIssuerDTO);
        }
        #endregion
    }
}
