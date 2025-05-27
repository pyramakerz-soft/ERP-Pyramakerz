using AutoMapper;
using LMS_CMS_BL.DTO.ETA;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.ETA
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class CertificatesIssuerNameController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public CertificatesIssuerNameController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
        }

        #region Get All
        [HttpGet("get")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
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

            List<CertificatesIssuerName> certificatesIssuerNames =  Unit_Of_Work.certificatesIssuerName_Repository.Select_All();

            if (certificatesIssuerNames == null || !certificatesIssuerNames.Any())
            {
                return NotFound("No certificates issuer names found.");
            }

            List<CertificatesIssuerNameGetDTO> certNameDTO = _mapper.Map<List<CertificatesIssuerNameGetDTO>>(certificatesIssuerNames);

            return Ok(certificatesIssuerNames);
        }
        #endregion

        #region Get By ID
        [HttpGet("id")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "SchoolPCs" }
        //)]
        public async Task<IActionResult> GetByID(int id)
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

            CertificatesIssuerName certificatesIssuerName = Unit_Of_Work.certificatesIssuerName_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);

            if (certificatesIssuerName == null)
            {
                return NotFound($"CertificatesIssuerName with ID {id} not found.");
            }

            CertificatesIssuerNameGetDTO certNameDTO = _mapper.Map<CertificatesIssuerNameGetDTO>(certificatesIssuerName);

            return Ok(certNameDTO);
        }
        #endregion

        #region Create
        [HttpPost("Add")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "SchoolPCs" }
        //)]
        public IActionResult Add(CertificatesIssuerNameAddDTO certIssuerAdd)
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

            CertificatesIssuerName certificatesIssuerName = _mapper.Map<CertificatesIssuerName>(certIssuerAdd);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            certificatesIssuerName.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                certificatesIssuerName.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                certificatesIssuerName.InsertedByUserId = userId;
            }

            Unit_Of_Work.certificatesIssuerName_Repository.Add(certificatesIssuerName);
            Unit_Of_Work.SaveChanges();

            return Ok(certificatesIssuerName);
        }
        #endregion

        #region Update
        [HttpPut("Edit")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "SchoolPCs" }
        //)]
        public IActionResult Edit(CertificatesIssuerNameEditDTO certIssuerDTO)
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

            CertificatesIssuerName certificatesIssuerName = Unit_Of_Work.certificatesIssuerName_Repository.First_Or_Default(x => x.ID == certIssuerDTO.ID && x.IsDeleted != true);

            if (certificatesIssuerName == null)
            {
                return NotFound($"CertificatesIssuerName with ID {certIssuerDTO.ID} not found.");
            }

            _mapper.Map(certIssuerDTO, certificatesIssuerName);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            certificatesIssuerName.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                certificatesIssuerName.UpdatedByOctaId = userId;
                if (certificatesIssuerName.UpdatedByUserId != null)
                {
                    certificatesIssuerName.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                certificatesIssuerName.UpdatedByUserId = userId;
                if (certificatesIssuerName.UpdatedByOctaId != null)
                {
                    certificatesIssuerName.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.certificatesIssuerName_Repository.Update(certificatesIssuerName);
            Unit_Of_Work.SaveChanges();

            return Ok(certificatesIssuerName);
        }
        #endregion

        #region Delete
        [HttpDelete]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "SchoolPCs" }
        //)]
        public IActionResult Delete(int id)
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

               CertificatesIssuerName certificatesIssuerName = Unit_Of_Work.certificatesIssuerName_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);
    
            if (certificatesIssuerName == null)
            {
                return NotFound($"CertificatesIssuerName with ID {id} not found.");
            }
    
            certificatesIssuerName.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            certificatesIssuerName.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
                {
                    certificatesIssuerName.DeletedByOctaId = userId;
                    if (certificatesIssuerName.DeletedByUserId != null)
                    {
                        certificatesIssuerName.DeletedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    certificatesIssuerName.DeletedByUserId = userId;
                    if (certificatesIssuerName.DeletedByOctaId != null)
                    {
                        certificatesIssuerName.DeletedByOctaId = null;
                    }
                }
    
                Unit_Of_Work.certificatesIssuerName_Repository.Update(certificatesIssuerName);
                Unit_Of_Work.SaveChanges();
    
                return Ok("Certificate deleted successfully");
        }
        #endregion
    }
}
