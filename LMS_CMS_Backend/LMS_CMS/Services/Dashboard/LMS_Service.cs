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

            int totalStudentsNotAnswered = 0;
            int totalStudentsAnsweredAtTheSpecificDate = 0;
            int totalStudentsAnsweredAfterTheDueDate = 0;

            foreach (var assignment in assignments)
            {
                if (assignment.IsSpecificStudents)
                {
                    List<AssignmentStudentIsSpecific> studentIsSpecifics = unitOfWork.assignmentStudentIsSpecific_Repository.FindBy(
                        d => d.IsDeleted != true && d.AssignmentID == assignment.ID &&
                        d.StudentClassroom.IsDeleted != true && d.StudentClassroom.Classroom.IsDeleted != true && d.StudentClassroom.Student.IsDeleted != true
                        ).ToList();

                    foreach (var studentIsSpecific in studentIsSpecifics)
                    {
                        AssignmentStudent assignmentStudent = unitOfWork.assignmentStudent_Repository.First_Or_Default(
                            d => d.IsDeleted != true && d.AssignmentID == assignment.ID && d.StudentClassroomID == studentIsSpecific.StudentClassroomID
                            && d.StudentClassroom.Classroom.IsDeleted != true && d.StudentClassroom.Student.IsDeleted != true
                            );

                        if (assignmentStudent == null)
                        {
                            totalStudentsNotAnswered++;
                        }
                        else
                        {
                            var insertedDateOnly = DateOnly.FromDateTime(assignmentStudent.InsertedAt.Value);
                            if (insertedDateOnly >= assignment.OpenDate && insertedDateOnly <= assignment.DueDate)
                            {
                                totalStudentsAnsweredAtTheSpecificDate++;
                            }
                            else if (insertedDateOnly > assignment.DueDate && insertedDateOnly <= assignment.CutOfDate)
                            {
                                totalStudentsAnsweredAfterTheDueDate++;
                            }
                            else
                            {
                                totalStudentsNotAnswered++;
                            }
                        }
                    }
                }
                else
                {
                    List<StudentClassroomSubject> studentClassroomSubjects = unitOfWork.studentClassroomSubject_Repository.FindBy(
                        d => d.SubjectID == assignment.SubjectID && d.IsDeleted != true && !d.Hide &&
                        d.StudentClassroom.IsDeleted != true && d.StudentClassroom.Classroom.IsDeleted != true && d.StudentClassroom.Student.IsDeleted != true
                        ).ToList();

                    foreach (var studentClassroomSubject in studentClassroomSubjects)
                    {
                        AssignmentStudent assignmentStudent = unitOfWork.assignmentStudent_Repository.First_Or_Default(
                            d => d.IsDeleted != true && d.AssignmentID == assignment.ID && d.StudentClassroomID == studentClassroomSubject.StudentClassroomID
                            && d.StudentClassroom.Classroom.IsDeleted != true && d.StudentClassroom.Student.IsDeleted != true
                            );

                        if (assignmentStudent == null)
                        {
                            totalStudentsNotAnswered++;
                        }
                        else
                        {
                            var insertedDateOnly = DateOnly.FromDateTime(assignmentStudent.InsertedAt.Value);
                            if (insertedDateOnly >= assignment.OpenDate && insertedDateOnly <= assignment.DueDate)
                            {
                                totalStudentsAnsweredAtTheSpecificDate++;
                            }
                            else if (insertedDateOnly > assignment.DueDate && insertedDateOnly <= assignment.CutOfDate)
                            {
                                totalStudentsAnsweredAfterTheDueDate++;
                            }
                            else
                            {
                                totalStudentsNotAnswered++;
                            }
                        }
                    }
                }
            }

            return (totalStudentsNotAnswered, totalStudentsAnsweredAtTheSpecificDate, totalStudentsAnsweredAfterTheDueDate);
        }

        public int StudentCount(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            List<long> academicYearIds = unitOfWork.academicYear_Repository.FindBy(d => d.IsDeleted != true && d.School.IsDeleted != true &&
                    d.DateFrom.Year == year &&
                    (month == null || d.DateFrom.Month == month)
                    )
                .Select(d => d.ID)
                .ToList();

            if (!academicYearIds.Any())
                return 0;

            List<long> classroomIds = unitOfWork.classroom_Repository
              .FindBy(c => c.IsDeleted != true && academicYearIds.Contains(c.AcademicYearID))
              .Select(c => c.ID)
              .ToList();
             
            if (!classroomIds.Any())
                return 0;

            int totalStudents = unitOfWork.studentClassroom_Repository
                .FindBy(sc => sc.IsDeleted != true && sc.Student.IsDeleted != true &&
                              classroomIds.Contains(sc.ClassID))
                .Count;
             
            return (totalStudents);
        }

        public int ClassroomCount(int year, int? month, HttpContext httpContext)
        {
            var unitOfWork = _dbContextFactory.CreateOneDbContext(httpContext);

            List<long> academicYearIds = unitOfWork.academicYear_Repository.FindBy(d => d.IsDeleted != true && d.School.IsDeleted != true &&
                    d.DateFrom.Year == year &&
                    (month == null || d.DateFrom.Month == month)
                    )
                .Select(d => d.ID)
                .ToList();

            if (!academicYearIds.Any())
                return 0;
             
            int totalClasses = unitOfWork.classroom_Repository
                .FindBy(c => c.IsDeleted != true && academicYearIds.Contains(c.AcademicYearID))
                .Count;
             
            return (totalClasses);
        }
    }
}
