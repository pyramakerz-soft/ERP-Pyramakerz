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
    public class AccountingConfigsController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public AccountingConfigsController(DbContextFactoryService dbContextFactory, IMapper mapper)
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

            AccountingConfigs? accConfig = await Unit_Of_Work.accountingConfigs_Repository
                .FindByIncludesAsync(x => x.ID == id,
                query => query.Include(x => x.Sales),
                query => query.Include(x => x.SalesReturn),
                query => query.Include(x => x.Purchase),
                query => query.Include(x => x.PurchaseReturn));

            if (accConfig == null)
                return NotFound($"Accounting Configuration with ID {id} not found.");

            var accConfigDto = _mapper.Map<AccountingConfigsGetDTO>(accConfig);

            return Ok(accConfigDto);
        }
        #endregion

        #region Edit
        [HttpPut("Edit")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "" }
        //)]
        public IActionResult Edit(AccountingConfigsEditDTO accDTO)
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

            AccountingConfigs? acc = Unit_Of_Work.accountingConfigs_Repository.First_Or_Default(x => x.ID == accDTO.ID);

            if (acc == null)
                return NotFound($"Accounting configuration with ID {accDTO.ID} not found.");

            AccountingTreeChart? tree;

            if (accDTO.SalesID != null)
            {
                tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.SalesID && x.IsDeleted != true);

                if (tree == null)
                    return NotFound($"Sales account with ID {accDTO.SalesID} not found.");
            }
            if (accDTO.SalesReturnID != null)
            {
                tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.SalesReturnID && x.IsDeleted != true);
                if (tree == null)
                    return NotFound($"Sales Return account with ID {accDTO.SalesReturnID} not found.");
            }

            if (accDTO.PurchaseID != null)
            {
                tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.PurchaseID && x.IsDeleted != true);
                if (tree == null)
                    return NotFound($"Purchase account with ID {accDTO.PurchaseID} not found.");
            }

            if (accDTO.PurchaseReturnID != null)
            {
                tree = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(x => x.ID == accDTO.PurchaseReturnID && x.IsDeleted != true);
                if (tree == null)
                    return NotFound($"Purchase Return account with ID {accDTO.PurchaseReturnID} not found.");
            }

            _mapper.Map(accDTO, acc);

            Unit_Of_Work.accountingConfigs_Repository.Update(acc);
            Unit_Of_Work.SaveChanges();

            return Ok(accDTO);
        }
        #endregion
    }
}
