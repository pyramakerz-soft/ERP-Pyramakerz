using LMS_CMS_DAL.Models.Domains.LMS;

namespace LMS_CMS_PL.Services.Dashboard
{
    public class LMS_Service
    {
        private readonly DbContextFactoryService _dbContextFactory;

        public LMS_Service(DbContextFactoryService dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        public (int NotAnswered, int AnsweredOnTime, int AnsweredLate) AssignmentSubmissionCount(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            // Date ==> Assignment Due Date

            List<Assignment> assignments = unitOfWork.assignment_Repository
                .FindBy(f =>
                    f.IsDeleted != true &&
                    f.DueDate.Year == year &&
                    (month == null || f.DueDate.Month == month)
                ).ToList();

            List<long> studentClassroomIDs = new List<long>();

            foreach (var assignment in assignments)
            {
                if (assignment.IsSpecificStudents)
                {
                    List<AssignmentStudentIsSpecific> studentIsSpecifics = unitOfWork.assignmentStudentIsSpecific_Repository.FindBy(
                        d => d.IsDeleted != true && d.AssignmentID == assignment.ID && 
                        d.StudentClassroom.IsDeleted != true && d.StudentClassroom.Classroom.IsDeleted != true && d.StudentClassroom.Student.IsDeleted != true
                        ).ToList(); 
                    studentClassroomIDs.AddRange(studentIsSpecifics.Select(s => s.StudentClassroomID));
                }
                else
                {
                    List<StudentClassroomSubject> studentClassroomSubjects = unitOfWork.studentClassroomSubject_Repository.FindBy(
                        d => d.SubjectID == assignment.SubjectID && d.IsDeleted != true && !d.Hide &&
                        d.StudentClassroom.IsDeleted != true && d.StudentClassroom.Classroom.IsDeleted != true && d.StudentClassroom.Student.IsDeleted != true
                        ).ToList();
                    studentClassroomIDs.AddRange(studentClassroomSubjects.Select(s => s.StudentClassroomID)); 
                }
            }

            studentClassroomIDs = studentClassroomIDs.Distinct().ToList();
            var assignmentIDs = assignments.Select(d => d.ID).ToHashSet();
               
            List<AssignmentStudent> assignmentStudents = unitOfWork.assignmentStudent_Repository.FindBy(
                d => studentClassroomIDs.Contains(d.StudentClassroomID) &&
                assignmentIDs.Contains(d.AssignmentID) && 
                d.IsDeleted != true &&
                d.StudentClassroom.IsDeleted != true && d.StudentClassroom.Classroom.IsDeleted != true && d.StudentClassroom.Student.IsDeleted != true && 
                d.Assignment.IsDeleted != true 
                ).ToList();

            int totalStudentsNotAnswered = studentClassroomIDs.Where(d => !assignmentStudents.Select(s => s.StudentClassroomID).Contains(d)).Count();
            int totalStudentsAnsweredAtTheSpecificDate = 0;
            int totalStudentsAnsweredAfterTheDueDate = 0;

            foreach (var assignmentStudent in assignmentStudents)
            {
                Assignment assignment = assignments.FirstOrDefault(d => d.ID == assignmentStudent.AssignmentID);

                if (assignment == null || assignmentStudent.InsertedAt == null)
                    continue;

                var insertedDateOnly = DateOnly.FromDateTime(assignmentStudent.InsertedAt.Value);

                if (insertedDateOnly >= assignment.OpenDate && insertedDateOnly <= assignment.DueDate)
                {
                    totalStudentsAnsweredAtTheSpecificDate++;
                }
                else if (insertedDateOnly > assignment.DueDate && insertedDateOnly <= assignment.CutOfDate)
                {
                    totalStudentsAnsweredAfterTheDueDate++;
                } 
            }

            return (totalStudentsNotAnswered, totalStudentsAnsweredAtTheSpecificDate, totalStudentsAnsweredAfterTheDueDate);
        }
    }
}
