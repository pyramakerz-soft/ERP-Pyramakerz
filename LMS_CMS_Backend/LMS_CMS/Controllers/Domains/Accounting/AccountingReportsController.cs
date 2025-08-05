using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
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
    public class AccountingReportsController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public AccountingReportsController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
        }

        #region Payables
        [HttpGet("GetPayablesByDate")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Payable Report" }
        )]
        public async Task<ActionResult> GetPayablesByDate(DateOnly startDate, DateOnly endDate, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            
            if (endDate < startDate)
                return BadRequest("Start date must be equal or greater than End date");

            var query = await Unit_Of_Work.payableMaster_Repository
            .Select_All_With_IncludesById_Pagination<PayableMaster>(
                t => t.IsDeleted != true &&
                    t.Date >= startDate &&
                    t.Date <= endDate,
                q => q.Include(m => m.PayableDetails).ThenInclude(pd => pd.LinkFile)
                      .Include(m => m.LinkFile)
                      .Include(m => m.PayableDocType)
            )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (query == null || query.ToList().Count == 0)
                return NotFound("No payables found for the specified date range.");

            foreach (var master in query)
            {
                master.PayableDetails = master.PayableDetails
                    .Where(detail => detail.IsDeleted != true)
                    .ToList();
            }

            int totalRecords = await Unit_Of_Work.payableMaster_Repository.CountAsync(t => t.Date >= startDate && t.Date <= endDate);

            var allDetails = query.SelectMany(pm => pm.PayableDetails).ToList();

            var saveIdsForMaster = query.Where(r => r.LinkFileID == 5).Select(r => r.BankOrSaveID).Distinct().ToList();
            var bankIdsForMaster = query.Where(r => r.LinkFileID == 6).Select(r => r.BankOrSaveID).Distinct().ToList();

            var suppliersIds = allDetails.Where(r => r.LinkFileID == 2).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var debitIds = allDetails.Where(r => r.LinkFileID == 3).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var creditsIds = allDetails.Where(r => r.LinkFileID == 4).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var saveIds = allDetails.Where(r => r.LinkFileID == 5).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var bankIds = allDetails.Where(r => r.LinkFileID == 6).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var incomesIds = allDetails.Where(r => r.LinkFileID == 7).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var outcomesIds = allDetails.Where(r => r.LinkFileID == 8).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var assetsIds = allDetails.Where(r => r.LinkFileID == 9).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var employeesIds = allDetails.Where(r => r.LinkFileID == 10).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var feeIds = allDetails.Where(r => r.LinkFileID == 11).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var discountIds = allDetails.Where(r => r.LinkFileID == 12).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var studentIds = allDetails.Where(r => r.LinkFileID == 13).Select(r => r.LinkFileTypeID).Distinct().ToList();

            var banksForMaster = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIdsForMaster.Contains(b.ID));
            var safesForMaster = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIdsForMaster.Contains(s.ID));
            
            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var safes = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));
            var Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(s => suppliersIds.Contains(s.ID));
            var debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(s => debitIds.Contains(s.ID));
            var credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(s => creditsIds.Contains(s.ID));
            var incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(s => incomesIds.Contains(s.ID));
            var outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(s => outcomesIds.Contains(s.ID));
            var assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(s => assetsIds.Contains(s.ID));
            var employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(s => employeesIds.Contains(s.ID));
            var fees = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(s => feeIds.Contains(s.ID));
            var discounts = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(s => discountIds.Contains(s.ID));
            var students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(s => studentIds.Contains(s.ID));

            List<PayableMasterGetDTO> DTOs = _mapper.Map<List<PayableMasterGetDTO>>(query);

            foreach (var dto in DTOs)
            {
                dto.BankOrSaveName = dto.LinkFileID switch
                {
                    5 => safesForMaster.FirstOrDefault(s => s.ID == dto.BankOrSaveID)?.Name,
                    6 => banksForMaster.FirstOrDefault(b => b.ID == dto.BankOrSaveID)?.Name,
                    _ => null
                };

                foreach (var detail in dto.PayableDetails)
                {
                    detail.LinkFileTypeName = detail.LinkFileID switch
                    {
                        2 => Suppliers.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        3 => debits.FirstOrDefault(d => d.ID == detail.LinkFileTypeID)?.Name,
                        4 => credits.FirstOrDefault(c => c.ID == detail.LinkFileTypeID)?.Name,
                        5 => safes.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        6 => banks.FirstOrDefault(b => b.ID == detail.LinkFileTypeID)?.Name,
                        7 => incomes.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        8 => outcomes.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        9 => assets.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        10 => employees.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.en_name,
                        11 => fees.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        12 => discounts.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        13 => students.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.en_name,
                        _ => null
                    };
                }
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTOs, Pagination = paginationMetadata });
        }
        #endregion

        #region Receivables
        [HttpGet("GetReceivablesByDate")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Receivable Report" }
        )]
        public async Task<ActionResult> GetReceivablesByDate(DateOnly startDate, DateOnly endDate, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (endDate < startDate)
                return BadRequest("Start date must be equal or greater than End date");

            var query = await Unit_Of_Work.receivableMaster_Repository
            .Select_All_With_IncludesById_Pagination<ReceivableMaster>(
                t => t.IsDeleted != true &&
                t.Date >= startDate &&
                t.Date <= endDate,
                q => q.Include(m => m.ReceivableDetails).ThenInclude(pd => pd.LinkFile)
                      .Include(m => m.LinkFile)
                      .Include(m => m.ReceivableDocType)
            )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (query == null || query.ToList().Count == 0)
                return NotFound("No receivables found for the specified date range.");

            foreach (var master in query)
            {
                master.ReceivableDetails = master.ReceivableDetails
                    .Where(detail => detail.IsDeleted != true)
                    .ToList();
            }

            int totalRecords = await Unit_Of_Work.receivableMaster_Repository.CountAsync(t => t.Date >= startDate && t.Date <= endDate); ;

            var allDetails = query.SelectMany(pm => pm.ReceivableDetails).ToList();

            var saveIdsForMaster = query.Where(r => r.LinkFileID == 5).Select(r => r.BankOrSaveID).Distinct().ToList();
            var bankIdsForMaster = query.Where(r => r.LinkFileID == 6).Select(r => r.BankOrSaveID).Distinct().ToList();

            var suppliersIds = allDetails.Where(r => r.LinkFileID == 2).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var debitIds = allDetails.Where(r => r.LinkFileID == 3).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var creditsIds = allDetails.Where(r => r.LinkFileID == 4).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var saveIds = allDetails.Where(r => r.LinkFileID == 5).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var bankIds = allDetails.Where(r => r.LinkFileID == 6).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var incomesIds = allDetails.Where(r => r.LinkFileID == 7).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var outcomesIds = allDetails.Where(r => r.LinkFileID == 8).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var assetsIds = allDetails.Where(r => r.LinkFileID == 9).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var employeesIds = allDetails.Where(r => r.LinkFileID == 10).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var feeIds = allDetails.Where(r => r.LinkFileID == 11).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var discountIds = allDetails.Where(r => r.LinkFileID == 12).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var studentIds = allDetails.Where(r => r.LinkFileID == 13).Select(r => r.LinkFileTypeID).Distinct().ToList(); 
            
            var banksForMaster = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIdsForMaster.Contains(b.ID));
            var safesForMaster = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIdsForMaster.Contains(s.ID));

            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var safes = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));
            var suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(s => suppliersIds.Contains(s.ID));
            var debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(s => debitIds.Contains(s.ID));
            var credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(s => creditsIds.Contains(s.ID));
            var incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(s => incomesIds.Contains(s.ID));
            var outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(s => outcomesIds.Contains(s.ID));
            var assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(s => assetsIds.Contains(s.ID));
            var employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(s => employeesIds.Contains(s.ID));
            var fees = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(s => feeIds.Contains(s.ID));
            var discounts = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(s => discountIds.Contains(s.ID));
            var students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(s => studentIds.Contains(s.ID));

            List<ReceivableMasterGetDTO> DTOs = _mapper.Map<List<ReceivableMasterGetDTO>>(query);

            foreach (var dto in DTOs)
            {
                dto.BankOrSaveName = dto.LinkFileID switch
                {
                    5 => safesForMaster.FirstOrDefault(s => s.ID == dto.BankOrSaveID)?.Name,
                    6 => banksForMaster.FirstOrDefault(b => b.ID == dto.BankOrSaveID)?.Name,
                    _ => null
                };

                foreach (var detail in dto.ReceivableDetails)
                {
                    detail.LinkFileTypeName = detail.LinkFileID switch
                    {
                        2 => suppliers.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        3 => debits.FirstOrDefault(d => d.ID == detail.LinkFileTypeID)?.Name,
                        4 => credits.FirstOrDefault(c => c.ID == detail.LinkFileTypeID)?.Name,
                        5 => safes.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        6 => banks.FirstOrDefault(b => b.ID == detail.LinkFileTypeID)?.Name,
                        7 => incomes.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        8 => outcomes.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        9 => assets.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        10 => employees.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.en_name,
                        11 => fees.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        12 => discounts.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.Name,
                        13 => students.FirstOrDefault(s => s.ID == detail.LinkFileTypeID)?.en_name,
                        _ => null
                    };
                }
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTOs, Pagination = paginationMetadata });
        }
        #endregion

        #region Installment Deduction
        [HttpGet("GetInstallmentDeductionsByDate")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Installment Deduction Report" }
        )]
        public async Task<ActionResult> GetInstallmentDeductionsByDate(DateOnly startDate, DateOnly endDate, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (endDate < startDate)
                return BadRequest("Start date must be equal or greater than End date");

            List<InstallmentDeductionMaster> query = await Unit_Of_Work.installmentDeductionMaster_Repository.Select_All_With_IncludesById_Pagination<InstallmentDeductionMaster> (
                   f => f.IsDeleted != true &&
                   f.Date >= startDate &&
                   f.Date <= endDate,
                   query => query.Include(d => d.InstallmentDeductionDetails)
                   .ThenInclude(x => x.TuitionFeesType),
                   query => query.Include(d => d.Student),
                   query => query.Include(d => d.Employee)
                )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (query == null || query.Count == 0)
                return NotFound("No installment masters found for the specified date range.");

            foreach (var master in query)
            {
                master.InstallmentDeductionDetails = master.InstallmentDeductionDetails
                    .Where(detail => detail.IsDeleted != true)
                    .ToList();
            }

            int totalRecords = await Unit_Of_Work.installmentDeductionMaster_Repository.CountAsync(t => t.Date >= startDate && t.Date <= endDate);

            List<InstallmentDeductionMasterGetDTO> DTOs = _mapper.Map<List<InstallmentDeductionMasterGetDTO>>(query);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTOs, Pagination = paginationMetadata });
        }
        #endregion

        #region Accounting Entries
        [HttpGet("GetAccountingEntriesByDate")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting Entries Report" }
        )]
        public async Task<ActionResult> GetAccountingEntriesByDate(DateOnly startDate, DateOnly endDate, int pageNumber = 1, int pageSize = 10)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<AccountingEntriesMaster> query = await Unit_Of_Work.accountingEntriesMaster_Repository.Select_All_With_IncludesById_Pagination<AccountingEntriesMaster>(
                    t => t.IsDeleted != true &&
                    t.Date >= startDate && 
                    t.Date <= endDate,
                    query => query.Include(x => x.AccountingEntriesDocType),
                    query => query.Include(Master => Master.AccountingEntriesDetails)
                    .ThenInclude(x => x.AccountingTreeChart)
            )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (query == null || query.Count == 0)
                return NotFound("No accounting entries found for the specified date range.");

            foreach (var master in query)
            {
                master.AccountingEntriesDetails = master.AccountingEntriesDetails
                    .Where(detail => detail.IsDeleted != true)
                    .ToList();
            }

            int totalRecords = await Unit_Of_Work.accountingEntriesMaster_Repository.CountAsync(t => t.Date >= startDate && t.Date <= endDate);

            var allDetails = query.SelectMany(pm => pm.AccountingEntriesDetails).ToList();

            var suppliersIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 2).Select(r => r.SubAccountingID).Distinct().ToList();
            var debitIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 3).Select(r => r.SubAccountingID).Distinct().ToList();
            var creditsIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 4).Select(r => r.SubAccountingID).Distinct().ToList();
            var saveIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 5).Select(r => r.SubAccountingID).Distinct().ToList();
            var bankIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 6).Select(r => r.SubAccountingID).Distinct().ToList();
            var incomesIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 7).Select(r => r.SubAccountingID).Distinct().ToList();
            var outcomesIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 8).Select(r => r.SubAccountingID).Distinct().ToList();
            var assetsIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 9).Select(r => r.SubAccountingID).Distinct().ToList();
            var employeesIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 10).Select(r => r.SubAccountingID).Distinct().ToList();
            var feeIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 11).Select(r => r.SubAccountingID).Distinct().ToList();
            var discountIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 12).Select(r => r.SubAccountingID).Distinct().ToList();
            var studentIds = allDetails.Where(r => r.AccountingTreeChart.LinkFileID == 13).Select(r => r.SubAccountingID).Distinct().ToList();

            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var safes = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));
            var suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(s => suppliersIds.Contains(s.ID));
            var debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(s => debitIds.Contains(s.ID));
            var credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(s => creditsIds.Contains(s.ID));
            var incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(s => incomesIds.Contains(s.ID));
            var outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(s => outcomesIds.Contains(s.ID));
            var assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(s => assetsIds.Contains(s.ID));
            var employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(s => employeesIds.Contains(s.ID));
            var fees = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(s => feeIds.Contains(s.ID));
            var discounts = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(s => discountIds.Contains(s.ID));
            var students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(s => studentIds.Contains(s.ID));

            List<AccountingEntriesMasterGetDTO> DTOs = _mapper.Map<List<AccountingEntriesMasterGetDTO>>(query);

            foreach (var dto in DTOs)
            {
                foreach (var detail in dto.AccountingEntriesDetails)
                {
                    AccountingTreeChart acc = Unit_Of_Work.accountingTreeChart_Repository.First_Or_Default(
                        ac => ac.ID == detail.AccountingTreeChartID && ac.IsDeleted != true
                    );

                    detail.SubAccountingName = acc.LinkFileID switch
                    {
                        2 => suppliers.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.Name,
                        3 => debits.FirstOrDefault(d => d.ID == detail.SubAccountingID)?.Name,
                        4 => credits.FirstOrDefault(c => c.ID == detail.SubAccountingID)?.Name,
                        5 => safes.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.Name,
                        6 => banks.FirstOrDefault(b => b.ID == detail.SubAccountingID)?.Name,
                        7 => incomes.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.Name,
                        8 => outcomes.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.Name,
                        9 => assets.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.Name,
                        10 => employees.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.en_name,
                        11 => fees.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.Name,
                        12 => discounts.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.Name,
                        13 => students.FirstOrDefault(s => s.ID == detail.SubAccountingID)?.en_name,
                        _ => null
                    };
                }
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTOs, Pagination = paginationMetadata });
        }
        #endregion

        #region Fees Activation
        [HttpGet("GetFeesActivationByDate")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Fees Activation Report" }
        )]
        public async Task<ActionResult> GetFeesActivationByDate(DateOnly startDate, DateOnly endDate, int pageNumber = 1, int pageSize = 10)
        {
            UOW unit_of_work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (endDate < startDate)
                return BadRequest("Start date must be equal or greater than End date");

            List<FeesActivation> query = await unit_of_work.feesActivation_Repository.Select_All_With_IncludesById_Pagination<FeesActivation>(
                x => x.IsDeleted != true &&
                x.Date >= startDate &&
                x.Date <= endDate,
                query => query.Include(x => x.AcademicYear),
                query => query.Include(x => x.TuitionFeesType),
                query => query.Include(x => x.TuitionDiscountType),
                query => query.Include(x => x.Student)
            )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (query == null || query.Count == 0)
                return NotFound("No fees activation found for the specified date range.");

            int totalRecords = await unit_of_work.feesActivation_Repository.CountAsync(t => t.Date >= startDate && t.Date <= endDate);

            List<FeesActivationGetDTO> feesActDto = _mapper.Map<List<FeesActivationGetDTO>>(query);

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = feesActDto, Pagination = paginationMetadata });
        }
        #endregion
    }
}
