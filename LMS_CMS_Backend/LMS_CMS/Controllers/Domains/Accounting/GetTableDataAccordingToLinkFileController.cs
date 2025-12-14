using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Octa;
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
    public class GetTableDataAccordingToLinkFileController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly UOW _Unit_Of_Work_Octa;

        public GetTableDataAccordingToLinkFileController(DbContextFactoryService dbContextFactory, IMapper mapper, UOW Unit_Of_Work)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _Unit_Of_Work_Octa = Unit_Of_Work;
        }
         
        [HttpGet("GetTableDataAccordingToLinkFileAndSubAccount/{linkFileId}/{subAccountId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting" }
        )]
        public async Task<IActionResult> GetTableDataAccordingToLinkFileAndSubAccount(long linkFileId, long subAccountId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (linkFileId == 0 || linkFileId == null)
            {
                return BadRequest("Enter Link File ID");
            }

            LinkFile LinkFile = Unit_Of_Work.linkFile_Repository.First_Or_Default(t => t.ID == linkFileId);
            if (LinkFile == null)
            {
                return BadRequest("There is no Link File with this ID");
            }

            if (linkFileId == 6) // Bank
            {
                List<Bank> banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (banks == null || banks.Count == 0)
                {
                    return NotFound();
                }

                List<BankGetDTO> DTOs = mapper.Map<List<BankGetDTO>>(banks);

                return Ok(DTOs);
            }
            else if (linkFileId == 5) // Save
            {
                List<Save> saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (saves == null || saves.Count == 0)
                {
                    return NotFound();
                }

                List<SaveGetDTO> DTOs = mapper.Map<List<SaveGetDTO>>(saves);

                return Ok(DTOs);
            }
            else if (linkFileId == 2) // Supplier
            {
                List<Supplier> Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (Suppliers == null || Suppliers.Count == 0)
                {
                    return NotFound();
                }

                List<SupplierGetDTO> DTOs = mapper.Map<List<SupplierGetDTO>>(Suppliers);

                return Ok(DTOs);
            }
            else if (linkFileId == 3) // Debit
            {
                List<Debit> Debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (Debits == null || Debits.Count == 0)
                {
                    return NotFound();
                }

                List<DebitGetDTO> DTOs = mapper.Map<List<DebitGetDTO>>(Debits);

                return Ok(DTOs);
            }
            else if (linkFileId == 4) // Credit
            {
                List<Credit> Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (Credits == null || Credits.Count == 0)
                {
                    return NotFound();
                }

                List<CreditGetDTO> DTOs = mapper.Map<List<CreditGetDTO>>(Credits);

                return Ok(DTOs);
            }
            else if (linkFileId == 7) // Income
            {
                List<Income> Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (Incomes == null || Incomes.Count == 0)
                {
                    return NotFound();
                }

                List<IncomeGetDTO> DTOs = mapper.Map<List<IncomeGetDTO>>(Incomes);

                return Ok(DTOs);
            }
            else if (linkFileId == 8) // Outcome
            {
                List<Outcome> Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (Outcomes == null || Outcomes.Count == 0)
                {
                    return NotFound();
                }

                List<OutcomeGetDTO> DTOs = mapper.Map<List<OutcomeGetDTO>>(Outcomes);

                return Ok(DTOs);
            }
            else if (linkFileId == 9) // Asset
            {
                List<Asset> Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (Assets == null || Assets.Count == 0)
                {
                    return NotFound();
                }

                List<AssetGetDTO> DTOs = mapper.Map<List<AssetGetDTO>>(Assets);

                return Ok(DTOs);
            }
            else if (linkFileId == 10) // Employee
            {
                List<Employee> Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (Employees == null || Employees.Count == 0)
                {
                    return NotFound();
                }

                List<Employee_GetDTO> DTOs = mapper.Map<List<Employee_GetDTO>>(Employees);

                return Ok(DTOs);
            }
            else if (linkFileId == 11) // Fee
            {
                List<TuitionFeesType> TuitionFeesTypes = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (TuitionFeesTypes == null || TuitionFeesTypes.Count == 0)
                {
                    return NotFound();
                }

                List<TuitionFeesTypeGetDTO> DTOs = mapper.Map<List<TuitionFeesTypeGetDTO>>(TuitionFeesTypes);

                return Ok(DTOs);
            }
            else if (linkFileId == 12) // Discount
            {
                List<TuitionDiscountType> TuitionDiscountTypes = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(
                    f => f.IsDeleted != true && f.AccountNumberID == subAccountId,
                    query => query.Include(b => b.AccountNumber));

                if (TuitionDiscountTypes == null || TuitionDiscountTypes.Count == 0)
                {
                    return NotFound();
                }

                List<TuitionDiscountTypeGetDTO> DTOs = mapper.Map<List<TuitionDiscountTypeGetDTO>>(TuitionDiscountTypes);

                return Ok(DTOs);
            }
            else if (linkFileId == 13) // Student
            {
                List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
                query => query.IsDeleted != true && query.AccountNumberID == subAccountId,
                query => query.Include(stu => stu.AccountNumber));

                if (students == null || students.Count == 0)
                {
                    return NotFound("No Student found");
                }

                List<StudentGetDTO> StudentDTO = mapper.Map<List<StudentGetDTO>>(students);
                return Ok(StudentDTO);
            }
            else
            {
                return BadRequest();
            }
        }

        /////// 

        [HttpGet("GetTableDataAccordingToLinkFile/{linkFileId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting" }
        )]
        public async Task<IActionResult> GetTableDataAccordingToLinkFile(long linkFileId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (linkFileId == 0 || linkFileId == null)
            {
                return BadRequest("Enter Link File ID");
            }

            LinkFile LinkFile = Unit_Of_Work.linkFile_Repository.First_Or_Default(t => t.ID == linkFileId);
            if (LinkFile == null)
            {
                return BadRequest("There is no Link File with this ID");
            }

            if (linkFileId == 6) // Bank
            {
                List<Bank> banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (banks == null || banks.Count == 0)
                {
                    return NotFound();
                }

                List<BankGetDTO> DTOs = mapper.Map<List<BankGetDTO>>(banks);

                return Ok(DTOs);
            }
            else if (linkFileId == 5) // Save
            {
                List<Save> saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (saves == null || saves.Count == 0)
                {
                    return NotFound();
                }

                List<SaveGetDTO> DTOs = mapper.Map<List<SaveGetDTO>>(saves);

                return Ok(DTOs);
            }
            else if (linkFileId == 2) // Supplier
            {
                List<Supplier> Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Suppliers == null || Suppliers.Count == 0)
                {
                    return NotFound();
                }

                List<SupplierGetDTO> DTOs = mapper.Map<List<SupplierGetDTO>>(Suppliers);

                return Ok(DTOs);
            }
            else if (linkFileId == 3) // Debit
            {
                List<Debit> Debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Debits == null || Debits.Count == 0)
                {
                    return NotFound();
                }

                List<DebitGetDTO> DTOs = mapper.Map<List<DebitGetDTO>>(Debits);

                return Ok(DTOs);
            }
            else if (linkFileId == 4) // Credit
            {
                List<Credit> Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Credits == null || Credits.Count == 0)
                {
                    return NotFound();
                }

                List<CreditGetDTO> DTOs = mapper.Map<List<CreditGetDTO>>(Credits);

                return Ok(DTOs);
            }
            else if (linkFileId == 7) // Income
            {
                List<Income> Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Incomes == null || Incomes.Count == 0)
                {
                    return NotFound();
                }

                List<IncomeGetDTO> DTOs = mapper.Map<List<IncomeGetDTO>>(Incomes);

                return Ok(DTOs);
            }
            else if (linkFileId == 8) // Outcome
            {
                List<Outcome> Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Outcomes == null || Outcomes.Count == 0)
                {
                    return NotFound();
                }

                List<OutcomeGetDTO> DTOs = mapper.Map<List<OutcomeGetDTO>>(Outcomes);

                return Ok(DTOs);
            }
            else if (linkFileId == 9) // Asset
            {
                List<Asset> Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Assets == null || Assets.Count == 0)
                {
                    return NotFound();
                }

                List<AssetGetDTO> DTOs = mapper.Map<List<AssetGetDTO>>(Assets);

                return Ok(DTOs);
            }
            else if (linkFileId == 10) // Employee
            {
                List<Employee> Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Employees == null || Employees.Count == 0)
                {
                    return NotFound();
                }

                List<Employee_GetDTO> DTOs = mapper.Map<List<Employee_GetDTO>>(Employees);

                return Ok(DTOs);
            }
            else if (linkFileId == 11) // Fee
            {
                List<TuitionFeesType> TuitionFeesTypes = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (TuitionFeesTypes == null || TuitionFeesTypes.Count == 0)
                {
                    return NotFound();
                }

                List<TuitionFeesTypeGetDTO> DTOs = mapper.Map<List<TuitionFeesTypeGetDTO>>(TuitionFeesTypes);

                return Ok(DTOs);
            }
            else if (linkFileId == 12) // Discount
            {
                List<TuitionDiscountType> TuitionDiscountTypes = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (TuitionDiscountTypes == null || TuitionDiscountTypes.Count == 0)
                {
                    return NotFound();
                }

                List<TuitionDiscountTypeGetDTO> DTOs = mapper.Map<List<TuitionDiscountTypeGetDTO>>(TuitionDiscountTypes);

                return Ok(DTOs);
            }
            else if (linkFileId == 13) // Student
            {
                List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
                query => query.IsDeleted != true,
                query => query.Include(stu => stu.AccountNumber));

                if (students == null || students.Count == 0)
                {
                    return NotFound("No Student found");
                }

                List<StudentGetDTO> StudentDTO = mapper.Map<List<StudentGetDTO>>(students);
                foreach (var item in StudentDTO)
                {
                    Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(item.Nationality);
                    if (nationality != null)
                    {
                        item.NationalityEnName = nationality.Name;
                        item.NationalityArName = nationality.ArName;
                    }
                }
                return Ok(StudentDTO);
            }
            else
            {
                return BadRequest();
            }
        }

        /////// 
        
        [HttpGet("GetTableDataAccordingToLinkFileForPyable/{linkFileId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting" }
        )]
        public async Task<IActionResult> GetTableDataAccordingToLinkFileForPyable(long linkFileId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            if (linkFileId == 0 || linkFileId == null)
            {
                return BadRequest("Enter Link File ID");
            }

            LinkFile LinkFile = Unit_Of_Work.linkFile_Repository.First_Or_Default(t => t.ID == linkFileId);
            if (LinkFile == null)
            {
                return BadRequest("There is no Link File with this ID");
            }

            if (linkFileId == 6) // Bank
            {
                List<BankEmployee> bankEmployees = await Unit_Of_Work.bankEmployee_Repository.Select_All_With_IncludesById<BankEmployee>(
                   f => f.IsDeleted != true && f.EmployeeID == userId,
                   query => query.Include(d => d.Bank),
                   query => query.Include(d => d.Employee));

                if (bankEmployees == null || bankEmployees.Count == 0)
                {
                    return NotFound();
                }
                List<long> banksIds = bankEmployees.Select(e=>e.BankID).Distinct().ToList();
                List<Bank> banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(
                    f => f.IsDeleted != true && banksIds.Contains(f.ID),
                    query => query.Include(b => b.AccountNumber));

                if (banks == null || banks.Count == 0)
                {
                    return NotFound();
                }

                List<BankGetDTO> DTOs = mapper.Map<List<BankGetDTO>>(banks);

                return Ok(DTOs);
            }
            else if (linkFileId == 5) // Save
            {

                List<SafeEmployee> safeEmployees = await Unit_Of_Work.safeEmployee_Repository.Select_All_With_IncludesById<SafeEmployee>(
                        f => f.IsDeleted != true && f.EmployeeID == userId,
                        query => query.Include(d => d.Save),
                        query => query.Include(d => d.Employee));

                if (safeEmployees == null || safeEmployees.Count == 0)
                {
                    return NotFound();
                }
                List<long> safesIds = safeEmployees.Select(e => e.SaveID).Distinct().ToList();

                List<Save> saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(
                    f => f.IsDeleted != true && safesIds.Contains(f.ID),
                    query => query.Include(b => b.AccountNumber));

                if (saves == null || saves.Count == 0)
                {
                    return NotFound();
                }

                List<SaveGetDTO> DTOs = mapper.Map<List<SaveGetDTO>>(saves);

                return Ok(DTOs);
            }
            else if (linkFileId == 2) // Supplier
            {
                List<Supplier> Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Suppliers == null || Suppliers.Count == 0)
                {
                    return NotFound();
                }

                List<SupplierGetDTO> DTOs = mapper.Map<List<SupplierGetDTO>>(Suppliers);

                return Ok(DTOs);
            }
            else if (linkFileId == 3) // Debit
            {
                List<Debit> Debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Debits == null || Debits.Count == 0)
                {
                    return NotFound();
                }

                List<DebitGetDTO> DTOs = mapper.Map<List<DebitGetDTO>>(Debits);

                return Ok(DTOs);
            }
            else if (linkFileId == 4) // Credit
            {
                List<Credit> Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Credits == null || Credits.Count == 0)
                {
                    return NotFound();
                }

                List<CreditGetDTO> DTOs = mapper.Map<List<CreditGetDTO>>(Credits);

                return Ok(DTOs);
            }
            else if (linkFileId == 7) // Income
            {
                List<Income> Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Incomes == null || Incomes.Count == 0)
                {
                    return NotFound();
                }

                List<IncomeGetDTO> DTOs = mapper.Map<List<IncomeGetDTO>>(Incomes);

                return Ok(DTOs);
            }
            else if (linkFileId == 8) // Outcome
            {
                List<Outcome> Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Outcomes == null || Outcomes.Count == 0)
                {
                    return NotFound();
                }

                List<OutcomeGetDTO> DTOs = mapper.Map<List<OutcomeGetDTO>>(Outcomes);

                return Ok(DTOs);
            }
            else if (linkFileId == 9) // Asset
            {
                List<Asset> Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Assets == null || Assets.Count == 0)
                {
                    return NotFound();
                }

                List<AssetGetDTO> DTOs = mapper.Map<List<AssetGetDTO>>(Assets);

                return Ok(DTOs);
            }
            else if (linkFileId == 10) // Employee
            {
                List<Employee> Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (Employees == null || Employees.Count == 0)
                {
                    return NotFound();
                }

                List<Employee_GetDTO> DTOs = mapper.Map<List<Employee_GetDTO>>(Employees);

                return Ok(DTOs);
            }
            else if (linkFileId == 11) // Fee
            {
                List<TuitionFeesType> TuitionFeesTypes = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (TuitionFeesTypes == null || TuitionFeesTypes.Count == 0)
                {
                    return NotFound();
                }

                List<TuitionFeesTypeGetDTO> DTOs = mapper.Map<List<TuitionFeesTypeGetDTO>>(TuitionFeesTypes);

                return Ok(DTOs);
            }
            else if (linkFileId == 12) // Discount
            {
                List<TuitionDiscountType> TuitionDiscountTypes = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(
                    f => f.IsDeleted != true,
                    query => query.Include(b => b.AccountNumber));

                if (TuitionDiscountTypes == null || TuitionDiscountTypes.Count == 0)
                {
                    return NotFound();
                }

                List<TuitionDiscountTypeGetDTO> DTOs = mapper.Map<List<TuitionDiscountTypeGetDTO>>(TuitionDiscountTypes);

                return Ok(DTOs);
            }
            else if (linkFileId == 13) // Student
            {
                List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
                query => query.IsDeleted != true,
                query => query.Include(stu => stu.AccountNumber));

                if (students == null || students.Count == 0)
                {
                    return NotFound("No Student found");
                }

                List<StudentGetDTO> StudentDTO = mapper.Map<List<StudentGetDTO>>(students);
                foreach (var item in StudentDTO)
                {
                    Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(item.Nationality);
                    if (nationality != null)
                    {
                        item.NationalityEnName = nationality.Name;
                        item.NationalityArName = nationality.ArName;
                    }
                }
                return Ok(StudentDTO);
            }
            else
            {
                return BadRequest();
            }
        }

        /////// 


        [HttpGet("GetAllTableDataAccordingForPyable")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting" }
        )]
        public async Task<IActionResult> GetAllTableDataAccordingForPyable()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);

            LinFileTypeDataDTO linFileTypeDataDTO = new LinFileTypeDataDTO();

             // bank
            List<BankEmployee> bankEmployees = await Unit_Of_Work.bankEmployee_Repository.Select_All_With_IncludesById<BankEmployee>(
                f => f.IsDeleted != true && f.EmployeeID == userId,
                query => query.Include(d => d.Bank),
                query => query.Include(d => d.Employee));

            if (bankEmployees == null || bankEmployees.Count == 0)
            {
                bankEmployees = new List<BankEmployee>();
            }

            List<long> banksIds = bankEmployees.Select(e => e.BankID).Distinct().ToList();
            List<Bank> banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(
                f => f.IsDeleted != true && banksIds.Contains(f.ID),
                query => query.Include(b => b.AccountNumber));

            if (banks == null || banks.Count == 0)
            {
                banks = new List<Bank>();
            }

            linFileTypeDataDTO.bankGetDTOs = mapper.Map<List<BankGetDTO>>(banks);

             // Save

            List<SafeEmployee> safeEmployees = await Unit_Of_Work.safeEmployee_Repository.Select_All_With_IncludesById<SafeEmployee>(
                    f => f.IsDeleted != true && f.EmployeeID == userId,
                    query => query.Include(d => d.Save),
                    query => query.Include(d => d.Employee));

            if (safeEmployees == null || safeEmployees.Count == 0)
            {
                safeEmployees = new List<SafeEmployee>();
            }
            List<long> safesIds = safeEmployees.Select(e => e.SaveID).Distinct().ToList();

            List<Save> saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(
                f => f.IsDeleted != true && safesIds.Contains(f.ID),
                query => query.Include(b => b.AccountNumber));

            if (saves == null || saves.Count == 0)
            {
                saves = new List<Save>();
            }

            linFileTypeDataDTO.saveGetDTO = mapper.Map<List<SaveGetDTO>>(saves);

            // Supplier

            List<Supplier> Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Suppliers == null || Suppliers.Count == 0)
            {
                Suppliers = new List<Supplier>();
            }

            linFileTypeDataDTO.supplierGetDTO = mapper.Map<List<SupplierGetDTO>>(Suppliers);

            // Debit

            List<Debit> Debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Debits == null || Debits.Count == 0)
            {
                Debits = new List<Debit>();
            }

            linFileTypeDataDTO.debitGetDTO = mapper.Map<List<DebitGetDTO>>(Debits);


            // Credit

            List<Credit> Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Credits == null || Credits.Count == 0)
            {
                Credits = new List<Credit>();
            }

            linFileTypeDataDTO.creditGetDTO = mapper.Map<List<CreditGetDTO>>(Credits);

            // Income
            List<Income> Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Incomes == null || Incomes.Count == 0)
            {
                Incomes = new List<Income>();
            }

            linFileTypeDataDTO.incomeGetDTO = mapper.Map<List<IncomeGetDTO>>(Incomes);

            // Outcome
            List<Outcome> Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Outcomes == null || Outcomes.Count == 0)
            {
                Outcomes = new List<Outcome>();
            }

            linFileTypeDataDTO.outcomeGetDTO = mapper.Map<List<OutcomeGetDTO>>(Outcomes);

            // Asset
            List<Asset> Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Assets == null || Assets.Count == 0)
            {
                Assets = new List<Asset>();
            }

            linFileTypeDataDTO.assetGetDTO = mapper.Map<List<AssetGetDTO>>(Assets);

            // Employee
            List<Employee> Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Employees == null || Employees.Count == 0)
            {
                Employees = new List<Employee>();
            }

            linFileTypeDataDTO.employee_GetDTO = mapper.Map<List<Employee_GetDTO>>(Employees);

            // Fee
            List<TuitionFeesType> TuitionFeesTypes = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (TuitionFeesTypes == null || TuitionFeesTypes.Count == 0)
            {
                TuitionFeesTypes =  new List<TuitionFeesType>();
            }

            linFileTypeDataDTO.tuitionFeesTypeGetDTO = mapper.Map<List<TuitionFeesTypeGetDTO>>(TuitionFeesTypes);

            List<TuitionDiscountType> TuitionDiscountTypes = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (TuitionDiscountTypes == null || TuitionDiscountTypes.Count == 0)
            {
                TuitionDiscountTypes = new List<TuitionDiscountType>();
            }

            linFileTypeDataDTO.tuitionDiscountTypeGetDTO = mapper.Map<List<TuitionDiscountTypeGetDTO>>(TuitionDiscountTypes);

            List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
            query => query.IsDeleted != true,
            query => query.Include(stu => stu.AccountNumber));

            if (students == null || students.Count == 0)
            {
                students = new List<Student>();
            }

            linFileTypeDataDTO.studentGetDTO = mapper.Map<List<StudentGetDTO>>(students);
            foreach (var item in linFileTypeDataDTO.studentGetDTO)
            {
                Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(item.Nationality);
                if (nationality != null)
                {
                    item.NationalityEnName = nationality.Name;
                    item.NationalityArName = nationality.ArName;
                }
            }

            return Ok(linFileTypeDataDTO);

        }


        /////// 

        [HttpGet("GetAllTableDataAccordingToLinkFile")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Accounting" }
        )]
        public async Task<IActionResult> GetAllTableDataAccordingToLinkFile()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            LinFileTypeDataDTO linFileTypeDataDTO = new LinFileTypeDataDTO();


            // Bank
            List<Bank> banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (banks == null || banks.Count == 0)
            {
                return NotFound();
            }

            linFileTypeDataDTO.bankGetDTOs = mapper.Map<List<BankGetDTO>>(banks);

            // Safe
            List<Save> saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (saves == null || saves.Count == 0)
            {
                return NotFound();
            }

            linFileTypeDataDTO.saveGetDTO = mapper.Map<List<SaveGetDTO>>(saves);


            // Supplier
            List<Supplier> Suppliers = await Unit_Of_Work.supplier_Repository.Select_All_With_IncludesById<Supplier>(
                         f => f.IsDeleted != true,
                         query => query.Include(b => b.AccountNumber));

            if (Suppliers == null || Suppliers.Count == 0)
            {
                Suppliers = new List<Supplier>();
            }

            linFileTypeDataDTO.supplierGetDTO = mapper.Map<List<SupplierGetDTO>>(Suppliers);

            // Debit

            List<Debit> Debits = await Unit_Of_Work.debit_Repository.Select_All_With_IncludesById<Debit>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Debits == null || Debits.Count == 0)
            {
                Debits = new List<Debit>();
            }

            linFileTypeDataDTO.debitGetDTO = mapper.Map<List<DebitGetDTO>>(Debits);


            // Credit
            List<Credit> Credits = await Unit_Of_Work.credit_Repository.Select_All_With_IncludesById<Credit>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Credits == null || Credits.Count == 0)
            {
                Credits = new List<Credit>();
            }

            linFileTypeDataDTO.creditGetDTO = mapper.Map<List<CreditGetDTO>>(Credits);

            // Income
            List<Income> Incomes = await Unit_Of_Work.income_Repository.Select_All_With_IncludesById<Income>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Incomes == null || Incomes.Count == 0)
            {
                Incomes = new List<Income>();
            }

            linFileTypeDataDTO.incomeGetDTO = mapper.Map<List<IncomeGetDTO>>(Incomes);

            // Outcome
            List<Outcome> Outcomes = await Unit_Of_Work.outcome_Repository.Select_All_With_IncludesById<Outcome>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Outcomes == null || Outcomes.Count == 0)
            {
                Outcomes = new List<Outcome>();
            }

            linFileTypeDataDTO.outcomeGetDTO = mapper.Map<List<OutcomeGetDTO>>(Outcomes);

            // Asset
            List<Asset> Assets = await Unit_Of_Work.asset_Repository.Select_All_With_IncludesById<Asset>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Assets == null || Assets.Count == 0)
            {
                Assets = new List<Asset>();
            }

            linFileTypeDataDTO.assetGetDTO = mapper.Map<List<AssetGetDTO>>(Assets);

            // Employee
            List<Employee> Employees = await Unit_Of_Work.employee_Repository.Select_All_With_IncludesById<Employee>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (Employees == null || Employees.Count == 0)
            {
                Employees = new List<Employee>();
            }

            linFileTypeDataDTO.employee_GetDTO = mapper.Map<List<Employee_GetDTO>>(Employees);

            // Fee
            List<TuitionFeesType> TuitionFeesTypes = await Unit_Of_Work.tuitionFeesType_Repository.Select_All_With_IncludesById<TuitionFeesType>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (TuitionFeesTypes == null || TuitionFeesTypes.Count == 0)
            {
                TuitionFeesTypes = new List<TuitionFeesType>();
            }

            linFileTypeDataDTO.tuitionFeesTypeGetDTO = mapper.Map<List<TuitionFeesTypeGetDTO>>(TuitionFeesTypes);

            // TuitionDiscountType
            List<TuitionDiscountType> TuitionDiscountTypes = await Unit_Of_Work.tuitionDiscountType_Repository.Select_All_With_IncludesById<TuitionDiscountType>(
                f => f.IsDeleted != true,
                query => query.Include(b => b.AccountNumber));

            if (TuitionDiscountTypes == null || TuitionDiscountTypes.Count == 0)
            {
                TuitionDiscountTypes = new List<TuitionDiscountType>();
            }

            linFileTypeDataDTO.tuitionDiscountTypeGetDTO = mapper.Map<List<TuitionDiscountTypeGetDTO>>(TuitionDiscountTypes);

            // Student
            List<Student> students = await Unit_Of_Work.student_Repository.Select_All_With_IncludesById<Student>(
            query => query.IsDeleted != true,
            query => query.Include(stu => stu.AccountNumber));

            if (students == null || students.Count == 0)
            {
                students = new List<Student>();
            }

            linFileTypeDataDTO.studentGetDTO = mapper.Map<List<StudentGetDTO>>(students);
            foreach (var item in linFileTypeDataDTO.studentGetDTO)
            {
                Nationality nationality = _Unit_Of_Work_Octa.nationality_Repository.Select_By_Id_Octa(item.Nationality);
                if (nationality != null)
                {
                    item.NationalityEnName = nationality.Name;
                    item.NationalityArName = nationality.ArName;
                }
            }

            return Ok(linFileTypeDataDTO);
        }
    }
}
