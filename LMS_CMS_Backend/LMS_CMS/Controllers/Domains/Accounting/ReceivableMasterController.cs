using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations.Domains;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
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
    public class ReceivableMasterController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ReceivableMasterController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Receivable" }
        )]
        public async Task<IActionResult> GetAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            int totalRecords = await Unit_Of_Work.receivableMaster_Repository
                .CountAsync(f => f.IsDeleted != true);

            List<ReceivableMaster> Receivables = await Unit_Of_Work.receivableMaster_Repository.Select_All_With_IncludesById_Pagination<ReceivableMaster>(
                    t => t.IsDeleted != true ,
                    query => query.Include(Master => Master.ReceivableDocType),
                    query => query.Include(Master => Master.LinkFile)
                    )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (Receivables == null || Receivables.Count == 0)
            {
                return NotFound();
            }

            var bankIds = Receivables.Where(r => r.LinkFileID == 6).Select(r => r.BankOrSaveID).Distinct().ToList();
            var saveIds = Receivables.Where(r => r.LinkFileID == 5).Select(r => r.BankOrSaveID).Distinct().ToList();

            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));

            List<ReceivableMasterGetDTO> DTOs = mapper.Map<List<ReceivableMasterGetDTO>>(Receivables);

            foreach (var dto in DTOs)
            {
                if (dto.LinkFileID == 6) // Bank
                {
                    var bank = banks.FirstOrDefault(b => b.ID == dto.BankOrSaveID);
                    dto.BankOrSaveName = bank?.Name;
                }
                else if (dto.LinkFileID == 5) // Save
                {
                    var save = saves.FirstOrDefault(s => s.ID == dto.BankOrSaveID);
                    dto.BankOrSaveName = save?.Name;
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

        //////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Receivable" }
        )]
        public async Task<IActionResult> GetbyIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0 || id == null)
            {
                return BadRequest("Enter Doc Type ID");
            } 

            ReceivableMaster ReceivableMaster = await Unit_Of_Work.receivableMaster_Repository.FindByIncludesAsync(
                    acc => acc.IsDeleted != true && acc.ID == id,
                    query => query.Include(ac => ac.LinkFile),
                    query => query.Include(ac => ac.ReceivableDocType)
                    );

            if (ReceivableMaster == null)
            {
                return NotFound();
            }

            string bankOrSaveName = null;

            if (ReceivableMaster.LinkFileID == 6) // Bank
            {
                var bank = await Unit_Of_Work.bank_Repository.FindByIncludesAsync(b => b.IsDeleted != true && b.ID == ReceivableMaster.BankOrSaveID);
                bankOrSaveName = bank?.Name;
            }
            else if (ReceivableMaster.LinkFileID == 5) // Save
            {
                var save = await Unit_Of_Work.save_Repository.FindByIncludesAsync(s => s.IsDeleted != true && s.ID == ReceivableMaster.BankOrSaveID);
                bankOrSaveName = save?.Name;
            }

            ReceivableMasterGetDTO ReceivableMasterGetDTO = mapper.Map<ReceivableMasterGetDTO>(ReceivableMaster);
            ReceivableMasterGetDTO.BankOrSaveName = bankOrSaveName;

            List<ReceivableDetails> ReceivableDetails = await Unit_Of_Work.receivableDetails_Repository.Select_All_With_IncludesById<ReceivableDetails>(
                t => t.IsDeleted != true && t.ReceivableMasterID == id,
                query => query.Include(Master => Master.ReceivableMaster),
                query => query.Include(Master => Master.LinkFile)
                );

            ReceivableMasterGetDTO.ReceivableDetails = mapper.Map<List<ReceivableDetailsGetDTO>>(ReceivableDetails);

            foreach (var detail in ReceivableMasterGetDTO.ReceivableDetails)
            {
                if (detail.LinkFileID == 6) // Bank
                {
                    var bank = Unit_Of_Work.bank_Repository.First_Or_Default(b => b.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = bank?.Name;
                }
                else if (detail.LinkFileID == 5) // Save
                {
                    var save = Unit_Of_Work.save_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = save?.Name;
                }
                else if (detail.LinkFileID == 2) // Supplier
                {
                    var supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = supplier?.Name;
                }
                else if (detail.LinkFileID == 3) // Debit
                {
                    var debit = Unit_Of_Work.debit_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = debit?.Name;
                }
                else if (detail.LinkFileID == 4) // Credit
                {
                    var credit = Unit_Of_Work.credit_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = credit?.Name;
                }
                else if (detail.LinkFileID == 7) // Income
                {
                    var income = Unit_Of_Work.income_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = income?.Name;
                }
                else if (detail.LinkFileID == 8) // Outcome
                {
                    var outcome = Unit_Of_Work.outcome_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = outcome?.Name;
                }
                else if (detail.LinkFileID == 9) // Asset
                {
                    var asset = Unit_Of_Work.asset_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = asset?.Name;
                }
                else if (detail.LinkFileID == 10) // Employee
                {
                    var employee = Unit_Of_Work.employee_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = employee?.en_name;
                }
                else if (detail.LinkFileID == 11) // Fee
                {
                    var fee = Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = fee?.Name;
                }
                else if (detail.LinkFileID == 12) // Discount
                {
                    var discount = Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = discount?.Name;
                }
                else if (detail.LinkFileID == 13) // Student
                {
                    var student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == detail.LinkFileTypeID);
                    detail.LinkFileTypeName = student?.en_name;
                }
            }
            return Ok(ReceivableMasterGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Receivable" }
        )]
        public IActionResult Add(ReceivableMasterAddDTO newMaster)
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
                return BadRequest("Receivable cannot be null");
            }

            ReceivableDocType ReceivableDocType = Unit_Of_Work.receivableDocType_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newMaster.ReceivableDocTypesID);
            if(ReceivableDocType == null)
            {
                return BadRequest("there is no Receivable Doc Type with this ID"); 
            }

            LinkFile LinkFile = Unit_Of_Work.linkFile_Repository.First_Or_Default(t => t.ID == newMaster.LinkFileID);
            if(LinkFile == null)
            {
                return BadRequest("there is no Link File with this ID"); 
            }

            // Bank
            if (newMaster.LinkFileID == 6)
            {
                Bank Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                if (Bank == null)
                {
                    return BadRequest("There is no Bank with this ID in the database.");
                }
                else
                {
                    BankEmployee bankEmployee = Unit_Of_Work.bankEmployee_Repository.First_Or_Default(a => a.EmployeeID == userId && a.BankID == newMaster.BankOrSaveID && a.IsDeleted != true);
                    if (bankEmployee == null)
                    {
                        return BadRequest("You do not have access on this bank.");
                    }
                }
            } else if(newMaster.LinkFileID == 5) // Save
            {
                Save Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                if (Save == null)
                {
                    return BadRequest("There is no Save with this ID in the database.");
                }
                else
                {
                    SafeEmployee safeEmployee = Unit_Of_Work.safeEmployee_Repository.First_Or_Default(a => a.EmployeeID == userId && a.SaveID == newMaster.BankOrSaveID && a.IsDeleted != true);
                    if (safeEmployee == null)
                    {
                        return BadRequest("You do not have access on this safe.");
                    }
                }
            }
            else
            {
                return BadRequest("Link File Must be Save or Bank");
            }

            ReceivableMaster ReceivableMaster = mapper.Map<ReceivableMaster>(newMaster);
            if (newMaster.LinkFileID == 6) // Bank
            {
                ReceivableMaster.BankOrSaveID = newMaster.BankOrSaveID;
                ReceivableMaster.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
            }
            else if (newMaster.LinkFileID == 5) // Save
            {
                ReceivableMaster.BankOrSaveID = newMaster.BankOrSaveID;
                ReceivableMaster.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            ReceivableMaster.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                ReceivableMaster.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                ReceivableMaster.InsertedByUserId = userId;
            }

            Unit_Of_Work.receivableMaster_Repository.Add(ReceivableMaster);
            Unit_Of_Work.SaveChanges();
            return Ok(new ReceivablePutDTO { ID = ReceivableMaster.ID });
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Receivable" }
        )]
        public IActionResult Edit(ReceivablePutDTO newMaster)
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
                return BadRequest("Receivable cannot be null");
            }

            ReceivableMaster Receivable = Unit_Of_Work.receivableMaster_Repository.First_Or_Default(d => d.ID == newMaster.ID && d.IsDeleted != true);
            if (Receivable == null)
            {
                return NotFound("There is no Receivable with this id");
            }

            ReceivableDocType ReceivableDocType = Unit_Of_Work.receivableDocType_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newMaster.ReceivableDocTypesID);
            if (ReceivableDocType == null)
            {
                return BadRequest("there is no Receivable Doc Type with this ID");
            }

            LinkFile LinkFile = Unit_Of_Work.linkFile_Repository.First_Or_Default(t => t.ID == newMaster.LinkFileID);
            if (LinkFile == null)
            {
                return BadRequest("there is no Link File with this ID");
            }

            // Bank
            if (newMaster.LinkFileID == 6)
            {
                Bank Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                if (Bank == null)
                {
                    return BadRequest("There is no Bank with this ID in the database.");
                }
                else
                {
                    BankEmployee bankEmployee = Unit_Of_Work.bankEmployee_Repository.First_Or_Default(a => a.EmployeeID == userId && a.BankID == newMaster.BankOrSaveID && a.IsDeleted != true);
                    if (bankEmployee == null)
                    {
                        return BadRequest("You do not have access on this bank.");
                    }
                }
            }
            else if (newMaster.LinkFileID == 5) // Save
            {
                Save Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                if (Save == null)
                {
                    return BadRequest("There is no Save with this ID in the database.");
                }
                else
                {
                    SafeEmployee safeEmployee = Unit_Of_Work.safeEmployee_Repository.First_Or_Default(a => a.EmployeeID == userId && a.SaveID == newMaster.BankOrSaveID && a.IsDeleted != true);
                    if (safeEmployee == null)
                    {
                        return BadRequest("You do not have access on this safe.");
                    }
                }
            }
            else
            {
                return BadRequest("Link File Must be Save or Bank");
            } 
             
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Receivable", roleId, userId, Receivable);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newMaster, Receivable);

            if (newMaster.LinkFileID == 6) // Bank
            {
                Receivable.BankOrSaveID = newMaster.BankOrSaveID;
                Receivable.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                Receivable.Save = null;
            }
            else if (newMaster.LinkFileID == 5) // Save
            {
                Receivable.BankOrSaveID = newMaster.BankOrSaveID;
                Receivable.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                Receivable.Bank = null;
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            Receivable.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                Receivable.UpdatedByOctaId = userId;
                if (Receivable.UpdatedByUserId != null)
                {
                    Receivable.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                Receivable.UpdatedByUserId = userId;
                if (Receivable.UpdatedByOctaId != null)
                {
                    Receivable.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.receivableMaster_Repository.Update(Receivable);
            Unit_Of_Work.SaveChanges();

            if (newMaster.NewDetails != null)
            {
                foreach (var newDetails in newMaster.NewDetails)
                {
                    ReceivableDetails receivableDetails = mapper.Map<ReceivableDetails>(newDetails);

                    // Set up the corresponding LinkFileType (based on LinkFileID)
                    if (newDetails.LinkFileID == 6) // Bank
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 5) // Save
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 2) // Supplier
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 3) // Debit
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Debit = Unit_Of_Work.debit_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 4) // Credit
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Credit = Unit_Of_Work.credit_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 7) // Income
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Income = Unit_Of_Work.income_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 8) // Outcome
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Outcome = Unit_Of_Work.outcome_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 9) // Asset
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Asset = Unit_Of_Work.asset_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 10) // Employee
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Employee = Unit_Of_Work.employee_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 11) // Fee
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.TuitionFeesType = Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 12) // Discount
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.TuitionDiscountType = Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 13) // Student
                    {
                        receivableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        receivableDetails.Student = Unit_Of_Work.student_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }

                    receivableDetails.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        receivableDetails.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        receivableDetails.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.receivableDetails_Repository.Add(receivableDetails);
                    Unit_Of_Work.SaveChanges();
                }
            }

            if (newMaster.UpdatedDetails != null)
            {
                foreach (var newDetail in newMaster.UpdatedDetails)
                {
                    ReceivableDetails receivableDetails = Unit_Of_Work.receivableDetails_Repository.First_Or_Default(d => d.ID == newDetail.ID && d.IsDeleted != true);
                    if (receivableDetails == null)
                    {
                        return NotFound("There is no receivableDetails with this id");
                    }

                    mapper.Map(newDetail, receivableDetails);

                    if (newDetail.LinkFileID == 6) // Bank
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 5) // Save
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 2) // Supplier
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 3) // Debit
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Debit = Unit_Of_Work.debit_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 4) // Credit
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Credit = Unit_Of_Work.credit_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 7) // Income
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Income = Unit_Of_Work.income_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 8) // Outcome
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Outcome = Unit_Of_Work.outcome_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 9) // Asset
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Asset = Unit_Of_Work.asset_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 10) // Employee
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Employee = Unit_Of_Work.employee_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 11) // Fee
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.TuitionFeesType = Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 12) // Discount
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.TuitionDiscountType = Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 13) // Student
                    {
                        receivableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        receivableDetails.Student = Unit_Of_Work.student_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }

                    receivableDetails.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        receivableDetails.UpdatedByOctaId = userId;
                        if (receivableDetails.UpdatedByUserId != null)
                        {
                            receivableDetails.UpdatedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        receivableDetails.UpdatedByUserId = userId;
                        if (receivableDetails.UpdatedByOctaId != null)
                        {
                            receivableDetails.UpdatedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.receivableDetails_Repository.Update(receivableDetails);
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
            pages: new[] { "Receivable" }
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
                return BadRequest("Enter Receivable ID");
            }

            ReceivableMaster Receivable = Unit_Of_Work.receivableMaster_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);


            if (Receivable == null)
            {
                return NotFound();
            }
             
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Receivable", roleId, userId, Receivable);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            Receivable.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            Receivable.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                Receivable.DeletedByOctaId = userId;
                if (Receivable.DeletedByUserId != null)
                {
                    Receivable.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                Receivable.DeletedByUserId = userId;
                if (Receivable.DeletedByOctaId != null)
                {
                    Receivable.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.receivableMaster_Repository.Update(Receivable);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
