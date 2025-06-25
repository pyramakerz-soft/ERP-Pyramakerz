using AutoMapper;
using LMS_CMS_BL.DTO.Bus;
using LMS_CMS_BL.DTO.ETA;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.BusModule;
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
    public class CertificatesIssuerNameController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public CertificatesIssuerNameController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        #region Get All
        [HttpGet("getAll")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Certificate Issuer" }
        )]
        public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            int totalRecords = await Unit_Of_Work.certificatesIssuerName_Repository
               .CountAsync(f => f.IsDeleted != true);

            List<CertificatesIssuerName> certificatesIssuerNames = await Unit_Of_Work.certificatesIssuerName_Repository
                .Select_All_With_IncludesById_Pagination<CertificatesIssuerName>(
                x => x.IsDeleted != true, query => query.Include(d => d.InsertedByEmployee))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (certificatesIssuerNames == null || !certificatesIssuerNames.Any())
            {
                return NotFound("No certificates issuer names found.");
            }

            List<CertificatesIssuerNameGetDTO> certNameDTO = _mapper.Map<List<CertificatesIssuerNameGetDTO>>(certificatesIssuerNames);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = certNameDTO, Pagination = paginationMetadata });
        }
        #endregion

        #region Get By ID
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Certificate Issuer" }
        )]
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
                return NotFound($"Certificate with ID {id} not found.");
            }

            CertificatesIssuerNameGetDTO certNameDTO = _mapper.Map<CertificatesIssuerNameGetDTO>(certificatesIssuerName);

            return Ok(certNameDTO);
        }
        #endregion

        #region Create
        [HttpPost("Add")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Certificate Issuer" }
        )]
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
                if (certificatesIssuerName.InsertedByUserId != null)
                {
                    certificatesIssuerName.InsertedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                certificatesIssuerName.InsertedByUserId = userId;
                if (certificatesIssuerName.InsertedByOctaId != null)
                {
                    certificatesIssuerName.InsertedByOctaId = null;
                }
            }

            Unit_Of_Work.certificatesIssuerName_Repository.Add(certificatesIssuerName);
            Unit_Of_Work.SaveChanges();

            return CreatedAtAction(nameof(GetByID), new { Id = certificatesIssuerName.ID }, certIssuerAdd);
        }
        #endregion

        #region Update
        [HttpPut("Edit")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Certificate Issuer" }
        )]
        public IActionResult Edit(CertificatesIssuerNameEditDTO certIssuerDTO)
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

            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            CertificatesIssuerName certificatesIssuerName = Unit_Of_Work.certificatesIssuerName_Repository.First_Or_Default(x => x.ID == certIssuerDTO.ID && x.IsDeleted != true);

            if (certificatesIssuerName == null)
            {
                return NotFound($"CertificatesIssuerName with ID {certIssuerDTO.ID} not found.");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Certificate Issuer", roleId, userId, certificatesIssuerName);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
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

            return Ok(certIssuerDTO);
        }
        #endregion

        #region Delete
        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Certificate Issuer" }
        )]
        public IActionResult Delete(int id)
        {
            if (id == 0)
            {
                return BadRequest("Certificate ID cannot be null.");
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

               CertificatesIssuerName certificatesIssuerName = Unit_Of_Work.certificatesIssuerName_Repository.First_Or_Default(x => x.ID == id && x.IsDeleted != true);
    
            if (certificatesIssuerName == null)
            {
                return NotFound($"Certificate with ID {id} not found.");
            }
            else
            {
                if (userTypeClaim == "employee")
                {
                    IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Certificate Issuer", roleId, userId, certificatesIssuerName);
                    if (accessCheck != null)
                    {
                        return accessCheck;
                    }
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
                return Ok(new { message = "Certificate has Successfully been deleted" });
            }
        }
        #endregion
    }
}
