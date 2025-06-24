using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentQuestionController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public AssignmentQuestionController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        /////////////////////////////////////////////

        [HttpGet("GetByID/{id}")]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" }
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

            Assignment assignment = Unit_Of_Work.assignment_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);
            if (assignment == null)
            {
                return BadRequest("No assignment with this id");
            }

            Assignment Assignment = await Unit_Of_Work.assignment_Repository.FindByIncludesAsync(
                    sem => sem.IsDeleted != true && sem.ID == id,
                    query => query.Include(d => d.AssignmentType),
                    query => query.Include(d => d.Subject),
                    query => query.Include(d => d.AssignmentQuestions)
                                   .ThenInclude(aq => aq.QuestionBank)
                                     .ThenInclude(qb => qb.SubBankQuestions)
                   );

            if (Assignment == null)
            {
                return NotFound();
            }
            Assignment.AssignmentQuestions = Assignment.AssignmentQuestions.Where(aq => aq.IsDeleted != true && aq.QuestionBank != null && aq.QuestionBank.IsDeleted != true).ToList(); 

            AssignmentGetDTO AssignmentGetDTO = mapper.Map<AssignmentGetDTO>(Assignment);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";

            if (!string.IsNullOrEmpty(AssignmentGetDTO.LinkFile))
            {
                AssignmentGetDTO.LinkFile = $"{serverUrl}{AssignmentGetDTO.LinkFile.Replace("\\", "/")}";
            }

            return Ok(AssignmentGetDTO);
        }

        /////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
            //,
            //pages: new[] { "" }
        )]
        public async Task<IActionResult> Add(AssignmentQuestionAddDTO newData)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newData == null)
            {
                return BadRequest("Assignment Question cannot be null");
            }

            Assignment assignment = Unit_Of_Work.assignment_Repository.First_Or_Default(a => a.ID == newData.AssignmentID && a.IsDeleted!= true);
            if (assignment == null) 
            {
                return BadRequest("There Is No Assignment With This Id");
              
            }

<<<<<<< HEAD
            if (assignment.AssignmentTypeID == 1) // Text Book Assignment
            {
                if(newData.File == null)
                {
                    return BadRequest("File Is Required");
                }
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Assignment");
                var medalFolder = Path.Combine(baseFolder, assignment.ID.ToString());
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
                    assignment.LinkFile = $"Uploads/Assignment/{assignment.ID.ToString()}/{fileName}";
                }

                Unit_Of_Work.assignment_Repository.Update(assignment);
                Unit_Of_Work.SaveChanges();
            }
            else if (assignment.AssignmentTypeID == 2)
=======
            // Text Book Assignment (assignment.AssignmentTypeID == 1) ==> handled in Assignment
            if (assignment.AssignmentTypeID == 2) 
>>>>>>> f25f2815d2920c751732aa7d19155fc89da68c32
            {
                foreach (var item in newData.QuestionIds)
                {
                    var questionBank = Unit_Of_Work.questionBank_Repository.First_Or_Default(q => q.ID == item && q.IsDeleted != true);
                    if (questionBank != null)
                    {
                        var assignmentQuestion = Unit_Of_Work.assignmentQuestion_Repository
                            .First_Or_Default(a => a.QuestionBankID == item && a.AssignmentID == assignment.ID);

                        if (assignmentQuestion != null)
                        {
                            if (assignmentQuestion.IsDeleted == true)
                            {
                                assignmentQuestion.IsDeleted = false;
                                Unit_Of_Work.assignmentQuestion_Repository.Update(assignmentQuestion);
                                Unit_Of_Work.SaveChanges();
                            }
                            else
                            {
                                return BadRequest($"Question bank with ID {item} already exists in this assignment.");
                            }
                        }
                        else
                        {
                            var newAssignmentQuestion = new AssignmentQuestion
                            {
                                QuestionBankID = item,
                                AssignmentID = assignment.ID,
                                InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time"))
                            };

                            if (userTypeClaim == "octa")
                                newAssignmentQuestion.InsertedByOctaId = userId;
                            else if (userTypeClaim == "employee")
                                newAssignmentQuestion.InsertedByUserId = userId;

                            Unit_Of_Work.assignmentQuestion_Repository.Add(newAssignmentQuestion);
                            Unit_Of_Work.SaveChanges();
                        }
                    }
                }
            }
            else if (assignment.AssignmentTypeID == 3) // Randomized by tag/type
            {
                var selectedQuestions = new List<QuestionBank>();

                // Get all assignment questions (including soft-deleted)
                var allAssignmentQuestions = Unit_Of_Work.assignmentQuestion_Repository
                    .FindBy(q => q.AssignmentID == assignment.ID)
                    .ToList();

                var activeQuestionIds = allAssignmentQuestions
                    .Where(q => q.IsDeleted != true)
                    .Select(q => q.QuestionBankID)
                    .ToHashSet();

                var softDeletedQuestions = allAssignmentQuestions
                    .Where(q => q.IsDeleted == true)
                    .ToDictionary(q => q.QuestionBankID, q => q);

                List<long> questionBankIds;

                if (newData.SelectedTagsIds != null && newData.SelectedTagsIds.Count > 0)
                {
                    var questionBankTags = Unit_Of_Work.questionBankTags_Repository.FindBy(
                        s => newData.SelectedTagsIds.Contains(s.TagID)
                            && s.Tag.IsDeleted != true
                            && s.QuestionBank.IsDeleted != true
                            && s.IsDeleted != true
                    );

                    questionBankIds = questionBankTags
                        .Select(s => s.QuestionBankID)
                        .Distinct()
                        .ToList();
                }
                else
                {
                    var questionBanks = Unit_Of_Work.questionBank_Repository.FindBy(
                        s => s.IsDeleted != true
                            && s.LessonID == newData.LessonID
                            && s.Lesson.IsDeleted != true
                    );

                    questionBankIds = questionBanks
                        .Select(s => s.ID)
                        .Distinct()
                        .ToList();
                }

                if (newData.QuestionAssignmentTypeCountDTO != null)
                {
                    foreach (var item in newData.QuestionAssignmentTypeCountDTO)
                    {
                        var filteredQuestions = Unit_Of_Work.questionBank_Repository.FindBy(
                            q => q.IsDeleted != true
                                && q.QuestionTypeID == item.QuestionTypeId
                                && questionBankIds.Contains(q.ID)
                        );

                        var random = new Random();
                        var randomizedQuestions = filteredQuestions
                            .OrderBy(q => random.Next())
                            .ToList();

                        foreach (var q in randomizedQuestions)
                        {
                            if (activeQuestionIds.Contains(q.ID))
                                continue; // Skip already added

                            if (softDeletedQuestions.TryGetValue(q.ID, out var softDeletedAssignment))
                            {
                                // Restore soft-deleted question
                                softDeletedAssignment.IsDeleted = false;
                                softDeletedAssignment.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time"));
                                if (userTypeClaim == "octa")
                                    softDeletedAssignment.UpdatedByOctaId = userId;
                                else if (userTypeClaim == "employee")
                                    softDeletedAssignment.UpdatedByUserId = userId;

                                Unit_Of_Work.assignmentQuestion_Repository.Update(softDeletedAssignment);
                                Unit_Of_Work.SaveChanges();

                                activeQuestionIds.Add(q.ID); // track restored
                                continue;
                            }

                            // Add new assignment question
                            var assignmentQuestion = new AssignmentQuestion
                            {
                                QuestionBankID = q.ID,
                                AssignmentID = assignment.ID,
                                InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time")),
                                InsertedByOctaId = userTypeClaim == "octa" ? userId : null,
                                InsertedByUserId = userTypeClaim == "employee" ? userId : null
                            };

                            Unit_Of_Work.assignmentQuestion_Repository.Add(assignmentQuestion);
                            Unit_Of_Work.SaveChanges();

                            activeQuestionIds.Add(q.ID);
                        }
                    }
                }
            }
            return Ok();
        }

        /////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           allowDelete: 1
           // ,
           //pages: new[] { "" }
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
                return BadRequest("Enter Floor ID");
            }

            AssignmentQuestion assignmentQuestion = Unit_Of_Work.assignmentQuestion_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);


            if (assignmentQuestion == null)
            {
                return NotFound();
            }

            //if (userTypeClaim == "employee")
            //{
            //    IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Floor", roleId, userId, floor);
            //    if (accessCheck != null)
            //    {
            //        return accessCheck;
            //    }
            //}

            assignmentQuestion.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
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
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
