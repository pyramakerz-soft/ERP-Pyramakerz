using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Services
{
    public class ValidTeachersForStudentService
    {
        public async Task<List<long>> GetValidTeacherIdsForStudent(long studentId, UOW Unit_Of_Work)
        {
            List<long> teacherIDs = new List<long>();

            // Get student current grade
            StudentGrade studentGrade = Unit_Of_Work.studentGrade_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.Grade.IsDeleted != true && d.Grade.Section.IsDeleted != true && d.AcademicYear.IsDeleted != true && d.AcademicYear.School.IsDeleted != true
                && d.AcademicYear.IsActive == true && d.StudentID == studentId);

            if (studentGrade != null)
            {
                // Get his classroom
                StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(
                    d => d.IsDeleted != true && d.Classroom.IsDeleted != true && d.Classroom.AcademicYear.IsDeleted != true && d.Classroom.AcademicYear.IsActive == true
                    && d.StudentID == studentId && d.Classroom.GradeID == studentGrade.GradeID);

                if (studentClassroom != null)
                {
                    // Get His subjects
                    List<StudentClassroomSubject> studentClassroomSubjects = Unit_Of_Work.studentClassroomSubject_Repository.FindBy(
                        d => d.IsDeleted != true && d.StudentClassroomID == studentClassroom.ID && d.Subject.IsDeleted != true && d.Hide == false);

                    if (studentClassroomSubjects != null && studentClassroomSubjects.Count > 0)
                    {
                        List<long> subjectIDs = studentClassroomSubjects.Select(y => y.SubjectID).ToList();

                        // Get his class subjects 
                        List<ClassroomSubject> classroomSubjects = Unit_Of_Work.classroomSubject_Repository.FindBy(
                            d => d.ClassroomID == studentClassroom.ClassID && subjectIDs.Contains(d.SubjectID) && d.IsDeleted != true && d.Hide == false && d.TeacherID != null && d.Teacher.IsDeleted != true
                            );

                        if (classroomSubjects != null && classroomSubjects.Count > 0)
                        {
                            teacherIDs = classroomSubjects.Where(cs => cs.TeacherID != null).Select(y => y.TeacherID.Value).ToList();

                            foreach (var item in classroomSubjects)
                            {
                                List<ClassroomSubjectCoTeacher> classroomSubjectCoTeachers = Unit_Of_Work.classroomSubjectCoTeacher_Repository.FindBy(
                                d => d.ClassroomSubjectID == item.ID && d.IsDeleted != true && d.CoTeacher.IsDeleted != true
                                );
                                if (classroomSubjectCoTeachers != null && classroomSubjectCoTeachers.Count != 0)
                                {
                                    teacherIDs.AddRange(classroomSubjectCoTeachers.Select(ct => ct.CoTeacherID));
                                }
                            }
                        }
                    }
                }
            }

            List<RemedialClassroomStudent> remedialClassroomStudents = await Unit_Of_Work.remedialClassroomStudent_Repository.Select_All_With_IncludesById<RemedialClassroomStudent>(
                d => d.IsDeleted != true && d.RemedialClassroom.IsDeleted != true && d.RemedialClassroom.Subject.IsDeleted != true && d.RemedialClassroom.AcademicYear.IsDeleted != true
                && d.RemedialClassroom.AcademicYear.School.IsDeleted != true && d.RemedialClassroom.Subject.Grade.IsDeleted != true && d.RemedialClassroom.Subject.Grade.Section.IsDeleted != true
                && d.RemedialClassroom.AcademicYear.IsActive == true && d.StudentID == studentId,
                query => query.Include(d => d.RemedialClassroom)
                );
            if (remedialClassroomStudents != null && remedialClassroomStudents.Count != 0)
            {
                teacherIDs.AddRange(remedialClassroomStudents.Select(ct => ct.RemedialClassroom.TeacherID));
            }

            return teacherIDs.Distinct().ToList();
        }
    }
}
