using AutoMapper;
using LMS_CMS_BL.DTO.Accounting;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.DTO.Registration;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
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
    public class ClassroomStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public ClassroomStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet("GetByClassroom/{classId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Classroom Students" }
        )]
        public async Task<IActionResult> GetAsync(long classId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == classId);
            if(classroom == null)
            {
                return NotFound("No Classroom with this ID");
            }

            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository.Select_All_With_IncludesById<StudentClassroom>(
                    f => f.IsDeleted != true && f.ClassID == classId,
                    query => query.Include(emp => emp.Student),
                    query => query.Include(emp => emp.Classroom));

            if (studentClassrooms == null || studentClassrooms.Count == 0)
            {
                return NotFound();
            }

            List<StudentClassroomGetDTO> studentClassroomsDTO = mapper.Map<List<StudentClassroomGetDTO>>(studentClassrooms);

            return Ok(studentClassroomsDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetClassFoActiveAcademicYearWithStudentsIncluded")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" }
        )]
        public async Task<IActionResult> GetClassFoActiveAcademicYearWithStudentsIncluded()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<StudentClassroom> studentClassrooms = await Unit_Of_Work.studentClassroom_Repository
                .Select_All_With_IncludesById<StudentClassroom>(
                    f => f.IsDeleted != true && f.Classroom.AcademicYear.IsActive == true && f.Classroom.IsDeleted != true && f.Student.IsDeleted != true,
                    query => query.Include(cs => cs.Classroom),
                    query => query.Include(cs => cs.Student)
                );

            if (studentClassrooms == null)
            {
                return NotFound("No Classroom Students in this active year");
            }

            var groupedStudents = studentClassrooms
                .GroupBy(sc => sc.Classroom.ID)
                .Select(group => new
                {
                    ClassroomId = group.Key,
                    ClassroomName = group.FirstOrDefault()?.Classroom.Name, 
                    Students = group.Select(sc => new
                    {
                        StudentClassId = sc.ID,
                        StudentId = sc.Student.ID,
                        StudentEnglishName = sc.Student.en_name,
                        StudentArabicName = sc.Student.ar_name 
                    }).ToList()
                }).ToList();

            return Ok(groupedStudents);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByID/{Id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Classroom Students" }
        )]
        public async Task<IActionResult> GetByIDAsync(long Id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            StudentClassroom studentClassroom = await Unit_Of_Work.studentClassroom_Repository.FindByIncludesAsync(
                    d => d.IsDeleted != true && d.ID == Id,
                    query => query.Include(emp => emp.Student),
                    query => query.Include(emp => emp.StudentClassroomSubjects.Where(d => d.IsDeleted != true)).ThenInclude(d => d.Subject),
                    query => query.Include(emp => emp.Classroom));
            if(studentClassroom == null)
            {
                return NotFound("No Student Classroom with this ID");
            }

            StudentClassroomGetDTO studentClassroomDTO = mapper.Map<StudentClassroomGetDTO>(studentClassroom);

            return Ok(studentClassroomDTO);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
             allowedTypes: new[] { "octa", "employee" },
             pages: new[] { "Classroom Students" }
        )]
        public async Task<IActionResult> AddAsync(StudentClassroomAddDTO newStudentClassroom)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (newStudentClassroom == null)
            {
                return BadRequest("Student Classroom cannot be null");
            }

            Classroom classroom = await Unit_Of_Work.classroom_Repository.FindByIncludesAsync(
                s => s.ID == newStudentClassroom.ClassID && s.IsDeleted != true, 
                query => query.Include(d => d.ClassroomSubjects)
                );
            if (classroom == null)
            {
                return BadRequest("this Classroom is not exist");
            }

            List<Student> studentsAlreadyAssignedToClass = new List<Student>();

            foreach (var studentID in newStudentClassroom.StudentIDs)
            {
                Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == studentID && s.IsDeleted != true);
                if (student == null)
                {
                    return BadRequest("this Student is not exist");
                }

                StudentClassroom studentClassroomExists = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(
                    d => d.IsDeleted != true && d.StudentID == studentID && d.Classroom.GradeID == classroom.GradeID
                    );

                if(studentClassroomExists != null)
                {
                    studentsAlreadyAssignedToClass.Add(student);
                }
                else
                {
                    StudentClassroom studentClassroom = new StudentClassroom();
                    studentClassroom.StudentID = studentID;
                    studentClassroom.ClassID = newStudentClassroom.ClassID;
                    studentClassroom.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        studentClassroom.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        studentClassroom.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.studentClassroom_Repository.Add(studentClassroom);
                    Unit_Of_Work.SaveChanges();

                    if (classroom.ClassroomSubjects != null && classroom.ClassroomSubjects.Count != 0)
                    {
                        foreach (var classroomSubject in classroom.ClassroomSubjects)
                        {
                            if(classroomSubject.Hide != true)
                            {
                                StudentClassroomSubject studentClassroomSubject = new StudentClassroomSubject();
                                studentClassroomSubject.StudentClassroomID = studentClassroom.ID;
                                studentClassroomSubject.SubjectID = classroomSubject.SubjectID;
                                studentClassroomSubject.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                if (userTypeClaim == "octa")
                                {
                                    studentClassroomSubject.InsertedByOctaId = userId;
                                }
                                else if (userTypeClaim == "employee")
                                {
                                    studentClassroomSubject.InsertedByUserId = userId;
                                }

                                Unit_Of_Work.studentClassroomSubject_Repository.Add(studentClassroomSubject);

                                // Add Assignments To the StudentClass
                                //List<Assignment> assignments = Unit_Of_Work.assignment_Repository.FindBy(d => d.IsDeleted != true && d.SubjectID == classroomSubject.SubjectID);
                                //if (assignments != null)
                                //{
                                //    foreach (Assignment assignment in assignments)
                                //    {  
                                //        if (assignment.IsSpecificStudents != true)
                                //        {
                                //            AssignmentStudent newAssignmentStudent = new AssignmentStudent();
                                //            newAssignmentStudent.AssignmentID = assignment.ID;
                                //            newAssignmentStudent.StudentClassroomID =studentClassroom.ID;
                                //            newAssignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                                //            if (userTypeClaim == "octa")
                                //            {
                                //                newAssignmentStudent.InsertedByOctaId = userId;
                                //            }
                                //            else if (userTypeClaim == "employee")
                                //            {
                                //                newAssignmentStudent.InsertedByUserId = userId;
                                //            }

                                //            Unit_Of_Work.assignmentStudent_Repository.Add(newAssignmentStudent);
                                //        } 
                                //    }
                                //}
                            }
                        }
                    } 
                    Unit_Of_Work.SaveChanges();
                } 
            }

            List<StudentGetDTO> studentDTOs = mapper.Map<List<StudentGetDTO>>(studentsAlreadyAssignedToClass);

            return Ok(studentDTOs);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("TransferFromClassToClass")]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee" },
          allowEdit: 1,
          pages: new[] { "Classroom Students" }
        )]
        public async Task<IActionResult> EditAsync(StudentClassroomPutDTO editStudentClassroom)
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

            if (editStudentClassroom == null)
            {
                return BadRequest("Student Classroom be null");
            }

            Classroom classroomEdited = await Unit_Of_Work.classroom_Repository.FindByIncludesAsync(
                s => s.ID == editStudentClassroom.ClassID && s.IsDeleted != true,
                query => query.Include(d => d.ClassroomSubjects)
                );
            if (classroomEdited == null)
            {
                return BadRequest("this Classroom is not exist");
            }

            Student student = Unit_Of_Work.student_Repository.First_Or_Default(s => s.ID == editStudentClassroom.StudentID && s.IsDeleted != true);
            if (student == null)
            {
                return BadRequest("this Student is not exist");
            }
            
            StudentClassroom studentClassroom= await Unit_Of_Work.studentClassroom_Repository.FindByIncludesAsync(
                s => s.ID == editStudentClassroom.ID && s.IsDeleted != true,
                query => query.Include(d => d.Classroom)
                );
            if (student == null)
            {
                return BadRequest("this Student Classroom is not exist");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Classroom Students", roleId, userId, studentClassroom);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if(studentClassroom.Classroom.GradeID != classroomEdited.GradeID)
            {
                return BadRequest("Classrooms Are not at the Same Grade");
            }
             
            if (editStudentClassroom.ClassID != studentClassroom.ClassID)
            { 
                List<StudentClassroomSubject> studentClassroomSubjects = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(
                    d => d.StudentClassroomID == studentClassroom.ID && d.IsDeleted != true
                    );

                if(studentClassroomSubjects != null && studentClassroomSubjects.Count() > 0)
                {
                    foreach (var studentClassroomSubject in studentClassroomSubjects)
                    {
                        studentClassroomSubject.IsDeleted = true;
                        studentClassroomSubject.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                        if (userTypeClaim == "octa")
                        {
                            studentClassroomSubject.DeletedByOctaId = userId;
                            if (studentClassroomSubject.DeletedByUserId != null)
                            {
                                studentClassroomSubject.DeletedByUserId = null;
                            }
                        }
                        else if (userTypeClaim == "employee")
                        {
                            studentClassroomSubject.DeletedByUserId = userId;
                            if (studentClassroomSubject.DeletedByOctaId != null)
                            {
                                studentClassroomSubject.DeletedByOctaId = null;
                            }
                        }

                        Unit_Of_Work.studentClassroomSubject_Repository.Update(studentClassroomSubject);
                    } 
                }

                if (classroomEdited.ClassroomSubjects != null && classroomEdited.ClassroomSubjects.Count != 0)
                {
                    foreach (var classroomSubject in classroomEdited.ClassroomSubjects)
                    {
                        if (classroomSubject.Hide != true)
                        {
                            StudentClassroomSubject studentClassroomSubject = new StudentClassroomSubject();
                            studentClassroomSubject.StudentClassroomID = studentClassroom.ID;
                            studentClassroomSubject.SubjectID = classroomSubject.SubjectID;
                            studentClassroomSubject.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            if (userTypeClaim == "octa")
                            {
                                studentClassroomSubject.InsertedByOctaId = userId;
                            }
                            else if (userTypeClaim == "employee")
                            {
                                studentClassroomSubject.InsertedByUserId = userId;
                            }

                            Unit_Of_Work.studentClassroomSubject_Repository.Add(studentClassroomSubject); 
                        }
                    }
                }

                // Add and Remove Assignments To the StudentClass
                //List<AssignmentStudent> oldAssignmentStudents = Unit_Of_Work.assignmentStudent_Repository.FindBy(d => d.IsDeleted != true && d.StudentClassroomID == editStudentClassroom.ID);
                //List<Assignment> assignmentsAccordingToNewClass = new List<Assignment>();
                //foreach (var classSubject in classroomEdited.ClassroomSubjects.Where(d => d.IsDeleted != true && d.Hide != true))
                //{
                //    List<Assignment> assignments = Unit_Of_Work.assignment_Repository.FindBy(d => d.IsDeleted != true && d.SubjectID == classSubject.SubjectID);
                //    if(assignments != null)
                //    {
                //        foreach (Assignment item in assignments)
                //        {
                //            assignmentsAccordingToNewClass.Add(item);
                //        }
                //    }
                //}

                // 1: Delete AssignmentStudents whose AssignmentID is not in the new assignments.
                //List<long> assignmentIDsAccordingToNewClass = assignmentsAccordingToNewClass.Select(a => a.ID).ToList();
                //List<AssignmentStudent> assignmentsToDelete = oldAssignmentStudents.Where(os => !assignmentIDsAccordingToNewClass.Contains(os.AssignmentID)).ToList();

                //foreach (AssignmentStudent assignmentStudent in assignmentsToDelete)
                //{
                //    assignmentStudent.IsDeleted = true;
                //    assignmentStudent.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                //    if (userTypeClaim == "octa")
                //    {
                //        assignmentStudent.DeletedByOctaId = userId;
                //        if (assignmentStudent.DeletedByUserId != null)
                //        {
                //            assignmentStudent.DeletedByUserId = null;
                //        }
                //    }
                //    else if (userTypeClaim == "employee")
                //    {
                //        assignmentStudent.DeletedByUserId = userId;
                //        if (assignmentStudent.DeletedByOctaId != null)
                //        {
                //            assignmentStudent.DeletedByOctaId = null;
                //        }
                //    }
                //    Unit_Of_Work.assignmentStudent_Repository.Update(assignmentStudent);
                //}

                // 2: Add assignments that are not in oldAssignmentStudents.
                //List<long> oldAssignmentStudentIDs = oldAssignmentStudents.Select(os => os.AssignmentID).ToList();
                //List<Assignment> assignmentsToAdd = assignmentsAccordingToNewClass.Where(a => !oldAssignmentStudentIDs.Contains(a.ID)).ToList();

                //foreach (Assignment assignment in assignmentsToAdd)
                //{
                //    if(assignment.IsSpecificStudents != true)
                //    {
                //        AssignmentStudent newAssignmentStudent = new AssignmentStudent();
                //        newAssignmentStudent.AssignmentID = assignment.ID;
                //        newAssignmentStudent.StudentClassroomID = editStudentClassroom.ID;
                //        newAssignmentStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                //        if (userTypeClaim == "octa")
                //        {
                //            newAssignmentStudent.InsertedByOctaId = userId;
                //        }
                //        else if (userTypeClaim == "employee")
                //        {
                //            newAssignmentStudent.InsertedByUserId = userId;
                //        }

                //        Unit_Of_Work.assignmentStudent_Repository.Add(newAssignmentStudent);
                //    }
                //}
            }

            mapper.Map(editStudentClassroom, studentClassroom);
            studentClassroom.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentClassroom.UpdatedByOctaId = userId;
                if (studentClassroom.UpdatedByUserId != null)
                {
                    studentClassroom.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                studentClassroom.UpdatedByUserId = userId;
                if (studentClassroom.UpdatedByOctaId != null)
                {
                    studentClassroom.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.studentClassroom_Repository.Update(studentClassroom);
            Unit_Of_Work.SaveChanges();
            return Ok(editStudentClassroom);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Classroom Students" }
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
                return BadRequest("Enter Student Class ID");
            }

            StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);
            if (studentClassroom == null)
            {
                return NotFound("No Student Classroom with this ID");
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Classroom Students", roleId, userId, studentClassroom);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            studentClassroom.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            studentClassroom.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                studentClassroom.DeletedByOctaId = userId;
                if (studentClassroom.DeletedByUserId != null)
                {
                    studentClassroom.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                studentClassroom.DeletedByUserId = userId;
                if (studentClassroom.DeletedByOctaId != null)
                {
                    studentClassroom.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.studentClassroom_Repository.Update(studentClassroom);
            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
