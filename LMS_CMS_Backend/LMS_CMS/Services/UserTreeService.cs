using AutoMapper;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.LMS;

namespace LMS_CMS_PL.Services
{
    public class UserTreeService
    { 
        public List<long> GetUsersAccordingToTree(UOW Unit_Of_Work, long userTypeID, UserFilter? filterList)
        {  
            UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == userTypeID);
            if(userType == null)
            {
                throw new Exception("No User Type with this ID");
            } 

            if(userTypeID == 1) // employee
            {
                if(filterList != null)
                {
                    if (filterList.EmployeeID != null && filterList.EmployeeID != 0)
                    {
                        Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(e => !e.IsDeleted != true && e.ID == filterList.EmployeeID);

                        if (employee == null)
                        {
                            throw new Exception("No Employee with this ID");
                        }
                        return new List<long> { employee.ID };
                    } else if (filterList.DepartmentID != null && filterList.DepartmentID != 0)
                    {
                        Department department = Unit_Of_Work.department_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == filterList.DepartmentID);
                        if(department == null)
                        {
                            throw new Exception("No Department with this ID");
                        }
                        List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(d => d.IsDeleted != true && d.DepartmentID == filterList.DepartmentID);
                        if (employees == null || employees.Count == 0)
                        {
                            return new List<long>();
                        }
                        return employees.Select(e => e.ID).ToList();
                    }
                    else
                    {
                        List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(d => d.IsDeleted != true);
                        if (employees == null || employees.Count == 0)
                        {
                            return new List<long>();
                        }
                        return employees.Select(e => e.ID).ToList();
                    }
                }
                else
                {
                    List<Employee> employees = Unit_Of_Work.employee_Repository.FindBy(d => d.IsDeleted != true);
                    if (employees == null || employees.Count == 0)
                    {
                        return new List<long>();
                    }
                    return employees.Select(e => e.ID).ToList();
                }
            } else if (userTypeID == 2) // student
            {
                AcademicYear activeYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(y => y.IsDeleted != true && y.IsActive == true);
                if (activeYear == null)
                {
                    throw new Exception("No active academic year found");
                }

                List<long> gradeStudentIDs = Unit_Of_Work.studentGrade_Repository
                    .FindBy(gs => gs.IsDeleted != true && gs.AcademicYearID == activeYear.ID && gs.Grade.IsDeleted != true && gs.Student.IsDeleted != true)
                    .Select(gs => gs.StudentID)
                    .ToList();

                List<long> classroomStudentIDs = Unit_Of_Work.studentClassroom_Repository
                    .FindBy(cs => cs.IsDeleted != true && cs.Classroom.AcademicYearID == activeYear.ID && cs.Classroom.IsDeleted != true && cs.Student.IsDeleted != true)
                    .Select(cs => cs.StudentID)
                    .ToList();

                List<long> activeStudentIDs = gradeStudentIDs
                   .Union(classroomStudentIDs)
                   .Distinct()
                   .ToList();

                if (!activeStudentIDs.Any())
                {
                    return new List<long>();
                }

                if (filterList != null)
                { 
                    if(filterList.SchoolID != 0 && filterList.SchoolID != null)
                    {
                        School school= Unit_Of_Work.school_Repository.First_Or_Default(y => y.IsDeleted != true && y.ID == filterList.SchoolID);
                        if (school == null)
                        {
                            throw new Exception("No school found with this ID");
                        }

                        if (filterList.SectionID != 0 && filterList.SectionID != null)
                        {
                            Section section = Unit_Of_Work.section_Repository.First_Or_Default(d => d.IsDeleted != true && d.SchoolID == filterList.SchoolID && d.ID ==filterList.SectionID);
                            if (section != null)
                            {
                                if (filterList.GradeID != 0 && filterList.GradeID != null)
                                {
                                    Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(d => d.IsDeleted != true && d.SectionID == section.ID && d.ID == filterList.GradeID);

                                    if (grade != null)
                                    {
                                        List<long> students = new List<long>();
                                        if (filterList.ClassroomID != null && filterList.ClassroomID != 0)
                                        {
                                            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.ID == filterList.ClassroomID && d.AcademicYear.IsActive == true);
                                            if (classroom != null)
                                            {
                                                if(filterList.StudentID != null && filterList.StudentID != 0)
                                                {
                                                    StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(
                                                        d => d.IsDeleted != true && d.Student.IsDeleted != true && d.Classroom.IsDeleted != true &&
                                                        d.StudentID == filterList.StudentID && d.ClassID == classroom.ID);
                                                    
                                                    if(studentClassroom != null)
                                                    {
                                                        students.Add(studentClassroom.StudentID);
                                                        return students;
                                                    }
                                                    else
                                                    {
                                                        throw new Exception("No Student found with this ID In the selected Classroom");
                                                    }
                                                }
                                                else
                                                {
                                                    List<StudentClassroom> studentClassrooms = Unit_Of_Work.studentClassroom_Repository.FindBy(
                                                        d => d.IsDeleted != true && d.Student.IsDeleted != true && d.ClassID == classroom.ID);

                                                    if (studentClassrooms != null && studentClassrooms.Count != 0)
                                                    {
                                                        foreach (var item in studentClassrooms)
                                                        {
                                                            students.Add(item.StudentID);
                                                        }
                                                    }
                                                    return students;
                                                }
                                            }
                                            else
                                            {
                                                throw new Exception("No Classroom found with this ID in this Grade");
                                            }
                                        }
                                        else
                                        {
                                            List<StudentGrade> studentGrades = Unit_Of_Work.studentGrade_Repository.FindBy(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.AcademicYear.IsDeleted != true && d.AcademicYear.IsActive == true && d.Student.IsDeleted != true);

                                            if (studentGrades != null && studentGrades.Count != 0)
                                            {
                                                foreach (var item in studentGrades)
                                                {
                                                    students.Add(item.StudentID);
                                                }
                                            }
                                        }

                                        return students;
                                    }
                                    else
                                    {
                                        throw new Exception("No Grade found with this ID in this Section");
                                    }
                                }
                                else
                                {
                                    List<long> students = new List<long>();

                                    List<Grade> grades = Unit_Of_Work.grade_Repository.FindBy(d => d.IsDeleted != true && d.SectionID == section.ID);
                                    if (grades != null && grades.Count != 0)
                                    {
                                        foreach (Grade grade in grades)
                                        {
                                            List<StudentGrade> studentGrades = Unit_Of_Work.studentGrade_Repository.FindBy(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.AcademicYear.IsDeleted != true && d.AcademicYear.IsActive == true && d.Student.IsDeleted != true);

                                            if (studentGrades != null && studentGrades.Count != 0)
                                            {
                                                foreach (var item in studentGrades)
                                                {
                                                    students.Add(item.StudentID);
                                                }
                                            }
                                        }

                                        return students;
                                    }
                                    else
                                    {
                                        return new List<long>();
                                    }
                                }
                            }
                            else
                            {
                                throw new Exception("No Section found with this ID In this School");
                            }
                        }
                        else
                        {
                            List<Section> sections = Unit_Of_Work.section_Repository.FindBy(d => d.IsDeleted != true && d.SchoolID == filterList.SchoolID);
                            if(sections != null && sections.Count != 0)
                            {
                                List<long> students = new List<long>();

                                foreach (Section section in sections)
                                {
                                    List<Grade> grades = Unit_Of_Work.grade_Repository.FindBy(d => d.IsDeleted != true && d.SectionID == section.ID);
                                    if (grades != null && grades.Count != 0)
                                    {
                                        foreach (Grade grade in grades)
                                        {
                                            List<StudentGrade> studentGrades = Unit_Of_Work.studentGrade_Repository.FindBy(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.AcademicYear.IsDeleted != true && d.AcademicYear.IsActive == true && d.Student.IsDeleted != true);

                                            if(studentGrades != null && studentGrades.Count != 0)
                                            {
                                                foreach (var item in studentGrades)
                                                {
                                                    students.Add(item.StudentID);
                                                }
                                            }
                                        }
                                    }  
                                }
                                return students;
                            }
                            else
                            {
                                return new List<long>();
                            }
                        }
                    }
                    else
                    {
                        return activeStudentIDs;
                    }
                }
                else
                { 
                    return activeStudentIDs; 
                }
            } else if (userTypeID == 3) // parent
            {
                AcademicYear activeYear = Unit_Of_Work.academicYear_Repository.First_Or_Default(y => y.IsDeleted != true && y.IsActive == true);
                if (activeYear == null)
                {
                    throw new Exception("No active academic year found");
                }

                List<long> gradeStudentIDs = Unit_Of_Work.studentGrade_Repository
                    .FindBy(gs => gs.IsDeleted != true && gs.AcademicYearID == activeYear.ID && gs.Grade.IsDeleted != true && gs.Student.IsDeleted != true)
                    .Select(gs => gs.StudentID)
                    .ToList();

                List<long> classroomStudentIDs = Unit_Of_Work.studentClassroom_Repository
                    .FindBy(cs => cs.IsDeleted != true && cs.Classroom.AcademicYearID == activeYear.ID && cs.Classroom.IsDeleted != true && cs.Student.IsDeleted != true)
                    .Select(cs => cs.StudentID)
                    .ToList();

                List<long> activeStudentIDs = gradeStudentIDs
                   .Union(classroomStudentIDs)
                   .Distinct()
                   .ToList();

                List<long> activeParentIDs = Unit_Of_Work.student_Repository
                    .FindBy(s => activeStudentIDs.Contains(s.ID) && s.IsDeleted != true && s.Parent_Id != null)
                    .Select(s => s.Parent_Id.Value)
                    .Distinct()
                    .ToList();

                if (!activeParentIDs.Any())
                {
                    return new List<long>();
                }

                if (filterList != null)
                {
                    if (filterList.SchoolID != 0 && filterList.SchoolID != null)
                    {
                        School school = Unit_Of_Work.school_Repository.First_Or_Default(y => y.IsDeleted != true && y.ID == filterList.SchoolID);
                        if (school == null)
                        {
                            throw new Exception("No school found with this ID");
                        }

                        if (filterList.SectionID != 0 && filterList.SectionID != null)
                        {
                            Section section = Unit_Of_Work.section_Repository.First_Or_Default(d => d.IsDeleted != true && d.SchoolID == filterList.SchoolID && d.ID == filterList.SectionID);
                            if (section != null)
                            {
                                if (filterList.GradeID != 0 && filterList.GradeID != null)
                                {
                                    Grade grade = Unit_Of_Work.grade_Repository.First_Or_Default(d => d.IsDeleted != true && d.SectionID == section.ID && d.ID == filterList.GradeID);

                                    if (grade != null)
                                    {
                                        List<long> students = new List<long>();
                                        if (filterList.ClassroomID != null && filterList.ClassroomID != 0)
                                        {
                                            Classroom classroom = Unit_Of_Work.classroom_Repository.First_Or_Default(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.ID == filterList.ClassroomID && d.AcademicYear.IsActive == true);
                                            if (classroom != null)
                                            {
                                                if (filterList.StudentID != null && filterList.StudentID != 0)
                                                {
                                                    StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(
                                                        d => d.IsDeleted != true && d.Student.IsDeleted != true && d.Classroom.IsDeleted != true &&
                                                        d.StudentID == filterList.StudentID && d.ClassID == classroom.ID);

                                                    if (studentClassroom != null)
                                                    {
                                                        students.Add(studentClassroom.StudentID);
                                                            
                                                        List<long> parentIds = Unit_Of_Work.student_Repository
                                                        .FindBy(s => students.Contains(s.ID) && s.IsDeleted != true && s.Parent_Id != null)
                                                        .Select(s => s.Parent_Id.Value)
                                                        .Distinct()
                                                        .ToList();

                                                        return parentIds; 
                                                    }
                                                    else
                                                    {
                                                        throw new Exception("No Student found with this ID In the selected Classroom");
                                                    }
                                                }
                                                else
                                                {
                                                    List<StudentClassroom> studentClassrooms = Unit_Of_Work.studentClassroom_Repository.FindBy(
                                                        d => d.IsDeleted != true && d.Student.IsDeleted != true && d.ClassID == classroom.ID);

                                                    if (studentClassrooms != null && studentClassrooms.Count != 0)
                                                    {
                                                        foreach (var item in studentClassrooms)
                                                        {
                                                            students.Add(item.StudentID);
                                                        }
                                                    } 

                                                    List<long> parentIds = Unit_Of_Work.student_Repository
                                                        .FindBy(s => students.Contains(s.ID) && s.IsDeleted != true && s.Parent_Id != null)
                                                        .Select(s => s.Parent_Id.Value)
                                                        .Distinct()
                                                        .ToList();

                                                    return parentIds;
                                                }
                                            }
                                            else
                                            {
                                                throw new Exception("No Classroom found with this ID in this Grade");
                                            }
                                        }
                                        else
                                        {
                                            List<StudentGrade> studentGrades = Unit_Of_Work.studentGrade_Repository.FindBy(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.AcademicYear.IsDeleted != true && d.AcademicYear.IsActive == true && d.Student.IsDeleted != true);

                                            if (studentGrades != null && studentGrades.Count != 0)
                                            {
                                                foreach (var item in studentGrades)
                                                {
                                                    students.Add(item.StudentID);
                                                }
                                            }
                                        }

                                        List<long> parentIDs = Unit_Of_Work.student_Repository
                                            .FindBy(s => students.Contains(s.ID) && s.IsDeleted != true && s.Parent_Id != null)
                                            .Select(s => s.Parent_Id.Value)
                                            .Distinct()
                                            .ToList();

                                        return parentIDs; 
                                    }
                                    else
                                    {
                                        throw new Exception("No Grade found with this ID in this Section");
                                    }
                                }
                                else
                                {
                                    List<long> students = new List<long>();

                                    List<Grade> grades = Unit_Of_Work.grade_Repository.FindBy(d => d.IsDeleted != true && d.SectionID == section.ID);
                                    if (grades != null && grades.Count != 0)
                                    {
                                        foreach (Grade grade in grades)
                                        {
                                            List<StudentGrade> studentGrades = Unit_Of_Work.studentGrade_Repository.FindBy(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.AcademicYear.IsDeleted != true && d.AcademicYear.IsActive == true && d.Student.IsDeleted != true);

                                            if (studentGrades != null && studentGrades.Count != 0)
                                            {
                                                foreach (var item in studentGrades)
                                                {
                                                    students.Add(item.StudentID);
                                                }
                                            }
                                        }

                                        List<long> parentIDs = Unit_Of_Work.student_Repository
                                            .FindBy(s => students.Contains(s.ID) && s.IsDeleted != true && s.Parent_Id != null)
                                            .Select(s => s.Parent_Id.Value)
                                            .Distinct()
                                            .ToList();
                                        return parentIDs;
                                    }
                                    else
                                    {
                                        return new List<long>();
                                    }
                                }
                            }
                            else
                            {
                                throw new Exception("No Section found with this ID In this School");
                            }
                        }
                        else
                        {
                            List<Section> sections = Unit_Of_Work.section_Repository.FindBy(d => d.IsDeleted != true && d.SchoolID == filterList.SchoolID);
                            if (sections != null && sections.Count != 0)
                            {
                                List<long> students = new List<long>();

                                foreach (Section section in sections)
                                {
                                    List<Grade> grades = Unit_Of_Work.grade_Repository.FindBy(d => d.IsDeleted != true && d.SectionID == section.ID);
                                    if (grades != null && grades.Count != 0)
                                    {
                                        foreach (Grade grade in grades)
                                        {
                                            List<StudentGrade> studentGrades = Unit_Of_Work.studentGrade_Repository.FindBy(
                                                d => d.IsDeleted != true && d.GradeID == grade.ID && d.AcademicYear.IsDeleted != true && d.AcademicYear.IsActive == true && d.Student.IsDeleted != true);

                                            if (studentGrades != null && studentGrades.Count != 0)
                                            {
                                                foreach (var item in studentGrades)
                                                {
                                                    students.Add(item.StudentID);
                                                }
                                            }
                                        }
                                    }
                                }
                                List<long> parentIDs = Unit_Of_Work.student_Repository
                                    .FindBy(s => students.Contains(s.ID) && s.IsDeleted != true && s.Parent_Id != null)
                                    .Select(s => s.Parent_Id.Value)
                                    .Distinct()
                                    .ToList();
                                return parentIDs;
                            }
                            else
                            {
                                return new List<long>();
                            }
                        }
                    }
                    else
                    {
                        return activeParentIDs;
                    } 
                }
                else
                {
                    return activeParentIDs;
                }
            } 

            return new List<long>();
        }
    }
}
