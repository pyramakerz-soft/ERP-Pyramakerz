using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
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
        [HttpGet("GetPayablesByDate/{id}")]
        public async Task<ActionResult> GetPayablesByDate(long id, string startDate, string endDate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);

            List<PayableDetails> PayableDetails = await Unit_Of_Work.payableDetails_Repository.Select_All_With_IncludesById<PayableDetails>(
                    t => t.IsDeleted != true && t.PayableMasterID == id,
                    query => query.Include(Master => Master.PayableMaster),
                    query => query.Include(Master => Master.LinkFile)
                    );

            if (PayableDetails == null || PayableDetails.Count == 0)
            {
                return NotFound();
            }

            var suppliersIds = PayableDetails.Where(r => r.LinkFileID == 2).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var debitIds = PayableDetails.Where(r => r.LinkFileID == 3).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var creditsIds = PayableDetails.Where(r => r.LinkFileID == 4).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var saveIds = PayableDetails.Where(r => r.LinkFileID == 5).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var bankIds = PayableDetails.Where(r => r.LinkFileID == 6).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var incomesIds = PayableDetails.Where(r => r.LinkFileID == 7).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var outcomesIds = PayableDetails.Where(r => r.LinkFileID == 8).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var assetsIds = PayableDetails.Where(r => r.LinkFileID == 9).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var employeesIds = PayableDetails.Where(r => r.LinkFileID == 10).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var feeIds = PayableDetails.Where(r => r.LinkFileID == 11).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var discountIds = PayableDetails.Where(r => r.LinkFileID == 12).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var studentIds = PayableDetails.Where(r => r.LinkFileID == 13).Select(r => r.LinkFileTypeID).Distinct().ToList();

            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));
            var Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(s => suppliersIds.Contains(s.ID));
            var Debit = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(s => debitIds.Contains(s.ID));
            var Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(s => creditsIds.Contains(s.ID));
            var Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(s => incomesIds.Contains(s.ID));
            var Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(s => outcomesIds.Contains(s.ID));
            var Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(s => assetsIds.Contains(s.ID));
            var Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(s => employeesIds.Contains(s.ID));
            var Fees = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(s => feeIds.Contains(s.ID));
            var Discount = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(s => discountIds.Contains(s.ID));
            var Students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(s => studentIds.Contains(s.ID));

            if (PayableDetails == null || PayableDetails.Count == 0)
                return NotFound("No payables found for the specified date range.");

            List<PayableDetails> payablesFilter = PayableDetails.Where(x => DateTime.Parse(x.PayableMaster?.Date).Date >= start && DateTime.Parse(x.PayableMaster?.Date).Date <= end).ToList();

            List<PayableDetailsGetDTO> DTOs = _mapper.Map<List<PayableDetailsGetDTO>>(payablesFilter);

            foreach (var dto in DTOs)
            {
                if (dto.LinkFileID == 6) // Bank
                {
                    var bank = banks.FirstOrDefault(b => b.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = bank?.Name;
                }
                else if (dto.LinkFileID == 5) // Save
                {
                    var save = saves.FirstOrDefault(s => s.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = save?.Name;
                }
                else if (dto.LinkFileID == 2) // Supplier
                {
                    var supplier = Suppliers.FirstOrDefault(s => s.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = supplier?.Name;
                }
                else if (dto.LinkFileID == 3) // Debit
                {
                    var debit = Debit.FirstOrDefault(d => d.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = debit?.Name;
                }
                else if (dto.LinkFileID == 4) // Credit
                {
                    var credit = Credits.FirstOrDefault(c => c.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = credit?.Name;
                }
                else if (dto.LinkFileID == 7) // Income
                {
                    var income = Incomes.FirstOrDefault(i => i.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = income?.Name;
                }
                else if (dto.LinkFileID == 8) // Outcome
                {
                    var outcome = Outcomes.FirstOrDefault(o => o.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = outcome?.Name;
                }
                else if (dto.LinkFileID == 9) // Asset
                {
                    var asset = Assets.FirstOrDefault(a => a.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = asset?.Name;
                }
                else if (dto.LinkFileID == 10) // Employee
                {
                    var employee = Employees.FirstOrDefault(e => e.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = employee?.en_name;
                }
                else if (dto.LinkFileID == 11) // Fee
                {
                    var fee = Fees.FirstOrDefault(f => f.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = fee?.Name;
                }
                else if (dto.LinkFileID == 12) // Discount
                {
                    var discount = Discount.FirstOrDefault(d => d.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = discount?.Name;
                }
                else if (dto.LinkFileID == 13) // Student
                {
                    var student = Students.FirstOrDefault(s => s.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = student?.en_name;
                }
            }

            return Ok(DTOs);
        }
        #endregion

        #region Receivables
        [HttpGet("GetReceivablesByDate/{id}")]
        public async Task<ActionResult> GetReceivablesByDate(long id, string startDate, string endDate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);

            List<ReceivableDetails> ReceivableDetails = await Unit_Of_Work.receivableDetails_Repository.Select_All_With_IncludesById<ReceivableDetails>(
                t => t.IsDeleted != true && t.ReceivableMasterID == id,
                query => query.Include(Master => Master.ReceivableMaster),
                query => query.Include(Master => Master.LinkFile)
            );

            if (ReceivableDetails == null || ReceivableDetails.Count == 0)
                return NotFound("No receivables found for the specified date range.");

            var suppliersIds = ReceivableDetails.Where(r => r.LinkFileID == 2).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var debitIds = ReceivableDetails.Where(r => r.LinkFileID == 3).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var creditsIds = ReceivableDetails.Where(r => r.LinkFileID == 4).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var saveIds = ReceivableDetails.Where(r => r.LinkFileID == 5).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var bankIds = ReceivableDetails.Where(r => r.LinkFileID == 6).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var incomesIds = ReceivableDetails.Where(r => r.LinkFileID == 7).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var outcomesIds = ReceivableDetails.Where(r => r.LinkFileID == 8).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var assetsIds = ReceivableDetails.Where(r => r.LinkFileID == 9).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var employeesIds = ReceivableDetails.Where(r => r.LinkFileID == 10).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var feeIds = ReceivableDetails.Where(r => r.LinkFileID == 11).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var discountIds = ReceivableDetails.Where(r => r.LinkFileID == 12).Select(r => r.LinkFileTypeID).Distinct().ToList();
            var studentIds = ReceivableDetails.Where(r => r.LinkFileID == 13).Select(r => r.LinkFileTypeID).Distinct().ToList();

            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));
            var Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(s => suppliersIds.Contains(s.ID));
            var Debit = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(s => debitIds.Contains(s.ID));
            var Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(s => creditsIds.Contains(s.ID));
            var Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(s => incomesIds.Contains(s.ID));
            var Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(s => outcomesIds.Contains(s.ID));
            var Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(s => assetsIds.Contains(s.ID));
            var Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(s => employeesIds.Contains(s.ID));
            var Fees = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(s => feeIds.Contains(s.ID));
            var Discount = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(s => discountIds.Contains(s.ID));
            var Students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(s => studentIds.Contains(s.ID));

            List<ReceivableDetails> receivablesFilter = ReceivableDetails.Where(x => DateTime.Parse(x.ReceivableMaster?.Date).Date >= start && DateTime.Parse(x.ReceivableMaster?.Date).Date <= end).ToList();

            List<ReceivableDetailsGetDTO> DTOs = _mapper.Map<List<ReceivableDetailsGetDTO>>(receivablesFilter);

            foreach (var dto in DTOs)
            {
                if (dto.LinkFileID == 6) // Bank
                {
                    var bank = banks.FirstOrDefault(b => b.ID == dto.LinkFileTypeID); 
                    dto.LinkFileTypeName = bank?.Name;
                }
                else if (dto.LinkFileID == 5) // Save
                {
                    var save = saves.FirstOrDefault(s => s.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = save?.Name;
                }
                else if (dto.LinkFileID == 2) // Supplier
                {
                    var supplier = Suppliers.FirstOrDefault(s => s.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = supplier?.Name;
                }
                else if (dto.LinkFileID == 3) // Debit
                {
                    var debit = Debit.FirstOrDefault(d => d.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = debit?.Name;
                }
                else if (dto.LinkFileID == 4) // Credit
                {
                    var credit = Credits.FirstOrDefault(c => c.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = credit?.Name;
                }
                else if (dto.LinkFileID == 7) // Income
                {
                    var income = Incomes.FirstOrDefault(i => i.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = income?.Name;
                }
                else if (dto.LinkFileID == 8) // Outcome
                {
                    var outcome = Outcomes.FirstOrDefault(o => o.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = outcome?.Name;
                }
                else if (dto.LinkFileID == 9) // Asset
                {
                    var asset = Assets.FirstOrDefault(a => a.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = asset?.Name;
                }
                else if (dto.LinkFileID == 10) // Employee
                {
                    var employee = Employees.FirstOrDefault(e => e.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = employee?.en_name;
                }
                else if (dto.LinkFileID == 11) // Fee
                {
                    var fee = Fees.FirstOrDefault(f => f.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = fee?.Name;
                }
                else if (dto.LinkFileID == 12) // Discount
                {
                    var discount = Discount.FirstOrDefault(d => d.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = discount?.Name;
                }
                else if (dto.LinkFileID == 13) // Student
                {
                    var student = Students.FirstOrDefault(s => s.ID == dto.LinkFileTypeID);
                    dto.LinkFileTypeName = student?.en_name;
                }
            }

            return Ok(DTOs);
        }
        #endregion

        #region Installment Deduction
        [HttpGet("GetInsDeducByDate/{id}")]
        public async Task<ActionResult> GetInsDeducByDate(long id, string startDate, string endDate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);

            List<InstallmentDeductionDetails> details = await Unit_Of_Work.installmentDeductionDetails_Repository.Select_All_With_IncludesById<InstallmentDeductionDetails> (
                   f => f.IsDeleted != true && f.InstallmentDeductionMasterID == id,
                   query => query.Include(Income => Income.TuitionFeesType)
                );

            if (details == null || details.Count == 0)
                return NotFound("No installment deduction found for the specified date range.");

            List<InstallmentDeductionDetails> InsDeducFilter = details.Where(x => DateTime.Parse(x.Date).Date >= start && DateTime.Parse(x.Date).Date <= end).ToList();

            List<InstallmentDeductionDetailsGetDTO> DTO = _mapper.Map<List<InstallmentDeductionDetailsGetDTO>>(details);

            return Ok(DTO);
        }
        #endregion

        #region Accounting Entries
        [HttpGet("GetAccEntriesByDate/{id}")]
        public async Task<ActionResult> GetAccEntriesByDate(long id, string startDate, string endDate)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);

            List<AccountingEntriesDetails> details = await Unit_Of_Work.accountingEntriesDetails_Repository.Select_All_With_IncludesById<AccountingEntriesDetails>(
                    t => t.IsDeleted != true && t.AccountingEntriesMasterID == id,
                    query => query.Include(Master => Master.AccountingTreeChart),
                    query => query.Include(Master => Master.AccountingEntriesMaster)
                    );

            if (details == null || details.Count == 0)
                return NotFound("No accounting entries found for the specified date range.");

            var suppliersIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 2).Select(r => r.SubAccountingID).Distinct().ToList();
            var debitIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 3).Select(r => r.SubAccountingID).Distinct().ToList();
            var creditsIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 4).Select(r => r.SubAccountingID).Distinct().ToList();
            var saveIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 5).Select(r => r.SubAccountingID).Distinct().ToList();
            var bankIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 6).Select(r => r.SubAccountingID).Distinct().ToList();
            var incomesIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 7).Select(r => r.SubAccountingID).Distinct().ToList();
            var outcomesIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 8).Select(r => r.SubAccountingID).Distinct().ToList();
            var assetsIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 9).Select(r => r.SubAccountingID).Distinct().ToList();
            var employeesIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 10).Select(r => r.SubAccountingID).Distinct().ToList();
            var feeIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 11).Select(r => r.SubAccountingID).Distinct().ToList();
            var discountIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 12).Select(r => r.SubAccountingID).Distinct().ToList();
            var studentIds = details.Where(r => r.AccountingTreeChart.LinkFileID == 13).Select(r => r.SubAccountingID).Distinct().ToList();

            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));
            var Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(s => suppliersIds.Contains(s.ID));
            var Debit = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(s => debitIds.Contains(s.ID));
            var Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(s => creditsIds.Contains(s.ID));
            var Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(s => incomesIds.Contains(s.ID));
            var Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(s => outcomesIds.Contains(s.ID));
            var Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(s => assetsIds.Contains(s.ID));
            var Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(s => employeesIds.Contains(s.ID));
            var Fees = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(s => feeIds.Contains(s.ID));
            var Discount = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(s => discountIds.Contains(s.ID));
            var Students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(s => studentIds.Contains(s.ID));

            List<AccountingEntriesDetails> detailsFilter = details.Where(x => DateTime.Parse(x.AccountingEntriesMaster?.Date).Date >= start && DateTime.Parse(x.AccountingEntriesMaster.Date).Date <= end).ToList();

            List<AccountingEntriesMasterGetDTO> accEntriesDto = _mapper.Map<List<AccountingEntriesMasterGetDTO>>(detailsFilter);

            return Ok(accEntriesDto);
        }
        #endregion

        #region Fees Activation
        [HttpGet("GetFeesActByDate")]
        public async Task<ActionResult> GetFeesActByDate(string startDate, string endDate)
        {
            UOW unit_of_work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DateTime start = DateTime.Parse(startDate);
            DateTime end = DateTime.Parse(endDate);

            List<FeesActivation> feesActEntries = await unit_of_work.feesActivation_Repository.Select_All_With_IncludesById<FeesActivation>(
                x => x.IsDeleted != true,
                query => query.Include(x => x.AcademicYear),
                query => query.Include(x => x.TuitionFeesType),
                query => query.Include(x => x.TuitionDiscountType),
                query => query.Include(x => x.Student)
            );

            if (feesActEntries == null || feesActEntries.Count == 0)
                return NotFound("No fees activation found for the specified date range.");

            List<FeesActivation> feesActFilter = feesActEntries.Where(x => DateTime.Parse(x.Date).Date >= start && DateTime.Parse(x.Date).Date <= end).ToList();

            List<FeesActivationGetDTO> feesActDto = _mapper.Map<List<FeesActivationGetDTO>>(feesActFilter);

            return Ok(feesActDto);
        }
        #endregion
    }
}
