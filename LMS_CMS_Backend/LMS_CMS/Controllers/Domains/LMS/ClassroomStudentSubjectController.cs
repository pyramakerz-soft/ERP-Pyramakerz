using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ClassroomStudentSubjectController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ClassroomStudentSubjectController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpPut("IsSubjectHide")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Classroom Students" }
        )]
        public IActionResult IsSubjectHide(StudentClassroomSubjectHidePutDTO EditedStudentClassroomSubjectHide)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID, Type claim not found.");
            }

            if (EditedStudentClassroomSubjectHide == null)
            {
                return BadRequest("Student Classroom Subject cannot be null");
            }

            StudentClassroomSubject StudentClassroomSubjectExists = Unit_Of_Work.studentClassroomSubject_Repository.First_Or_Default(
                g => g.ID == EditedStudentClassroomSubjectHide.ID && g.IsDeleted != true
                );
            if (StudentClassroomSubjectExists == null)
            {
                return NotFound("No Student Classroom Subject with this ID");
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Classroom Students", roleId, userId, StudentClassroomSubjectExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            // Remove Or Add this Subject's Assignment To Student
            //if(StudentClassroomSubjectExists.Hide != EditedStudentClassroomSubjectHide.Hide)
            //{
            //    // Get All Assignments with subject id
            //    List<Assignment> assignments = Unit_Of_Work.assignment_Repository.FindBy(d => d.IsDeleted != true && d.SubjectID == StudentClassroomSubjectExists.SubjectID);
            //    if (assignments != null)
            //    {
            //        foreach (Assignment assignment in assignments)
            //        {
            //            // If Hide was false then true so get all the assignments then delete them
            //            if(StudentClassroomSubjectExists.Hide == false && EditedStudentClassroomSubjectHide.Hide == true)
            //            {
            //                List<AssignmentStudent> assignmentStudents = Unit_Of_Work.assignmentStudent_Repository.FindBy(
            //                    d => d.IsDeleted != true && d.StudentClassroomID == StudentClassroomSubjectExists.StudentClassroomID && d.AssignmentID == assignment.ID
            //                    );

            //                if (assignmentStudents != null)
            //                {
            //                    foreach (var item in assignmentStudents)
            //                    {
            //                        item.IsDeleted = true;
            //                        item.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            //                        if (userTypeClaim == "octa")
            //                        {
            //                            item.DeletedByOctaId = userId;
            //                            if (item.DeletedByUserId != null)
            //                            {
            //                                item.DeletedByUserId = null;
            //                            }
            //                        }
            //                        else if (userTypeClaim == "employee")
            //                        {
            //                            item.DeletedByUserId = userId;
            //                            if (item.DeletedByOctaId != null)
            //                            {
            //                                item.DeletedByOctaId = null;
            //                            }
            //                        }
            //                        Unit_Of_Work.assignmentStudent_Repository.Update(item);
            //                    }
            //                }
            //            }

            //            // If Hide was true then false then see if he doesn't have the assignment so add it (if isSpecific = false)
            //            if (StudentClassroomSubjectExists.Hide == true && EditedStudentClassroomSubjectHide.Hide == false)
            //            {
            //                if(assignment.IsSpecificStudents != true)
            //                {
            //                    AssignmentStudent assignmentStudent = Unit_Of_Work.assignmentStudent_Repository.First_Or_Default(
            //                        d => d.IsDeleted != true && d.StudentClassroomID == StudentClassroomSubjectExists.StudentClassroomID && d.AssignmentID == assignment.ID
            //                        );

            //                    if (assignmentStudent == null)
            //                    {
            //                        AssignmentStudent newAssignmentStudent = new AssignmentStudent();
            //                        newAssignmentStudent.AssignmentID = assignment.ID;
            //                        newAssignmentStudent.StudentClassroomID = StudentClassroomSubjectExists.StudentClassroomID;
            //                        newAssignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            //                        if (userTypeClaim == "octa")
            //                        {
            //                            newAssignmentStudent.InsertedByOctaId = userId;
            //                        }
            //                        else if (userTypeClaim == "employee")
            //                        {
            //                            newAssignmentStudent.InsertedByUserId = userId;
            //                        }

            //                        Unit_Of_Work.assignmentStudent_Repository.Add(newAssignmentStudent); 
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}

            mapper.Map(EditedStudentClassroomSubjectHide, StudentClassroomSubjectExists);

            StudentClassroomSubjectExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                StudentClassroomSubjectExists.UpdatedByOctaId = userId;
                if (StudentClassroomSubjectExists.UpdatedByUserId != null)
                {
                    StudentClassroomSubjectExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                StudentClassroomSubjectExists.UpdatedByUserId = userId;
                if (StudentClassroomSubjectExists.UpdatedByOctaId != null)
                {
                    StudentClassroomSubjectExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.studentClassroomSubject_Repository.Update(StudentClassroomSubjectExists);
            Unit_Of_Work.SaveChanges();
 
            return Ok();
        }
    }
}
