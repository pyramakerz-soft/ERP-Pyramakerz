using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountingConfigurationsController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public AccountingConfigurationsController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
        }

        #region Get By ID
        [HttpGet("{id}")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
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

            AccountingConfigurations? accConfig = await Unit_Of_Work.accountingConfigurations_Repository
                .FindByIncludesAsync(x => x.ID == id && x.IsDeleted != true,
                query => query.Include(x => x.Sales),
                query => query.Include(x => x.SalesReturn),
                query => query.Include(x => x.Purchase),
                query => query.Include(x => x.PurchaseReturn));

            if (accConfig == null)
                return NotFound($"Tax issuer with ID {id} not found.");

            var accConfigDto = _mapper.Map<AccountingConfigurationsGetDTO>(accConfig);

            return Ok(accConfigDto);
        }
        #endregion

        #region Edit
        [HttpPut("Edit")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public IActionResult Edit(AccountingConfigurationsEditDTO accDTO)
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

            AccountingConfigurations? acc = Unit_Of_Work.accountingConfigurations_Repository.First_Or_Default(x => x.ID == accDTO.ID && x.IsDeleted != true);

            if (acc == null)
                return NotFound($"Accounting configuration with ID {accDTO.ID} not found.");

            AccountingTreeChart? tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.SalesID && x.IsDeleted != true);

            if (tree == null)
                return NotFound($"Sales account with ID {accDTO.SalesID} not found.");

            tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.SalesReturnID && x.IsDeleted != true);

            if (tree == null)
                return NotFound($"Sales Return account with ID {accDTO.SalesReturnID} not found.");

            tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.PurchaseID && x.IsDeleted != true);

            if (tree == null)
                return NotFound($"Purchase account with ID {accDTO.PurchaseID} not found.");

            tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.PurchaseReturnID && x.IsDeleted != true);

            if (tree == null)
                return NotFound($"Purchase Return account with ID {accDTO.PurchaseReturnID} not found.");

            _mapper.Map(accDTO, acc);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            acc.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                acc.UpdatedByOctaId = userId;
                if (acc.UpdatedByUserId != null)
                {
                    acc.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                acc.UpdatedByUserId = userId;
                if (acc.UpdatedByOctaId != null)
                {
                    acc.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.accountingConfigurations_Repository.Update(acc);
            Unit_Of_Work.SaveChanges();

            return Ok(accDTO);
        }
        #endregion
    }
}
