using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LMS_CMS_DAL.Migrations.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using Org.BouncyCastle.Asn1.Cmp;

namespace LMS_CMS_PL.Controllers.Domains.Accounting
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class PayableMasterController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public PayableMasterController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        ///////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Payable" }
        )]
        public async Task<IActionResult> GetAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            int totalRecords = await Unit_Of_Work.payableMaster_Repository
                .CountAsync(f => f.IsDeleted != true);

            List<PayableMaster> Payables = await Unit_Of_Work.payableMaster_Repository.Select_All_With_IncludesById_Pagination<PayableMaster>(
                    t => t.IsDeleted != true,
                    query => query.Include(Master => Master.PayableDocType),
                    query => query.Include(Master => Master.LinkFile)
                    )
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (Payables == null || Payables.Count == 0)
            {
                return NotFound();
            }

            var bankIds = Payables.Where(r => r.LinkFileID == 6).Select(r => r.BankOrSaveID).Distinct().ToList();
            var saveIds = Payables.Where(r => r.LinkFileID == 5).Select(r => r.BankOrSaveID).Distinct().ToList();

            var banks = await Unit_Of_Work.bank_Repository.Select_All_With_IncludesById<Bank>(b => bankIds.Contains(b.ID));
            var saves = await Unit_Of_Work.save_Repository.Select_All_With_IncludesById<Save>(s => saveIds.Contains(s.ID));

            List<PayableMasterGetDTO> DTOs = mapper.Map<List<PayableMasterGetDTO>>(Payables);

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
            pages: new[] { "Payable" }
        )]
        public async Task<IActionResult> GetbyIdAsync(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (id == 0 || id == null)
            {
                return BadRequest("Enter Doc Type ID");
            }

            PayableMaster PayableMaster = await Unit_Of_Work.payableMaster_Repository.FindByIncludesAsync(
                    acc => acc.IsDeleted != true && acc.ID == id,
                    query => query.Include(ac => ac.LinkFile),
                    query => query.Include(ac => ac.PayableDocType)
                    );

            if (PayableMaster == null)
            {
                return NotFound();
            }

            string bankOrSaveName = null;

            if (PayableMaster.LinkFileID == 6) // Bank
            {
                var bank = await Unit_Of_Work.bank_Repository.FindByIncludesAsync(b => b.IsDeleted != true && b.ID == PayableMaster.BankOrSaveID);
                bankOrSaveName = bank?.Name;
            }
            else if (PayableMaster.LinkFileID == 5) // Save
            {
                var save = await Unit_Of_Work.save_Repository.FindByIncludesAsync(s => s.IsDeleted != true && s.ID == PayableMaster.BankOrSaveID);
                bankOrSaveName = save?.Name;
            }

            PayableMasterGetDTO payableMasterGetDTO = mapper.Map<PayableMasterGetDTO>(PayableMaster);
            payableMasterGetDTO.BankOrSaveName = bankOrSaveName;

            List<PayableDetails> PayableDetails = await Unit_Of_Work.payableDetails_Repository.Select_All_With_IncludesById<PayableDetails>(
                    t => t.IsDeleted != true && t.PayableMasterID == id,
                    query => query.Include(Master => Master.PayableMaster),
                    query => query.Include(Master => Master.LinkFile)
                    );


            List<PayableDetailsGetDTO> payableDetailsGetDTO = mapper.Map<List<PayableDetailsGetDTO>>(PayableDetails);

            foreach (var detail in payableDetailsGetDTO)
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
            payableMasterGetDTO.PayableDetails = payableDetailsGetDTO;
            return Ok(payableMasterGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
         allowedTypes: new[] { "octa", "employee" },
         pages: new[] { "Payable" }
        )]
        public IActionResult Add(PayableMasterAddDTO newMaster)
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
                return BadRequest("Payable cannot be null");
            }

            PayableDocType PayableDocType = Unit_Of_Work.payableDocType_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newMaster.PayableDocTypeID);
            if (PayableDocType == null)
            {
                return BadRequest("there is no Payable Doc Type with this ID");
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
            }
            else if (newMaster.LinkFileID == 5) // Save
            {
                Save Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                if (Save == null)
                {
                    return BadRequest("There is no Save with this ID in the database.");
                }
            }
            else
            {
                return BadRequest("Link File Must be Save or Bank");
            }

            PayableMaster PayableMaster = mapper.Map<PayableMaster>(newMaster);
            if (newMaster.LinkFileID == 6) // Bank
            {
                PayableMaster.BankOrSaveID = newMaster.BankOrSaveID;
                PayableMaster.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
            }
            else if (newMaster.LinkFileID == 5) // Save
            {
                PayableMaster.BankOrSaveID = newMaster.BankOrSaveID;
                PayableMaster.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            PayableMaster.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                PayableMaster.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                PayableMaster.InsertedByUserId = userId;
            }

            Unit_Of_Work.payableMaster_Repository.Add(PayableMaster);
            Unit_Of_Work.SaveChanges();
            return Ok(new PayableMasterPutDTO { ID = PayableMaster.ID });
        }

        //////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Payable" }
        )]
        public IActionResult Edit(PayableMasterPutDTO newMaster)
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
                return BadRequest("Payable cannot be null");
            }

            PayableMaster Payable = Unit_Of_Work.payableMaster_Repository.First_Or_Default(d => d.ID == newMaster.ID && d.IsDeleted != true);
            if (Payable == null)
            {
                return NotFound("There is no Payable with this id");
            }

            PayableDocType PayableDocType = Unit_Of_Work.payableDocType_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == newMaster.PayableDocTypeID);
            if (PayableDocType == null)
            {
                return BadRequest("there is no Payable Doc Type with this ID");
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
            }
            else if (newMaster.LinkFileID == 5) // Save
            {
                Save Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                if (Save == null)
                {
                    return BadRequest("There is no Save with this ID in the database.");
                }
            }
            else
            {
                return BadRequest("Link File Must be Save or Bank");
            }
              
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Payable", roleId, userId, Payable);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            mapper.Map(newMaster, Payable);
            if (newMaster.LinkFileID == 6) // Bank
            {
                Payable.BankOrSaveID = newMaster.BankOrSaveID;
                Payable.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                Payable.Save = null;
            }
            else if (newMaster.LinkFileID == 5) // Save
            {
                Payable.BankOrSaveID = newMaster.BankOrSaveID;
                Payable.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newMaster.BankOrSaveID);
                Payable.Bank = null;
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            Payable.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                Payable.UpdatedByOctaId = userId;
                if (Payable.UpdatedByUserId != null)
                {
                    Payable.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                Payable.UpdatedByUserId = userId;
                if (Payable.UpdatedByOctaId != null)
                {
                    Payable.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.payableMaster_Repository.Update(Payable);
            Unit_Of_Work.SaveChanges();

            // new details 
            if(newMaster.NewDetails != null)
            {
                foreach (var newDetails in newMaster.NewDetails)
                {
                    PayableDetails PayableDetails = mapper.Map<PayableDetails>(newDetails);

                    // Set up the corresponding LinkFileType (based on LinkFileID)
                    if (newDetails.LinkFileID == 6) // Bank
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 5) // Save
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 2) // Supplier
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 3) // Debit
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Debit = Unit_Of_Work.debit_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 4) // Credit
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Credit = Unit_Of_Work.credit_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 7) // Income
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Income = Unit_Of_Work.income_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 8) // Outcome
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Outcome = Unit_Of_Work.outcome_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 9) // Asset
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Asset = Unit_Of_Work.asset_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 10) // Employee
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Employee = Unit_Of_Work.employee_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 11) // Fee
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.TuitionFeesType = Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 12) // Discount
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.TuitionDiscountType = Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }
                    else if (newDetails.LinkFileID == 13) // Student
                    {
                        PayableDetails.LinkFileTypeID = newDetails.LinkFileTypeID;
                        PayableDetails.Student = Unit_Of_Work.student_Repository.First_Or_Default(t => t.ID == newDetails.LinkFileTypeID);
                    }

                    PayableDetails.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        PayableDetails.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        PayableDetails.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.payableDetails_Repository.Add(PayableDetails);
                    Unit_Of_Work.SaveChanges();
                }
            }

            if(newMaster.UpdatedDetails != null)
            {
                foreach (var newDetail in newMaster.UpdatedDetails)
                {
                    PayableDetails PayableDetails = Unit_Of_Work.payableDetails_Repository.First_Or_Default(d => d.ID == newDetail.ID && d.IsDeleted != true);
                    if (PayableDetails == null)
                    {
                        return NotFound("There is no Payable Details with this id");
                    }

                    mapper.Map(newDetail, PayableDetails);

                    if (newDetail.LinkFileID == 6) // Bank
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Bank = Unit_Of_Work.bank_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 5) // Save
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Save = Unit_Of_Work.save_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 2) // Supplier
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Supplier = Unit_Of_Work.supplier_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 3) // Debit
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Debit = Unit_Of_Work.debit_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 4) // Credit
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Credit = Unit_Of_Work.credit_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 7) // Income
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Income = Unit_Of_Work.income_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 8) // Outcome
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Outcome = Unit_Of_Work.outcome_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 9) // Asset
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Asset = Unit_Of_Work.asset_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 10) // Employee
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Employee = Unit_Of_Work.employee_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 11) // Fee
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.TuitionFeesType = Unit_Of_Work.tuitionFeesType_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 12) // Discount
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.TuitionDiscountType = Unit_Of_Work.tuitionDiscountType_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }
                    else if (newDetail.LinkFileID == 13) // Student
                    {
                        PayableDetails.LinkFileTypeID = newDetail.LinkFileTypeID;
                        PayableDetails.Student = Unit_Of_Work.student_Repository.First_Or_Default(t => t.ID == newDetail.LinkFileTypeID);
                    }

                    PayableDetails.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        PayableDetails.UpdatedByOctaId = userId;
                        if (PayableDetails.UpdatedByUserId != null)
                        {
                            PayableDetails.UpdatedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        PayableDetails.UpdatedByUserId = userId;
                        if (PayableDetails.UpdatedByOctaId != null)
                        {
                            PayableDetails.UpdatedByOctaId = null;
                        }
                    }

                    Unit_Of_Work.payableDetails_Repository.Update(PayableDetails);
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
            pages: new[] { "Payable" }
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
                return BadRequest("Enter Payable ID");
            }

            PayableMaster Payable = Unit_Of_Work.payableMaster_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);


            if (Payable == null)
            {
                return NotFound();
            }
             
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Payable", roleId, userId, Payable);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            } 

            Payable.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            Payable.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                Payable.DeletedByOctaId = userId;
                if (Payable.DeletedByUserId != null)
                {
                    Payable.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                Payable.DeletedByUserId = userId;
                if (Payable.DeletedByOctaId != null)
                {
                    Payable.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.payableMaster_Repository.Update(Payable);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
