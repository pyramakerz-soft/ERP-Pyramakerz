using AutoMapper;
using LMS_CMS_BL.DTO.Clinic;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.ClinicModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.Clinic
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class HygieneFormController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly CheckPageAccessService _checkPageAccessService;

        public HygieneFormController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        #region Get
        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Form Medical Report" }
        )]
        public async Task<IActionResult> Get()
        {
            var userClaims = HttpContext.User.Claims;
            var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (!long.TryParse(userIdClaim, out long userId) || userTypeClaim == null)
            {
                return Unauthorized("User claims are missing or invalid.");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var query = Unit_Of_Work.hygieneForm_Repository.SelectQuery<HygieneForm>(
                d => d.IsDeleted != true
            );

            var hygieneFormsDto = await query
                .Select(h => new HygieneFormGetDTO 
                {
                    // Map parent properties
                    ID = h.Id,
                    Date = h.Date,
                    SchoolId = h.SchoolId,
                    School = h.School.Name,
                    GradeId = h.GradeId,
                    Grade = h.Grade.Name,
                    ClassRoomID = h.ClassRoomID,
                    ClassRoom = h.Classroom.Name,

                    StudentHygieneTypes = h.StudentHygieneTypes
                        .Where(x => x.IsDeleted != true)
                        .Select(sht => new StudentHygieneTypesGetDTO
                        {
                            ID = sht.Id,
                            StudentId = sht.StudentId,
                            Student = sht.Student.en_name,
                            Attendance = sht.Attendance,
                            Comment = sht.Comment,
                            ActionTaken = sht.ActionTaken,

                            // Project the *next* level of children
                            HygieneTypes = sht.HygieneTypes
                                .Where(ht => ht.IsDeleted != true)
                                .Select(ht => new HygieneTypeGetDTO
                                {
                                    ID = ht.Id,
                                    Type = ht.Type
                                }).ToList()
                        }).ToList()
                })
                .AsNoTracking() 
                .ToListAsync();

            if (hygieneFormsDto == null || hygieneFormsDto.Count == 0)
            {
                return NotFound();
            }

            return Ok(hygieneFormsDto);
        }
        #endregion

        #region GetWithPaggination
        [HttpGet("WithPaggination")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Form Medical Report" }
        )]
        public async Task<IActionResult> GetWithPaggination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var userClaims = HttpContext.User.Claims;
            var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (!long.TryParse(userIdClaim, out long userId) || userTypeClaim == null)
            {
                return Unauthorized("User claims are missing or invalid.");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            // Count Active Records
            int totalRecords = await Unit_Of_Work.hygieneForm_Repository
                .CountAsync(h => h.IsDeleted != true);

            // Query with Includes
            var query = Unit_Of_Work.hygieneForm_Repository
                .Select_All_With_IncludesById_Pagination<HygieneForm>(
                    h => h.IsDeleted != true,
                    q => q.Include(x => x.School),
                    q => q.Include(x => x.Grade),
                    q => q.Include(x => x.Classroom),
                    q => q.Include(x => x.StudentHygieneTypes)
                          .ThenInclude(sht => sht.Student),
                    q => q.Include(x => x.StudentHygieneTypes)
                          .ThenInclude(sht => sht.HygieneTypes)
                );

            // Apply pagination
            var hygieneForms = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            if (hygieneForms == null || hygieneForms.Count == 0)
            {
                return NotFound("No hygiene forms found.");
            }

            // Manually map to DTO
            var hygieneFormsDto = hygieneForms.Select(h => new HygieneFormGetDTO
            {
                ID = h.Id,
                Date = h.Date,
                SchoolId = h.SchoolId,
                School = h.School?.Name,
                GradeId = h.GradeId,
                Grade = h.Grade?.Name,
                ClassRoomID = h.ClassRoomID,
                ClassRoom = h.Classroom?.Name,

                StudentHygieneTypes = h.StudentHygieneTypes
                    .Where(x => x.IsDeleted != true)
                    .Select(sht => new StudentHygieneTypesGetDTO
                    {
                        ID = sht.Id,
                        StudentId = sht.StudentId,
                        Student = sht.Student?.en_name,
                        Attendance = sht.Attendance,
                        Comment = sht.Comment,
                        ActionTaken = sht.ActionTaken,

                        HygieneTypes = sht.HygieneTypes
                            .Where(ht => ht.IsDeleted != true)
                            .Select(ht => new HygieneTypeGetDTO
                            {
                                ID = ht.Id,
                                Type = ht.Type
                            }).ToList()
                    }).ToList()
            }).ToList();

            // Pagination Meta
            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = hygieneFormsDto, Pagination = paginationMetadata });
        }
        #endregion

        #region GetByID
        [HttpGet("id")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Form Medical Report" }
        )]
        public async Task<IActionResult> GetByID(long id)
        {
            var userClaims = HttpContext.User.Claims;
            var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (!long.TryParse(userIdClaim, out long userId) || userTypeClaim == null)
            {
                return Unauthorized("User claims are missing or invalid.");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var query = Unit_Of_Work.hygieneForm_Repository.SelectQuery<HygieneForm>(
                h => h.Id == id && h.IsDeleted != true
            );

            var hygieneFormDto = await query
                .Select(h => new HygieneFormGetDTO 
                {
                    ID = h.Id,
                    Date = h.Date,
                    SchoolId = h.SchoolId,
                    School = h.School.Name,
                    GradeId = h.GradeId,
                    Grade = h.Grade.Name,
                    ClassRoomID = h.ClassRoomID,
                    ClassRoom = h.Classroom.Name,

                    StudentHygieneTypes = h.StudentHygieneTypes
                        .Where(x => x.IsDeleted != true) 
                        .Select(sht => new StudentHygieneTypesGetDTO 
                        {
                            ID = sht.Id,
                            StudentId = sht.StudentId,
                            Student = sht.Student.en_name,
                            Attendance = sht.Attendance,
                            Comment = sht.Comment,
                            ActionTaken = sht.ActionTaken,

                            HygieneTypes = sht.HygieneTypes
                                .Where(ht => ht.IsDeleted != true) 
                                .Select(ht => new HygieneTypeGetDTO 
                                {
                                    ID = ht.Id,
                                    Type = ht.Type
                                }).ToList()
                        }).ToList()
                })
                .AsNoTracking() 
                .FirstOrDefaultAsync(); 

            if (hygieneFormDto == null)
            {
                return NotFound("HygieneForm not found.");
            }

            return Ok(hygieneFormDto);
        }
        #endregion

        #region Add Hygiene Form
        [HttpPost]
        [Authorize_Endpoint_(   
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Form Medical Report" }
        )]
        public ActionResult Add(HygieneFormAddDTO hygieneFormDTO)
        {
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (!long.TryParse(userIdClaim, out long userId) || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid model state.");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var allHygieneTypeIds = hygieneFormDTO.StudentHygieneTypes
                .SelectMany(s => s.HygieneTypesIds) 
                .Distinct()
                .ToList();

            var hygieneTypesFromDb = Unit_Of_Work.hygieneType_Repository
                .SelectQuery<HygieneType>(ht => allHygieneTypeIds.Contains(ht.Id) && ht.IsDeleted != true)
                .ToDictionary(ht => ht.Id);

            if (hygieneTypesFromDb.Count != allHygieneTypeIds.Count)
            {
                var missingIds = allHygieneTypeIds.Except(hygieneTypesFromDb.Keys);
                return NotFound($"The following Hygiene Type IDs were not found: {string.Join(", ", missingIds)}");
            }

            HygieneForm hygieneForm = _mapper.Map<HygieneForm>(hygieneFormDTO);

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            DateTime now = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            hygieneForm.InsertedAt = now;
            if (userTypeClaim == "octa")
            {
                hygieneForm.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                hygieneForm.InsertedByUserId = userId;
            }

            for (int i = 0; i < hygieneFormDTO.StudentHygieneTypes.Count; i++)
            {
                var dtoChild = hygieneFormDTO.StudentHygieneTypes.ElementAt(i);
                var entityChild = hygieneForm.StudentHygieneTypes.ElementAt(i);

                var specificHygieneTypes = new List<HygieneType>();
                foreach (var htId in dtoChild.HygieneTypesIds)
                {
                    specificHygieneTypes.Add(hygieneTypesFromDb[htId]); 
                }

                entityChild.HygieneTypes = specificHygieneTypes;

                entityChild.InsertedAt = now; 

                foreach (var htId in dtoChild.HygieneTypesIds)
                {
                    var logExists = Unit_Of_Work.studentHygiens_Repository.SelectQuery<StudentHygienes>(sh =>
                        sh.StudentId == entityChild.StudentId &&
                        sh.HygieneTypeId == htId &&
                        sh.Date == hygieneForm.Date);

                    if (logExists == null)
                    {
                        Unit_Of_Work.studentHygiens_Repository.Add(new StudentHygienes
                        {
                            StudentId = entityChild.StudentId,
                            HygieneTypeId = htId,
                            Date = hygieneForm.Date,
                            InsertedAt = now
                        });
                    }
                }
            }
            Unit_Of_Work.hygieneForm_Repository.Add(hygieneForm);

            Unit_Of_Work.SaveChanges();

            return Ok(hygieneFormDTO);
        }
        #endregion

        #region Update Hygiene Form
        #region Update
        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Form Medical Report" }
        )]
        public async Task<IActionResult> Update(HygieneFormPutDTO hygieneFormDTO)
        {
            // 1. --- Validation and User Claims ---
            var userClaims = HttpContext.User.Claims;
            var userIdClaim = userClaims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = userClaims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = userClaims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

            if (!long.TryParse(userIdClaim, out long userId) || userTypeClaim == null || !long.TryParse(userRoleClaim, out long roleId))
            {
                return Unauthorized("User claims are missing or invalid.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid model state.");
            }

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            // 2. --- Load Existing Entity AND its Children for Reconciliation ---
            // CRITICAL: We MUST include the children to allow Entity Framework to track and delete them.
            HygieneForm hygieneForm = await Unit_Of_Work.hygieneForm_Repository.FindByIncludesAsync(
                d => d.Id == hygieneFormDTO.ID && d.IsDeleted != true,
                query => query.Include(hf => hf.StudentHygieneTypes)
                               .ThenInclude(sht => sht.HygieneTypes) // Include grandchildren for removal
            );

            if (hygieneForm == null)
            {
                return NotFound($"Hygiene Form with ID {hygieneFormDTO.ID} not found.");
            }

            // 3. --- Authorization Check (Using existing service) ---
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Hygiene Form Medical Report", roleId, userId, hygieneForm);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            // 4. --- Efficiently Fetch All *New* HygieneTypes at Once ---
            var allHygieneTypeIds = hygieneFormDTO.StudentHygieneTypes
                .SelectMany(s => s.HygieneTypesIds)
                .Distinct()
                .ToList();

            var hygieneTypesFromDb = Unit_Of_Work.hygieneType_Repository
                .SelectQuery<HygieneType>(ht => allHygieneTypeIds.Contains(ht.Id) && ht.IsDeleted != true)
                .ToDictionary(ht => ht.Id);

            if (hygieneTypesFromDb.Count != allHygieneTypeIds.Count)
            {
                var missingIds = allHygieneTypeIds.Except(hygieneTypesFromDb.Keys);
                return NotFound($"The following Hygiene Type IDs were not found: {string.Join(", ", missingIds)}");
            }

            // 5. --- Map Parent Properties and Set Audit Fields ---
            _mapper.Map(hygieneFormDTO, hygieneForm); // Map scalar properties of the parent

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            DateTime now = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            hygieneForm.UpdatedAt = now;
            if (userTypeClaim == "octa")
            {
                hygieneForm.UpdatedByOctaId = userId;
                hygieneForm.UpdatedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                hygieneForm.UpdatedByUserId = userId;
                hygieneForm.UpdatedByOctaId = null;
            }

            // 6. --- Reconcile Child Collection (Delete-and-Replace) ---

            // A. Delete all existing children
            Unit_Of_Work.studentHygieneTypes_Repository.RemoveRange(hygieneForm.StudentHygieneTypes);
            hygieneForm.StudentHygieneTypes.Clear(); // Clear the collection reference

            // B. Create and Add new children from the DTO
            foreach (var dtoChild in hygieneFormDTO.StudentHygieneTypes)
            {
                // Map DTO child to a new entity
                var entityChild = _mapper.Map<StudentHygieneTypes>(dtoChild);

                // Link the correct HygieneType entities
                var specificHygieneTypes = new List<HygieneType>();
                foreach (var htId in dtoChild.HygieneTypesIds)
                {
                    specificHygieneTypes.Add(hygieneTypesFromDb[htId]);

                    // Log update/insert to StudentHygienes table
                    var logExists = Unit_Of_Work.studentHygiens_Repository.SelectQuery<StudentHygienes>(sh =>
                        sh.StudentId == entityChild.StudentId &&
                        sh.HygieneTypeId == htId &&
                        sh.Date == hygieneForm.Date).Any(); // Check if log already exists for this date

                    if (!logExists)
                    {
                        Unit_Of_Work.studentHygiens_Repository.Add(new StudentHygienes
                        {
                            StudentId = entityChild.StudentId,
                            HygieneTypeId = htId,
                            Date = hygieneForm.Date,
                            InsertedAt = now
                        });
                    }
                }

                entityChild.HygieneTypes = specificHygieneTypes;

                // Set properties for the new child
                entityChild.Id = 0; // Ensure EF treats this as a new record
                entityChild.HygieneFormId = hygieneForm.Id; // Link to parent
                entityChild.InsertedAt = now;

                // Add to the parent's collection. EF will handle insertion on SaveChanges.
                hygieneForm.StudentHygieneTypes.Add(entityChild);
            }

            // 7. --- Save All Changes ---
            // This single call performs all updates, deletes, and inserts in one transaction.
            Unit_Of_Work.hygieneForm_Repository.Update(hygieneForm);
            Unit_Of_Work.SaveChanges();

            return Ok(hygieneFormDTO);
        }
        #endregion
        #endregion

        #region Delete Hygiene Form
        [HttpDelete]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Hygiene Form Medical Report" }
        )]
        public IActionResult Delete(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            
            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            
            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }
            
            HygieneForm hygieneForm = Unit_Of_Work.hygieneForm_Repository.First_Or_Default(d => d.IsDeleted != true && d.Id == id);

            if (hygieneForm == null)
            {
                return NotFound();
            }
            
            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Hygiene Form Medical Report", roleId, userId, hygieneForm);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            hygieneForm.IsDeleted = true;

            StudentHygieneTypes sht = Unit_Of_Work.studentHygieneTypes_Repository.First_Or_Default(x => x.HygieneFormId == hygieneForm.Id && x.IsDeleted != true);
             
            if (sht.IsDeleted != true)
                sht.IsDeleted = true;

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            hygieneForm.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            if (userTypeClaim == "octa")
            {
                hygieneForm.DeletedByOctaId = userId;

                if (hygieneForm.DeletedByUserId != null)
                {
                    hygieneForm.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                hygieneForm.DeletedByUserId = userId;
                if (hygieneForm.DeletedByOctaId != null)
                {
                    hygieneForm.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.hygieneForm_Repository.Update(hygieneForm);
            Unit_Of_Work.SaveChanges();
            
            return Ok("Hygiene Form deleted successfully");
        }
        #endregion
    }
}
