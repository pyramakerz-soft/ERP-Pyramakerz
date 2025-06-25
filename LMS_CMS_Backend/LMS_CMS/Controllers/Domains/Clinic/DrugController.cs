using AutoMapper;
using LMS_CMS_BL.DTO.Clinic;
using LMS_CMS_BL.UOW;
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
    public class DrugController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public DrugController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
        }

        #region Get
        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Drugs" }
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

            List<Drug> drugs = await Unit_Of_Work.drug_Repository
                .Select_All_With_IncludesById<Drug>(
                d => d.IsDeleted != true,
                query => query.Include(x => x.InsertedByEmployee));
            
            if (drugs == null || drugs.Count == 0)
            {
                return NotFound();
            }

            List<DrugGetDTO> drugsDto = _mapper.Map<List<DrugGetDTO>>(drugs);

            return Ok(drugsDto);
        }
        #endregion

        #region GetByID
        [HttpGet("id")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Drugs" }
        )]
        public async Task<IActionResult> GetByID(long id)
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
            Drug drug = await Unit_Of_Work.drug_Repository.FindByIncludesAsync(
                d => d.Id == id && d.IsDeleted != true,
                query => query.Include(x => x.InsertedByEmployee));

            if (drug == null)
            {
                return NotFound();
            }

            DrugGetDTO drugDto = _mapper.Map<DrugGetDTO>(drug);
            
            return Ok(drugDto);
        }
        #endregion

        #region Add Drug
        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Drugs" }
        )]
        public IActionResult Add(DrugAddDTO drugDto)
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
                return BadRequest("Please enter the Name field");
            }

            Drug drug = _mapper.Map<Drug>(drugDto);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            drug.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                drug.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                drug.InsertedByUserId = userId;
            }

            Unit_Of_Work.drug_Repository.Add(drug);
            Unit_Of_Work.SaveChanges();
            
            return Ok(drugDto);
        }
        #endregion

        #region Update Drug
        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Drugs" }
        )]
        public IActionResult Update(DrugPutDTO drugDto)
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
                return BadRequest("Please enter the Name field");
            }

            Drug drug = Unit_Of_Work.drug_Repository.First_Or_Default(d => d.Id == drugDto.ID && d.IsDeleted != true);

            if (drug == null)
            {
                return NotFound();
            }

            _mapper.Map(drugDto, drug);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            drug.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                drug.UpdatedByOctaId = userId;
                if (drug.UpdatedByUserId != null)
                {
                    drug.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                drug.UpdatedByUserId = userId;
                if (drug.UpdatedByOctaId != null)
                {
                    drug.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.drug_Repository.Update(drug);
            Unit_Of_Work.SaveChanges();

            return Ok(drugDto);
        }
        #endregion

        #region Delete Drug
        [HttpDelete]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Drugs" }
        )]
        public IActionResult Delete(long id)
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
            
            Drug drug = Unit_Of_Work.drug_Repository.First_Or_Default(d => d.IsDeleted != true && d.Id == id);

            if (drug == null)
            {
                return NotFound();
            }

            drug.IsDeleted = true;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            drug.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                drug.DeletedByOctaId = userId;

                if (drug.DeletedByUserId != null)
                {
                    drug.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                drug.DeletedByUserId = userId;
                if (drug.DeletedByOctaId != null)
                {
                    drug.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.drug_Repository.Update(drug);
            Unit_Of_Work.SaveChanges();
            
            return Ok("Drug deleted successfully");
        }
        #endregion
    }
}
