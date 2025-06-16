using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Drawing.Printing;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileWordPdfValidationService _fileWordPdfValidationService;

        public AssignmentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileWordPdfValidationService fileWordPdfValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileWordPdfValidationService = fileWordPdfValidationService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee"},
            pages: new[] { "Assignment" }
        )]
        public async Task<IActionResult> GetAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            int totalRecords = await Unit_Of_Work.assignment_Repository
               .CountAsync(f => f.IsDeleted != true); 

            List<Assignment> Assignment = await Unit_Of_Work.assignment_Repository
                .Select_All_With_IncludesById_Pagination<Assignment>(
                    f => f.IsDeleted != true,
                    query => query.Include(d => d.AssignmentType),
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.SubjectWeightType.WeightType),
                    query => query.Include(d => d.AssignmentStudents
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Classroom),
                    query => query.Include(d => d.AssignmentStudents
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Student))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (Assignment == null || Assignment.Count == 0)
            {
                return NotFound();
            }

            List<AssignmentGetDTO> AssignmentGetDTOs = mapper.Map<List<AssignmentGetDTO>>(Assignment);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            foreach (var AssignmentGetDTO in AssignmentGetDTOs)
            {
                if (!string.IsNullOrEmpty(AssignmentGetDTO.LinkFile))
                {
                    AssignmentGetDTO.LinkFile = $"{serverUrl}{AssignmentGetDTO.LinkFile.Replace("\\", "/")}";
                }
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = AssignmentGetDTOs, Pagination = paginationMetadata }); 
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetBySubjectID/{subID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee"},
            pages: new[] { "Assignment" }
        )]
        public async Task<IActionResult> GetBySubjectID(long subID, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == subID);
            if(subject == null)
            {
                return BadRequest("No subject with this id");
            }

            int totalRecords = await Unit_Of_Work.assignment_Repository
               .CountAsync(f => f.IsDeleted != true);

            List<Assignment> Assignment = await Unit_Of_Work.assignment_Repository
                .Select_All_With_IncludesById_Pagination<Assignment>(
                    f => f.IsDeleted != true && f.SubjectID == subID,
                    query => query.Include(d => d.AssignmentType),
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.SubjectWeightType.WeightType),
                    query => query.Include(d => d.AssignmentStudents
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Classroom),
                    query => query.Include(d => d.AssignmentStudents
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                    .ThenInclude(d => d.Student))
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
             
            if (Assignment == null || Assignment.Count == 0)
            {
                return NotFound();
            }

            List<AssignmentGetDTO> AssignmentGetDTOs = mapper.Map<List<AssignmentGetDTO>>(Assignment);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
             
            foreach(var AssignmentGetDTO in AssignmentGetDTOs)
            {
                if (!string.IsNullOrEmpty(AssignmentGetDTO.LinkFile))
                {
                    AssignmentGetDTO.LinkFile = $"{serverUrl}{AssignmentGetDTO.LinkFile.Replace("\\", "/")}";
                }
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = AssignmentGetDTOs, Pagination = paginationMetadata });
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByID/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee"},
            pages: new[] { "Assignment" }
        )]
        public async Task<IActionResult> GetByID(long id)
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

            Assignment assignment= Unit_Of_Work.assignment_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);
            if (assignment == null)
            {
                return BadRequest("No assignment with this id");
            }

            Assignment Assignment = await Unit_Of_Work.assignment_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id,
                    query => query.Include(d => d.AssignmentType),
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.SubjectWeightType.WeightType),
                    query => query.Include(d => d.AssignmentStudents
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Classroom),
                    query => query.Include(d => d.AssignmentStudents
                        .Where(e => e.IsDeleted != true && e.StudentClassroom.Student.IsDeleted != true && e.StudentClassroom.Classroom.IsDeleted != true))
                        .ThenInclude(d => d.StudentClassroom)
                        .ThenInclude(d => d.Student));

            if (Assignment == null)
            {
                return NotFound();
            }

            AssignmentGetDTO AssignmentGetDTO = mapper.Map<AssignmentGetDTO>(Assignment);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (!string.IsNullOrEmpty(AssignmentGetDTO.LinkFile))
            {
                AssignmentGetDTO.LinkFile = $"{serverUrl}{AssignmentGetDTO.LinkFile.Replace("\\", "/")}";
            }

            return Ok(AssignmentGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Assignment" }
        )]
        public IActionResult Add(AssignmentAddDTO NewAssignment)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewAssignment == null)
            {
                return BadRequest("Classroom cannot be null");
            }
             
            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(g => g.ID == NewAssignment.SubjectID && g.IsDeleted != true);
            if (subject == null)
            {
                return BadRequest("No subject with this ID");
            }
            
            SubjectWeightType subjectWeightType = Unit_Of_Work.subjectWeightType_Repository.First_Or_Default(g => g.ID == NewAssignment.SubjectWeightTypeID && g.IsDeleted != true);
            if (subjectWeightType == null)
            {
                return BadRequest("No subject Weight Type with this ID");
            } 

            if(subjectWeightType.SubjectID != NewAssignment.SubjectID)
            {
                return BadRequest("This Subject isn't assigned to this Subject Weight Type");
            }
              
            AssignmentType assignmentType = Unit_Of_Work.assignmentType_Repository.First_Or_Default(g => g.ID == NewAssignment.AssignmentTypeID);
            if (assignmentType == null)
            {
                return BadRequest("No Assignment Type with this ID");
            } 
             
            if(NewAssignment.DueDate == null)
            {
                NewAssignment.DueDate = NewAssignment.CutOfDate;
            }

            if (NewAssignment.OpenDate > NewAssignment.CutOfDate)
            {
                return BadRequest("Open date must be on or before cut-off date.");
            }

            if (NewAssignment.DueDate != null && NewAssignment.DueDate > NewAssignment.CutOfDate)
            {
                return BadRequest("Due date must be on or before cut-off date.");
            }

            if (NewAssignment.DueDate != null && NewAssignment.OpenDate > NewAssignment.DueDate)
            {
                return BadRequest("Open date must be on or before due date.");
            }

            if(NewAssignment.IsSpecificStudents == true && (NewAssignment.StudentClassroomIDs == null || NewAssignment.StudentClassroomIDs.Count == 0))
            {
                return BadRequest("You Didn't choose Students");
            }

            if(NewAssignment.IsSpecificStudents == false)
            {
                NewAssignment.StudentClassroomIDs = null;
            }

            Assignment assignment = mapper.Map<Assignment>(NewAssignment);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignment.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                assignment.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                assignment.InsertedByUserId = userId;
            }

            Unit_Of_Work.assignment_Repository.Add(assignment);
            Unit_Of_Work.SaveChanges();

            if(NewAssignment.StudentClassroomIDs != null)
            {
                foreach (var studentClass in NewAssignment.StudentClassroomIDs)
                {
                    StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == studentClass);
                    if(studentClassroom != null)
                    {
                        AssignmentStudent assignmentStudent = new AssignmentStudent();
                        assignmentStudent.AssignmentID = assignment.ID;
                        assignmentStudent.StudentClassroomID = studentClassroom.ID;
                        assignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        if (userTypeClaim == "octa")
                        {
                            assignmentStudent.InsertedByOctaId = userId;
                        }
                        else if (userTypeClaim == "employee")
                        {
                            assignmentStudent.InsertedByUserId = userId;
                        }

                        Unit_Of_Work.assignmentStudent_Repository.Add(assignmentStudent);
                    }
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok(NewAssignment);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("FileAssignment")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Assignment" }
        )]
        public async Task<IActionResult> FileAssignment([FromForm] AssignmentFilePutDTO EditAssignment)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (EditAssignment == null)
            {
                return BadRequest("Assignment cannot be null");
            }

            Assignment assignmentExists = Unit_Of_Work.assignment_Repository.First_Or_Default(g => g.ID == EditAssignment.ID && g.IsDeleted != true);
            if (assignmentExists == null)
            {
                return BadRequest("No Assignment with this ID");
            }

            if(assignmentExists.AssignmentTypeID != 1)
            {
                return BadRequest("You Can't add File To those type that aren't Textbook Assignment");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Assignment", roleId, userId, assignmentExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (EditAssignment.FileFile != null)
            {
                string returnFileInput = _fileWordPdfValidationService.ValidateDocumentFile(EditAssignment.FileFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            // Add For The first Time
            if(assignmentExists.LinkFile == null && EditAssignment.FileFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Assignment");
                var assignmentFolder = Path.Combine(baseFolder, assignmentExists.ID.ToString());
                if (!Directory.Exists(assignmentFolder))
                {
                    Directory.CreateDirectory(assignmentFolder);
                }

                if (EditAssignment.FileFile != null)
                {
                    if (EditAssignment.FileFile.Length > 0)
                    {
                        var filePath = Path.Combine(assignmentFolder, EditAssignment.FileFile.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await EditAssignment.FileFile.CopyToAsync(stream);
                        }
                    }
                }

                assignmentExists.LinkFile = Path.Combine("Uploads", "Assignment", assignmentExists.ID.ToString(), EditAssignment.FileFile.FileName);
            }

            // Edit the existing
            if (assignmentExists.LinkFile != null && EditAssignment.FileFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Assignment");
                var assignmentFolder = Path.Combine(baseFolder, assignmentExists.ID.ToString());

                if (Directory.Exists(assignmentFolder))
                {
                    var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), assignmentExists.LinkFile);
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }
                else
                {
                    Directory.CreateDirectory(assignmentFolder);
                }

                if (EditAssignment.FileFile.Length > 0)
                {
                    var newFilePath = Path.Combine(assignmentFolder, EditAssignment.FileFile.FileName);
                    using (var stream = new FileStream(newFilePath, FileMode.Create))
                    {
                        await EditAssignment.FileFile.CopyToAsync(stream);
                    }
                    assignmentExists.LinkFile = Path.Combine("Uploads", "Assignment", assignmentExists.ID.ToString(), EditAssignment.FileFile.FileName);
                }
            }
             
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignmentExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                assignmentExists.UpdatedByOctaId = userId;
                if (assignmentExists.UpdatedByUserId != null)
                {
                    assignmentExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                assignmentExists.UpdatedByUserId = userId;
                if (assignmentExists.UpdatedByOctaId != null)
                {
                    assignmentExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.assignment_Repository.Update(assignmentExists);
            Unit_Of_Work.SaveChanges();
  
            return Ok(EditAssignment);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Assignment" }
        )]
        public async Task<IActionResult> Edit(AssignmentPutDTO EditAssignment)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (EditAssignment == null)
            {
                return BadRequest("Assignment cannot be null");
            }

            Assignment assignmentExists = Unit_Of_Work.assignment_Repository.First_Or_Default(g => g.ID == EditAssignment.ID && g.IsDeleted != true);
            if (assignmentExists == null)
            {
                return BadRequest("No Assignment with this ID");
            }
            
            Subject subject = Unit_Of_Work.subject_Repository.First_Or_Default(g => g.ID == EditAssignment.SubjectID && g.IsDeleted != true);
            if (subject == null)
            {
                return BadRequest("No subject with this ID");
            }

            SubjectWeightType subjectWeightType = Unit_Of_Work.subjectWeightType_Repository.First_Or_Default(g => g.ID == EditAssignment.SubjectWeightTypeID && g.IsDeleted != true);
            if (subjectWeightType == null)
            {
                return BadRequest("No subject Weight Type with this ID");
            }

            if (subjectWeightType.SubjectID != EditAssignment.SubjectID)
            {
                return BadRequest("This Subject isn't assigned to this Subject Weight Type");
            }

            AssignmentType assignmentType = Unit_Of_Work.assignmentType_Repository.First_Or_Default(g => g.ID == EditAssignment.AssignmentTypeID);
            if (assignmentType == null)
            {
                return BadRequest("No Assignment Type with this ID");
            }

            if (EditAssignment.DueDate == null)
            {
                EditAssignment.DueDate = EditAssignment.CutOfDate;
            }

            if (EditAssignment.OpenDate > EditAssignment.CutOfDate)
            {
                return BadRequest("Open date must be on or before cut-off date.");
            }

            if (EditAssignment.DueDate != null && EditAssignment.DueDate > EditAssignment.CutOfDate)
            {
                return BadRequest("Due date must be on or before cut-off date.");
            }

            if (EditAssignment.DueDate != null && EditAssignment.OpenDate > EditAssignment.DueDate)
            {
                return BadRequest("Open date must be on or before due date.");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Assignment", roleId, userId, assignmentExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (EditAssignment.IsSpecificStudents == true && (EditAssignment.StudentClassroomIDs == null || EditAssignment.StudentClassroomIDs.Count == 0))
            {
                return BadRequest("You Didn't choose Students");
            }

            if (EditAssignment.IsSpecificStudents == false)
            {
                EditAssignment.StudentClassroomIDs = null;
            }

            mapper.Map(EditAssignment, assignmentExists);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignmentExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                assignmentExists.UpdatedByOctaId = userId;
                if (assignmentExists.UpdatedByUserId != null)
                {
                    assignmentExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                assignmentExists.UpdatedByUserId = userId;
                if (assignmentExists.UpdatedByOctaId != null)
                {
                    assignmentExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.assignment_Repository.Update(assignmentExists);
            Unit_Of_Work.SaveChanges();

            List<AssignmentStudent> assignmentStudents = Unit_Of_Work.assignmentStudent_Repository.FindBy(d => d.IsDeleted != true && d.AssignmentID == EditAssignment.ID);

            if (EditAssignment.StudentClassroomIDs == null || EditAssignment.StudentClassroomIDs.Count == 0)
            { 
                if(assignmentStudents != null && assignmentStudents.Count != 0)
                {
                    foreach (var student in assignmentStudents)
                    {
                        student.IsDeleted = true;
                        student.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        if (userTypeClaim == "octa")
                        {
                            student.DeletedByOctaId = userId;
                            if (student.DeletedByUserId != null)
                            {
                                student.DeletedByUserId = null;
                            }
                        }
                        else if (userTypeClaim == "employee")
                        {
                            student.DeletedByUserId = userId;
                            if (student.DeletedByOctaId != null)
                            {
                                student.DeletedByOctaId = null;
                            }
                        }
                        Unit_Of_Work.assignmentStudent_Repository.Update(student);
                    }
                }
            }
            else
            {
                if (assignmentStudents == null || assignmentStudents.Count == 0)
                { 
                    foreach (var studentClassroomId in EditAssignment.StudentClassroomIDs)
                    {
                        StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == studentClassroomId);
                        if (studentClassroom != null)
                        {
                            AssignmentStudent assignmentStudent = new AssignmentStudent();
                            assignmentStudent.AssignmentID = EditAssignment.ID;
                            assignmentStudent.StudentClassroomID = studentClassroom.ID;
                            assignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                assignmentStudent.InsertedByOctaId = userId;
                            }
                            else if (userTypeClaim == "employee")
                            {
                                assignmentStudent.InsertedByUserId = userId;
                            }

                            Unit_Of_Work.assignmentStudent_Repository.Add(assignmentStudent);
                        } 
                    } 
                }
                else
                { 
                    foreach (var existing in assignmentStudents)
                    {
                        if (!EditAssignment.StudentClassroomIDs.Contains(existing.StudentClassroomID))
                        {
                            existing.IsDeleted = true;
                            existing.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                existing.DeletedByOctaId = userId;
                                if (existing.DeletedByUserId != null)
                                {
                                    existing.DeletedByUserId = null;
                                }
                            }
                            else if (userTypeClaim == "employee")
                            {
                                existing.DeletedByUserId = userId;
                                if (existing.DeletedByOctaId != null)
                                {
                                    existing.DeletedByOctaId = null;
                                }
                            }
                            Unit_Of_Work.assignmentStudent_Repository.Update(existing);
                        }
                    }

                    // 2. Determine which to add
                    var existingIDs = assignmentStudents
                        .Where(s => s.IsDeleted != true)
                        .Select(s => s.StudentClassroomID)
                        .ToHashSet();

                    foreach (var newId in EditAssignment.StudentClassroomIDs)
                    {
                        if (!existingIDs.Contains(newId))
                        {

                            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == newId);
                            if (studentClassroom != null)
                            {
                                AssignmentStudent assignmentStudent = new AssignmentStudent();
                                assignmentStudent.AssignmentID = EditAssignment.ID;
                                assignmentStudent.StudentClassroomID = studentClassroom.ID;
                                assignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                if (userTypeClaim == "octa")
                                {
                                    assignmentStudent.InsertedByOctaId = userId;
                                }
                                else if (userTypeClaim == "employee")
                                {
                                    assignmentStudent.InsertedByUserId = userId;
                                }

                                Unit_Of_Work.assignmentStudent_Repository.Add(assignmentStudent);
                            }
                        }
                    } 
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok(EditAssignment);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Assignment" }
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
                return BadRequest("Enter assignment ID");
            }

            Assignment assignment = Unit_Of_Work.assignment_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);


            if (assignment == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Assignment", roleId, userId, assignment);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            assignment.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignment.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                assignment.DeletedByOctaId = userId;
                if (assignment.DeletedByUserId != null)
                {
                    assignment.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                assignment.DeletedByUserId = userId;
                if (assignment.DeletedByOctaId != null)
                {
                    assignment.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.assignment_Repository.Update(assignment);

            List<AssignmentStudent> assignmentStudents = Unit_Of_Work.assignmentStudent_Repository.FindBy(d => d.AssignmentID == id && d.IsDeleted != true);
            if(assignmentStudents != null && assignmentStudents.Count > 0)
            {
                foreach(var student in assignmentStudents)
                {
                    student.IsDeleted = true;
                    student.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        student.DeletedByOctaId = userId;
                        if (student.DeletedByUserId != null)
                        {
                            student.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        student.DeletedByUserId = userId;
                        if (student.DeletedByOctaId != null)
                        {
                            student.DeletedByOctaId = null;
                        }
                    }
                    Unit_Of_Work.assignmentStudent_Repository.Update(student);
                }
            }

            List<AssignmentQuestion> assignmentQuestions = Unit_Of_Work.assignmentQuestion_Repository.FindBy(d => d.AssignmentID == id && d.IsDeleted != true);
            if(assignmentQuestions != null && assignmentQuestions.Count > 0)
            {
                foreach(var assignmentQuestion in assignmentQuestions)
                {
                    assignmentQuestion.IsDeleted = true;
                    assignmentQuestion.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        assignmentQuestion.DeletedByOctaId = userId;
                        if (assignmentQuestion.DeletedByUserId != null)
                        {
                            assignmentQuestion.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        assignmentQuestion.DeletedByUserId = userId;
                        if (assignmentQuestion.DeletedByOctaId != null)
                        {
                            assignmentQuestion.DeletedByOctaId = null;
                        }
                    }
                    Unit_Of_Work.assignmentQuestion_Repository.Update(assignmentQuestion);
                }
            }
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
