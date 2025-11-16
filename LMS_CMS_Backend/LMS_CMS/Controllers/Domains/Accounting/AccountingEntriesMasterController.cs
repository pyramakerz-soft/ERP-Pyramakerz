using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations.Domains;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountingEntriesMasterController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AccountingEntriesMasterController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Accounting Entries" }
        )]
        public async Task<IActionResult> GetAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            int totalRecords = await Unit_Of_Work.accountingEntriesMaster_Repository
                .CountAsync(f => f.IsDeleted != true);

            List<AccountingEntriesMaster> AccountingEntriesMasters = await Unit_Of_Work.accountingEntriesMaster_Repository.Select_All_With_IncludesById_Pagination<AccountingEntriesMaster>(
                    t => t.IsDeleted != true,
                    query => query.Include(Master => Master.AccountingEntriesDocType)
                    )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (AccountingEntriesMasters == null || AccountingEntriesMasters.Count == 0)
            {
                return NotFound();
            } 

            List<AccountingEntriesMasterGetDTO> DTOs = mapper.Map<List<AccountingEntriesMasterGetDTO>>(AccountingEntriesMasters);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTOs, Pagination = paginationMetadata });
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting Entries" }
        )]
        public async Task<IActionResult> GetbyIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0 || id == null)
            {
                return BadRequest("Accounting Entries Type ID");
            }

            AccountingEntriesMaster AccountingEntriesMaster = await Unit_Of_Work.accountingEntriesMaster_Repository.FindByIncludesAsync(
                    acc => acc.IsDeleted != true && acc.ID == id,
                    query => query.Include(ac => ac.AccountingEntriesDocType)
                    );

            if (AccountingEntriesMaster == null)
            {
                return NotFound();
            }

            AccountingEntriesMasterGetDTO dto = mapper.Map<AccountingEntriesMasterGetDTO>(AccountingEntriesMaster);

            List<AccountingEntriesDetails> AccountingEntriesDetails = await Unit_Of_Work.accountingEntriesDetails_Repository.Select_All_With_IncludesById<AccountingEntriesDetails>(
                t => t.IsDeleted != true && t.AccountingEntriesMasterID == id,
                query => query.Include(Master => Master.AccountingTreeChart),
                query => query.Include(Master => Master.AccountingEntriesMaster)
                );

            List<AccountingEntriesDetailsGetDTO> accountingEntriesDetailsGetDTO = mapper.Map<List<AccountingEntriesDetailsGetDTO>>(AccountingEntriesDetails);

            foreach (var detail in accountingEntriesDetailsGetDTO)
            {
                AccountingTreeChart acc = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(
                    ac => ac.ID == detail.AccountingTreeChartID && ac.IsDeleted != true
                    );

                if (acc.LinkFileID == 6) // Bank
                {
                    var bank = Unit_Of_Work.bank_Repository.First_Or_Default(b => b.ID == detail.SubAccountingID);
                    detail.SubAccountingName = bank?.Name;

                    List<Bank> banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(
                         f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);

                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(banks);

                }
                else if (acc.LinkFileID == 5) // Save
                {
                    var save = Unit_Of_Work.save_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = save?.Name;

                    List<Save> saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);

                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(saves);

                }
                else if (acc.LinkFileID == 2) // Supplier
                {
                    var supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = supplier?.Name;

                    List<Supplier> Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);
                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(Suppliers);
                }
                else if (acc.LinkFileID == 3) // Debit
                {
                    var debit = Unit_Of_Work.debit_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = debit?.Name;

                    List<Debit> Debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);

                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(Debits);

                }
                else if (acc.LinkFileID == 4) // Credit
                {
                    var credit = Unit_Of_Work.credit_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = credit?.Name;

                    List<Credit> Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);

                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(Credits);

                }
                else if (acc.LinkFileID == 7) // Income
                {
                    var income = Unit_Of_Work.income_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = income?.Name;

                    List<Income> Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);

                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(Incomes);

                }
                else if (acc.LinkFileID == 8) // Outcome
                {
                    var outcome = Unit_Of_Work.outcome_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = outcome?.Name;

                    List<Outcome> Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);
                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(Outcomes);
                }
                else if (acc.LinkFileID == 9) // Asset
                {
                    var asset = Unit_Of_Work.asset_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = asset?.Name;

                    List<Asset> Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);
                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(Assets);

                }
                else if (acc.LinkFileID == 10) // Employee
                {
                    var employee = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = employee?.en_name;

                    List<Employee> Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);
                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(Employees);

                }
                else if (acc.LinkFileID == 11) // Fee
                {
                    var fee = Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = fee?.Name;

                    List<TuitionFeesType> TuitionFeesTypes = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);
                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(TuitionFeesTypes);

                }
                else if (acc.LinkFileID == 12) // Discount
                {
                    var discount = Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = discount?.Name;

                    List<TuitionDiscountType> TuitionDiscountTypes = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(
                        f => f.IsDeleted != true && f.AccountNumberID == detail.AccountingTreeChartID);
                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(TuitionDiscountTypes);

                }
                else if (acc.LinkFileID == 13) // Student
                {
                    var student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == detail.SubAccountingID);
                    detail.SubAccountingName = student?.en_name;

                    List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
                        query => query.IsDeleted != true && query.AccountNumberID == detail.AccountingTreeChartID);
                    detail.SubAccountData = mapper.Map<List<SubAccountDTO>>(students);
                }
            }
            dto.AccountingEntriesDetails = accountingEntriesDetailsGetDTO;

            return Ok(dto);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Accounting Entries" }
        )]
        public IActionResult Add(AccountingEntriesMasterAddDTO newMaster)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newMaster == null)
            {
                return BadRequest("Accounting Entries cannot be null");
            }

            AccountingEntriesDocType AccountingEntriesDocType = Unit_Of_Work.accountingEntriesDocType_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newMaster.AccountingEntriesDocTypeID);
            if (AccountingEntriesDocType == null)
            {
                return BadRequest("there is no Accounting Entries Doc Type with this ID");
            }

            AccountingEntriesMaster AccountingEntriesMaster = mapper.Map<AccountingEntriesMaster>(newMaster);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            AccountingEntriesMaster.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                AccountingEntriesMaster.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                AccountingEntriesMaster.InsertedByUserId = userId;
            }

            Unit_Of_Work.accountingEntriesMaster_Repository.Add(AccountingEntriesMaster);
            Unit_Of_Work.SaveChanges();
            return Ok(new AccountingEntriesMasterPutDTO { ID = AccountingEntriesMaster.ID });
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Accounting Entries" }
        )]
        public IActionResult Edit(AccountingEntriesMasterPutDTO newMaster)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            if (newMaster == null)
            {
                return BadRequest("Accounting Entries cannot be null");
            }

            AccountingEntriesMaster AccountingEntriesMaster = Unit_Of_Work.accountingEntriesMaster_Repository.First_Or_Default(d => d.ID == newMaster.ID && d.IsDeleted != true);
            if (AccountingEntriesMaster == null)
            {
                return NotFound("There is no Accounting Entries Master with this id");
            }

            AccountingEntriesDocType AccountingEntriesDocType = Unit_Of_Work.accountingEntriesDocType_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newMaster.AccountingEntriesDocTypeID);
            if (AccountingEntriesDocType == null)
            {
                return BadRequest("there is no Accounting Entries Doc Type with this ID");
            }
              
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Accounting Entries", roleId, userId, AccountingEntriesMaster);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newMaster, AccountingEntriesMaster);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            AccountingEntriesMaster.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                AccountingEntriesMaster.UpdatedByOctaId = userId;
                if (AccountingEntriesMaster.UpdatedByUserId != null)
                {
                    AccountingEntriesMaster.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                AccountingEntriesMaster.UpdatedByUserId = userId;
                if (AccountingEntriesMaster.UpdatedByOctaId != null)
                {
                    AccountingEntriesMaster.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.accountingEntriesMaster_Repository.Update(AccountingEntriesMaster);
            Unit_Of_Work.SaveChanges();


            // new Details 
            if(newMaster.NewDetails != null && newMaster.NewDetails.Count > 0)
            {
                foreach (var newDetails in newMaster.NewDetails)
                {
                    AccountingTreeChart AccountingTreeChart = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(t => t.ID == newDetails.AccountingTreeChartID && t.SubTypeID == 2);
                    AccountingEntriesDetails AccountingEntriesDetails;
                    if (AccountingTreeChart.LinkFileID != null)
                    {
                         AccountingEntriesDetails = mapper.Map<AccountingEntriesDetails>(newDetails);

                        if (AccountingTreeChart.LinkFileID == 6) // Bank
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 5) // Save
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 2) // Supplier
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 3) // Debit
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Debit = Unit_Of_Work.debit_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 4) // Credit
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Credit = Unit_Of_Work.credit_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 7) // Income
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Income = Unit_Of_Work.income_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 8) // Outcome
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Outcome = Unit_Of_Work.outcome_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 9) // Asset
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Asset = Unit_Of_Work.asset_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 10) // Employee
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Employee = Unit_Of_Work.employee_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 11) // Fee
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.TuitionFeesType = Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 12) // Discount
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.TuitionDiscountType = Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                        else if (AccountingTreeChart.LinkFileID == 13) // Student
                        {
                            AccountingEntriesDetails.SubAccountingID = newDetails.SubAccountingID;
                            AccountingEntriesDetails.Student = Unit_Of_Work.student_Repository.First_Or_Default(t => t.ID == newDetails.SubAccountingID);
                        }
                    }
                    else
                    {
                        AccountingEntriesDetails = mapper.Map<AccountingEntriesDetails>(newDetails);
                        AccountingEntriesDetails.SubAccountingID = null;
                    }

                    AccountingEntriesDetails.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        AccountingEntriesDetails.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        AccountingEntriesDetails.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.accountingEntriesDetails_Repository.Add(AccountingEntriesDetails);
                    Unit_Of_Work.SaveChanges();
                }
            }

            return Ok(newMaster);
        }

        //////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Accounting Entries" }
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

            if (id == 0)
            {
                return BadRequest("Enter Accounting Entries ID");
            }
             
            AccountingEntriesMaster AccountingEntriesMaster = Unit_Of_Work.accountingEntriesMaster_Repository.First_Or_Default(d => d.ID == id && d.IsDeleted != true);
            if (AccountingEntriesMaster == null)
            {
                return NotFound("There is no Accounting Entries Master with this id");
            }
              
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Accounting Entries", roleId, userId, AccountingEntriesMaster);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            AccountingEntriesMaster.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            AccountingEntriesMaster.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                AccountingEntriesMaster.DeletedByOctaId = userId;
                if (AccountingEntriesMaster.DeletedByUserId != null)
                {
                    AccountingEntriesMaster.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                AccountingEntriesMaster.DeletedByUserId = userId;
                if (AccountingEntriesMaster.DeletedByOctaId != null)
                {
                    AccountingEntriesMaster.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.accountingEntriesMaster_Repository.Update(AccountingEntriesMaster);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
