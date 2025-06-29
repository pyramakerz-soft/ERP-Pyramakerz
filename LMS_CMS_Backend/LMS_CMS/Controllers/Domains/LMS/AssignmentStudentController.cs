using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Inventory;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AssignmentStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////////////////////////////////

        [HttpGet("GetByAssignmentIDClassID/{Aid}/{CiD}")]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" }
              //,
              //pages: new[] { "Assignment" }
          )]
        public async Task<IActionResult> GetByAssignmentIDClassID(long Aid, long CiD, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
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

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            // Get total record count
            int totalRecords = await Unit_Of_Work.assignmentStudent_Repository
                .CountAsync(s => s.IsDeleted != true && s.AssignmentID == Aid && s.StudentClassroom.ClassID == CiD);

            List<AssignmentStudent> assignmentStudents = await Unit_Of_Work.assignmentStudent_Repository.Select_All_With_IncludesById_Pagination<AssignmentStudent>(s => s.AssignmentID == Aid && s.IsDeleted != true && s.StudentClassroom.ClassID == CiD,
                query => query.Include(e => e.StudentClassroom).ThenInclude(t => t.Student),
                query => query.Include(e => e.StudentClassroom.Classroom),
                query => query.Include(e => e.Assignment)
                ).Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            if (assignmentStudents == null || assignmentStudents.Count == 0)
            {
                return NotFound();
            }

            List<AssignmentStudentGetDTO> DTO = mapper.Map<List<AssignmentStudentGetDTO>>(assignmentStudents);
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var item in DTO)
            {
                if (item.AssignmentTypeID == 1)
                {
                    if (!string.IsNullOrEmpty(item.LinkFile))
                    {
                        item.LinkFile = $"{serverUrl}{item.LinkFile.Replace("\\", "/")}";
                    }
                }
            }

            var paginationMetadata = new
            {
                TotalRecords = totalRecords,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
            };

            return Ok(new { Data = DTO, Pagination = paginationMetadata });

        }
        /////////////////////////////////////////////

        [HttpGet("GetByAssignmentId/{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" , "student" }
         //,
         //pages: new[] { "Assignment" }
         )]
        public async Task<IActionResult> GetByAssignmentId(long id)
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

            Assignment assignment = await Unit_Of_Work.assignment_Repository.FindByIncludesAsync(
                 s => s.ID == id && s.IsDeleted != true,

                 query => query.Include(e => e.AssignmentQuestions)
                         .ThenInclude(aq => aq.QuestionBank),

                 query => query.Include(e => e.AssignmentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionBankOptions),

                 query => query.Include(e => e.AssignmentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionType),

                 query => query.Include(e => e.AssignmentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.SubBankQuestions) 
             );

            if (assignment == null)
            {
                return NotFound();
            }

            if (assignment != null)
            {
                // Filter AssignmentQuestions where QuestionBank is not deleted
                assignment.AssignmentQuestions = assignment.AssignmentQuestions .Where(aq =>
                        aq.IsDeleted != true &&              
                        aq.QuestionBank != null &&
                        aq.QuestionBank.IsDeleted != true).ToList();

                foreach (var aq in assignment.AssignmentQuestions)
                {
                    var qb = aq.QuestionBank;

                    // Filter QuestionBankOptions
                    if (qb?.QuestionBankOptions != null)
                    {
                        qb.QuestionBankOptions = qb.QuestionBankOptions
                            .Where(opt => opt.IsDeleted != true)
                            .ToList();
                    }

                    // Filter SubBankQuestions
                    if (qb?.SubBankQuestions != null)
                    {
                        qb.SubBankQuestions = qb.SubBankQuestions
                            .Where(sub => sub.IsDeleted != true)
                            .ToList();
                    }
                }
            }

            AssignmentGetDTO DTO = mapper.Map<AssignmentGetDTO>(assignment);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (DTO.AssignmentTypeID == 1)
            {
                if (!string.IsNullOrEmpty(DTO.LinkFile))
                {
                    DTO.LinkFile = $"{serverUrl}{DTO.LinkFile.Replace("\\", "/")}";
                }
            }

            return Ok(DTO);
        }
        /////////////////////////////////////////////

        [HttpGet("GetById/{id}")]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee", "student" }
         //,
         //pages: new[] { "Assignment" }
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

            AssignmentStudent assignmentStudent = await Unit_Of_Work.assignmentStudent_Repository.FindByIncludesAsync(
                 s => s.ID == id && s.IsDeleted != true,

                 query => query.Include(e => e.Assignment)
                     .ThenInclude(a => a.AssignmentQuestions)
                         .ThenInclude(aq => aq.QuestionBank),

                 query => query.Include(e => e.StudentClassroom)
                     .ThenInclude(sc => sc.Student),

                 query => query.Include(e => e.StudentClassroom)
                     .ThenInclude(sc => sc.Classroom),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.AssignmentStudentQuestionAnswerOption),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionBankOptions),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.QuestionType),

                 query => query.Include(e => e.AssignmentStudentQuestions)
                     .ThenInclude(q => q.QuestionBank)
                         .ThenInclude(qb => qb.SubBankQuestions) // ✅ This ensures subBankQuestion is populated
             );


            if (assignmentStudent == null)
            {
                return NotFound();
            }

            AssignmentStudentGetDTO DTO = mapper.Map<AssignmentStudentGetDTO>(assignmentStudent);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (DTO.AssignmentTypeID == 1)
            {
                if (!string.IsNullOrEmpty(DTO.LinkFile))
                {
                    DTO.LinkFile = $"{serverUrl}{DTO.LinkFile.Replace("\\", "/")}";
                }
            }

            return Ok(DTO);
        }


        /////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" ,"student" }
          //,
          //pages: new[] { "Book Correction" }
      )]
        public async Task<IActionResult> Add(AssignmentStudentAddDTO newData)
        {

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (newData == null)
                return BadRequest("Answers are empty");

            // Get user info
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            if (userIdClaim == null || userTypeClaim == null || !long.TryParse(userIdClaim, out long userId))
                return Unauthorized("Invalid user claims.");

            Assignment assignment = Unit_Of_Work.assignment_Repository.First_Or_Default(a => a.ID == newData.AssignmentID && a.IsDeleted != true);
            if (assignment == null)
            {
                return BadRequest("There is no assignment with this id");
            }
            if (assignment.AssignmentTypeID == 1)
            {
                return BadRequest("this assignment TextBookAssignment");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            DateTime today = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (assignment.CutOfDate != null)
            {
                DateTime cutOffDateTime = assignment.CutOfDate.ToDateTime(TimeOnly.MaxValue); // Treats it as end of day

                if (today > cutOffDateTime)
                {
                    return BadRequest("Submission failed: The assignment deadline has passed.");
                }
            }

            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(s => s.IsDeleted != true && s.StudentID == newData.StudentId && s.Classroom.IsDeleted != true && s.Classroom.AcademicYear.IsDeleted != true && s.Classroom.AcademicYear.IsActive == true);
            if (studentClassroom == null)
            {
                return BadRequest("this Student Not Exist In any classroom");
            }

            AssignmentStudent assignmentStudent = Unit_Of_Work.assignmentStudent_Repository.First_Or_Default(s=>s.AssignmentID==newData.AssignmentID && s.StudentClassroomID== studentClassroom.ID && s.IsDeleted != true);
            if (assignmentStudent != null)
            {
                return BadRequest("You have already submitted this assignment and cannot submit it again.");
            }
            // Get all valid assignment questions
            var assignmentQuestions = Unit_Of_Work.assignmentQuestion_Repository
                .FindBy(s => s.AssignmentID == newData.AssignmentID && s.Assignment.IsDeleted !=true && s.QuestionBank.IsDeleted != true);

            var validQuestionIds = assignmentQuestions.Select(q => q.QuestionBankID).ToHashSet();

            // Filter only valid student answers
            var validAnswers = newData.AssignmentStudentQuestions
                .Where(a => validQuestionIds.Contains(a.QuestionBankID))
                .ToList();

            // Identify unanswered questions
            var unansweredQuestionIds = validQuestionIds
                .Except(validAnswers.Select(a => a.QuestionBankID))
                .ToList();

            foreach (var item in unansweredQuestionIds)
            {
                var answerOption = new AssignmentStudentQuestionAnswerOptionAddDTO
                {
                    Order = 0,
                    Answer = ""
                };

                var unansweredQuestion = new AssignmentStudentQuestionAddDTO
                {
                    QuestionBankID = item,
                    Answer = "",
                    AssignmentStudentQuestionAnswerOption = new List<AssignmentStudentQuestionAnswerOptionAddDTO> { answerOption }
                };

                newData.AssignmentStudentQuestions.Add(unansweredQuestion); 
            }

            foreach (var question in newData.AssignmentStudentQuestions ?? new List<AssignmentStudentQuestionAddDTO>())
            {
                if (question.AnswerOptionID == 0)
                    question.AnswerOptionID = null;

                foreach (var option in question.AssignmentStudentQuestionAnswerOption ?? new List<AssignmentStudentQuestionAnswerOptionAddDTO>())
                {
                    if (option.SubBankQuestionID == 0) option.SubBankQuestionID = null;
                    if (option.AssignmentStudentQuestionID == 0) option.AssignmentStudentQuestionID = null;
                    if (option.SelectedOpionID == 0) option.SelectedOpionID = null;
                }
            }

            // Map the main entity
            assignmentStudent = mapper.Map<AssignmentStudent>(newData);

            assignmentStudent.StudentClassroomID = studentClassroom.ID;
            // Set inserted timestamps and user
            assignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
                assignmentStudent.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee")
                assignmentStudent.InsertedByUserId = userId;

            Unit_Of_Work.assignmentStudent_Repository.Add(assignmentStudent);
            Unit_Of_Work.SaveChanges();
             

            return Ok();
        }
        /////////////////////////////////////////////

        [HttpPost("AddWhenTextBookAssignment")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee", "student" }
          //,
          //pages: new[] { "Book Correction" }
      )]
        public async Task<IActionResult> AddWhenTextBookAssignment([FromForm]AssignmentStudentAddDTOFile newData)
        {

            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (newData == null)
                return BadRequest("Answers are empty");

            // Get user info
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            if (userIdClaim == null || userTypeClaim == null || !long.TryParse(userIdClaim, out long userId))
                return Unauthorized("Invalid user claims.");

            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(s => s.IsDeleted != true && s.StudentID == newData.StudentId && s.Classroom.IsDeleted != true && s.Classroom.AcademicYear.IsDeleted != true && s.Classroom.AcademicYear.IsActive == true);
            if (studentClassroom == null)
            {
                return BadRequest("this Student Not Exist In any classroom");
            }
            AssignmentStudent assignmentStudent = Unit_Of_Work.assignmentStudent_Repository.First_Or_Default(s => s.AssignmentID == newData.AssignmentID && s.StudentClassroomID == studentClassroom.ID && s.IsDeleted != true);
            if (assignmentStudent != null)
            {
                return BadRequest("You have already submitted this assignment and cannot submit it again.");
            }

            Assignment assignment= Unit_Of_Work.assignment_Repository.First_Or_Default(a=>a.ID==newData.AssignmentID && a.IsDeleted!= true);
            if (assignment == null)
            {
                return BadRequest("There is no assignment with this id");
            }
            if(assignment.AssignmentTypeID != 1)
            {
                return BadRequest("this assignment not TextBookAssignment");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            DateTime today = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (assignment.CutOfDate != null)
            {
                DateTime cutOffDateTime = assignment.CutOfDate.ToDateTime(TimeOnly.MaxValue); // Treats it as end of day

                if (today > cutOffDateTime)
                {
                    return BadRequest("Submission failed: The assignment deadline has passed");
                }
            }

            // Map the main entity
            if (newData.File == null)
            {
                return BadRequest("File Is Required");
            }
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var allowedMimeTypes = new[] {
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            };
            var maxFileSize = 25 * 1024 * 1024; // 25 MB

            var fileExtension = Path.GetExtension(newData.File.FileName).ToLower();
            var contentType = newData.File.ContentType;

            if (!allowedExtensions.Contains(fileExtension) || !allowedMimeTypes.Contains(contentType))
            {
                return BadRequest("Only PDF or Word (.doc/.docx) files are allowed.");
            }
            if (newData.File.Length > maxFileSize)
            {
                return BadRequest("File size exceeds the 25 MB limit.");
            }

            assignmentStudent = new AssignmentStudent();
            assignmentStudent.AssignmentID = newData.AssignmentID;
            assignmentStudent.StudentClassroomID = studentClassroom.ID;
            // Set inserted timestamps and user
            //var cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
                assignmentStudent.InsertedByOctaId = userId;
            else if (userTypeClaim == "employee")
                assignmentStudent.InsertedByUserId = userId;

            Unit_Of_Work.assignmentStudent_Repository.Add(assignmentStudent);
            Unit_Of_Work.SaveChanges();

            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/AssignmentStudent");
            var medalFolder = Path.Combine(baseFolder, assignmentStudent.ID.ToString());
            if (!Directory.Exists(medalFolder))
            {
                Directory.CreateDirectory(medalFolder);
            }

            if (newData.File != null && newData.File.Length > 0)
            {
                var fileName = Path.GetFileName(newData.File.FileName);
                var filePath = Path.Combine(medalFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await newData.File.CopyToAsync(stream);
                }
                assignmentStudent.LinkFile = $"Uploads/AssignmentStudent/{assignmentStudent.ID.ToString()}/{fileName}";
            }

            Unit_Of_Work.assignmentStudent_Repository.Update(assignmentStudent);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }


        /////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> EditAsync(AssignmentStudentEditDTO newData)
        {
            if (newData == null)
                return BadRequest("Data cannot be null.");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userId == 0 || string.IsNullOrEmpty(userTypeClaim))
                return Unauthorized("User ID or type is invalid.");

            var unitOfWork = _dbContextFactory.CreateOneDbContext(HttpContext);

            var assignmentStudent = await unitOfWork.assignmentStudent_Repository.FindByIncludesAsync(
                s => s.ID == newData.ID && s.IsDeleted != true,
                q => q.Include(e => e.Assignment)
                      .ThenInclude(a => a.AssignmentQuestions)
                          .ThenInclude(aq => aq.QuestionBank),
                q => q.Include(e => e.AssignmentStudentQuestions)
                      .ThenInclude(sq => sq.QuestionBank),
                q => q.Include(e => e.Assignment)
                      .ThenInclude(a => a.Subject)
            );

            if (assignmentStudent == null)
                return NotFound("Assignment student not found.");
            if (assignmentStudent.Assignment.AssignmentTypeID == 1)
            {
                if(assignmentStudent.Degree> assignmentStudent.Assignment.Mark)
                {
                    return BadRequest($"Degree cannot exceed assignment mark");
                }
                else
                {
                   assignmentStudent.Degree= newData.Degree;
                }
            }
            else
            {
                var assignmentQuestions = assignmentStudent.Assignment.AssignmentQuestions.ToList();

                // Step 1: Save the new marks
                foreach (var questionDto in newData.AssignmentStudentQuestions)
                {
                    var studentQuestion = assignmentStudent.AssignmentStudentQuestions
                        .FirstOrDefault(q => q.ID == questionDto.ID);

                    if (studentQuestion != null)
                    {
                        studentQuestion.Mark = questionDto.Mark;
                    }
                }

                // Step 2: Validate and calculate degree
                double totalQuestionMarks = 0;
                double totalStudentMarks = 0;

                foreach (var studentQuestion in assignmentStudent.AssignmentStudentQuestions)
                {
                    var questionBank = studentQuestion.QuestionBank;
                    if (questionBank == null)
                        return BadRequest($"Question bank not found for student question ID {studentQuestion.ID}");

                    double maxMark = questionBank.Mark;

                    if (studentQuestion.Mark > maxMark)
                        return BadRequest($"Mark for question ID {studentQuestion.ID} cannot exceed {maxMark}");

                    totalQuestionMarks += maxMark;
                    totalStudentMarks += studentQuestion.Mark;
                }

                var assignmentDegree = assignmentStudent.Assignment.Mark;
                assignmentStudent.Degree = totalQuestionMarks > 0
                       ? (float)((totalStudentMarks * assignmentDegree) / totalQuestionMarks)
                       : 0;
            }

            if (assignmentStudent.InsertedAt.HasValue && assignmentStudent.Assignment != null && assignmentStudent.Assignment.DueDate != null) 
            {
                var insertedDate = assignmentStudent.InsertedAt.Value.Date;
                var dueDate = assignmentStudent.Assignment.DueDate;

                // Convert DateOnly to DateTime for comparison
                var dueDateTime = dueDate.ToDateTime(TimeOnly.MinValue);

                if (insertedDate > dueDateTime)
                {
                    double penaltyRatio = assignmentStudent.Assignment.Subject?.AssignmentCutOffDatePercentage ?? 0;
                    penaltyRatio = penaltyRatio / 100;
                    if (penaltyRatio > 0 && penaltyRatio <= 1 && assignmentStudent.Degree > 0)
                    {
                        float penalty = (float)(assignmentStudent.Degree * penaltyRatio);
                        assignmentStudent.Degree -= penalty;
                    }
                }
            }
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            assignmentStudent.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                assignmentStudent.UpdatedByOctaId = userId;
                if (assignmentStudent.UpdatedByUserId != null)
                {
                    assignmentStudent.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                assignmentStudent.UpdatedByUserId = userId;
                if (assignmentStudent.UpdatedByOctaId != null)
                {
                    assignmentStudent.UpdatedByOctaId = null;
                }
            }
            unitOfWork.assignmentStudent_Repository.Update(assignmentStudent);
            await unitOfWork.SaveChangesAsync();

            return Ok();
        }
    }
}
