using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
            //,
            //pages: new[] { "" }
        )]
        public async Task<IActionResult> Add([FromForm] AssignmentQuestionAddDTO newData)
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

            if (assignment.AssignmentTypeID == 1) // Text Book Assignment
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/AssignmentQuestion");
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
                    assignment.LinkFile = $"{Request.Scheme}://{Request.Host}/Uploads/AssignmentQuestion/{assignment.ID.ToString()}/{fileName}";
                }

                Unit_Of_Work.assignment_Repository.Update(assignment);
                Unit_Of_Work.SaveChanges();
            }
            else if (assignment.AssignmentTypeID == 2) 
            {
                foreach (var item in newData.QuestionIds)
                {
                    QuestionBank questionBank = Unit_Of_Work.questionBank_Repository.First_Or_Default(q=>q.ID == item && q.IsDeleted!= true);
                    if (questionBank != null)
                    { 
                        AssignmentQuestion assignmentQuestion = new AssignmentQuestion();
                        assignmentQuestion.ID = item;
                        assignmentQuestion.AssignmentID = assignment.ID;
                        TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                        assignmentQuestion.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        if (userTypeClaim == "octa")
                        {
                            assignmentQuestion.InsertedByOctaId = userId;
                        }
                        else if (userTypeClaim == "employee")
                        {
                            assignmentQuestion.InsertedByUserId = userId;
                        }

                        Unit_Of_Work.assignmentQuestion_Repository.Add(assignmentQuestion);
                        Unit_Of_Work.SaveChanges();
                    }
                }

            }
            else if (assignment.AssignmentTypeID == 3)
            {
                List<QuestionBank> selectedQuestions = new List<QuestionBank>();

                foreach (var item in newData.QuestionAssignmentTypeCountDTO)
                {
                    var filteredQuestions = Unit_Of_Work.questionBank_Repository
                        .FindBy(q => q.IsDeleted != true && q.QuestionTypeID == item.QuestionTypeId);

                    var random = new Random();
                    var randomizedQuestions = filteredQuestions
                        .OrderBy(q => random.Next())
                        .Take((int)item.NumberOfQuestion)
                        .ToList();

                    selectedQuestions.AddRange(randomizedQuestions);
                }

                foreach (var item in  selectedQuestions)
                {
                    AssignmentQuestion assignmentQuestion = new AssignmentQuestion();
                    assignmentQuestion.ID = item.ID;
                    assignmentQuestion.AssignmentID = assignment.ID;
                    TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                    assignmentQuestion.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        assignmentQuestion.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        assignmentQuestion.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.assignmentQuestion_Repository.Add(assignmentQuestion);
                    Unit_Of_Work.SaveChanges();
                }
            }

            return Ok();
        }
    }
}
