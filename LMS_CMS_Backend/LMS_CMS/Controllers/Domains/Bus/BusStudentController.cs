using AutoMapper;
using LMS_CMS_BL.DTO.Bus;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Migrations;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.AccountingModule;
using LMS_CMS_DAL.Models.Domains.BusModule;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Linq;
using System.Runtime.InteropServices.JavaScript;
using BusModel = LMS_CMS_DAL.Models.Domains.BusModule.Bus;

namespace LMS_CMS_PL.Controllers.Domains.Bus
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class BusStudentController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;

        public BusStudentController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
        }

        [HttpGet("GetByBusId/{busId}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Buses" , "Print Name Tag" }
        )]
        public async Task<IActionResult> GetByBusID(long busId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<BusStudent> busStudents;

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            BusModel bus = Unit_Of_Work.bus_Repository.Select_By_Id(busId);
            if (bus == null)
            {
                return NotFound("No Bus with this Id");
            }

            busStudents = await Unit_Of_Work.busStudent_Repository.Select_All_With_IncludesById<BusStudent>(
                bus => bus.BusID == busId && bus.IsDeleted != true && bus.Student.IsDeleted != true && bus.Bus.IsDeleted != true,
                query => query.Include(bus => bus.Bus),
                query => query.Include(stu => stu.Student),
                query => query.Include(busCat => busCat.BusCategory),
                query => query.Include(sem => sem.Semester).ThenInclude(st => st.AcademicYear).ThenInclude(st => st.School)
            );

            if (busStudents == null || busStudents.Count == 0)
            {
                return NotFound();
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            DateTime currentDateTime = TimeZoneInfo.ConvertTime(DateTime.UtcNow, cairoZone);
            string todayString = currentDateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

            foreach (var busStudent in busStudents)
            {
                if (busStudent.IsException == true)
                {
                    if (!string.IsNullOrEmpty(busStudent.ExceptionFromDate) && !string.IsNullOrEmpty(busStudent.ExceptionToDate))
                    {
                        if (string.Compare(busStudent.ExceptionToDate, todayString) < 0)
                        {
                            busStudent.IsDeleted = true;
                            busStudent.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                            Unit_Of_Work.busStudent_Repository.Update(busStudent);
                        }
                    }
                }
            }
            Unit_Of_Work.SaveChanges();

            busStudents = busStudents.Where(bs => bs.IsDeleted != true).ToList();

            List<BusStudentGetDTO> busStudentDTOs = mapper.Map<List<BusStudentGetDTO>>(busStudents);

            foreach (var dto in busStudentDTOs)
            {
                var busStudent = Unit_Of_Work.busStudent_Repository.Select_By_Id(dto.ID);
                if (busStudent != null)
                {
                    Semester semester = Unit_Of_Work.semester_Repository.First_Or_Default(s => s.ID == dto.SemseterID);

                    //var studentAcademicYear = Unit_Of_Work.studentAcademicYear_Repository
                    //    .Last_Or_Default(s => s.StudentID == busStudent.StudentID && s.SchoolID == dto.SchoolID && s.IsDeleted != true &&
                    //    s.Classroom.AcademicYearID == semester.AcademicYearID,
                    //    s => s.ID);

                    //if (studentAcademicYear != null)
                    //{
                    //    dto.GradeID = studentAcademicYear.GradeID;
                    //    var grade = Unit_Of_Work.grade_Repository.Select_By_Id(dto.GradeID);
                    //    dto.GradeName = grade.Name;

                    //    dto.SectionID = grade.SectionID;
                    //    var section = Unit_Of_Work.section_Repository.Select_By_Id(dto.SectionID);
                    //    dto.SectionName = section.Name;

                    //    dto.ClassID = studentAcademicYear.ClassID;
                    //    var classs = Unit_Of_Work.classroom_Repository.Select_By_Id(dto.ClassID);
                    //    dto.ClassName = classs.Name;
                    //}

                    var studentGrade = Unit_Of_Work.studentGrade_Repository
                        .Last_Or_Default(s => s.StudentID == busStudent.StudentID && s.IsDeleted != true &&
                        s.AcademicYearID == semester.AcademicYearID,
                        s => s.ID);

                    var studentClass = Unit_Of_Work.studentClassroom_Repository
                        .Last_Or_Default(s => s.StudentID == busStudent.StudentID && s.IsDeleted != true &&
                        s.Classroom.AcademicYearID == semester.AcademicYearID,
                        s => s.ID);

                    if (studentGrade != null)
                    {
                        dto.GradeID = studentGrade.GradeID;
                        var grade = Unit_Of_Work.grade_Repository.Select_By_Id(dto.GradeID);
                        dto.GradeName = grade.Name;

                        dto.SectionID = grade.SectionID;
                        var section = Unit_Of_Work.section_Repository.Select_By_Id(dto.SectionID);
                        dto.SectionName = section.Name;
                    }

                    if (studentClass != null)
                    { 
                        dto.ClassID = studentClass.ClassID;
                        var classroom = Unit_Of_Work.classroom_Repository.Select_By_Id(dto.ClassID);
                        dto.ClassName = classroom.Name;
                    }
                }
            }

            return Ok(busStudentDTOs);
        }


        [HttpGet("{Id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Buses" }
        )]
        public async Task<IActionResult> GetByID(long Id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (Id == 0)
            {
                return BadRequest("Enter Bus Student ID");
            }

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            var busStudent = await Unit_Of_Work.busStudent_Repository.FindByIncludesAsync(
                busStu => busStu.ID == Id && busStu.IsDeleted != true,
                query => query.Include(bus => bus.Bus),
                query => query.Include(stu => stu.Student),
                query => query.Include(busCat => busCat.BusCategory),
                query => query.Include(sem => sem.Semester).ThenInclude(st => st.AcademicYear).ThenInclude(st => st.School)
            );

            if (busStudent == null || busStudent.IsDeleted == true)
            {
                return NotFound("No bus Student with this ID");
            }

            BusStudentGetDTO busStudentDTO = mapper.Map<BusStudentGetDTO>(busStudent);
            Semester semester = Unit_Of_Work.semester_Repository.First_Or_Default(s => s.ID == busStudentDTO.SemseterID);

            //var studentAcademicYear = Unit_Of_Work.studentAcademicYear_Repository
            //        .Last_Or_Default(s => s.StudentID == busStudent.StudentID && s.SchoolID == busStudentDTO.SchoolID && s.IsDeleted != true &&
            //        s.Classroom.AcademicYearID == semester.AcademicYearID,
            //        s => s.ID);

            //if (studentAcademicYear != null)
            //{
            //    busStudentDTO.GradeID = studentAcademicYear.GradeID;
            //    var grade = Unit_Of_Work.grade_Repository.Select_By_Id(busStudentDTO.GradeID);
            //    busStudentDTO.GradeName = grade.Name;

            //    busStudentDTO.SectionID = grade.SectionID;
            //    var section = Unit_Of_Work.section_Repository.Select_By_Id(busStudentDTO.SectionID);
            //    busStudentDTO.SectionName = section.Name;

            //    busStudentDTO.ClassID = studentAcademicYear.ClassID;
            //    var classs = Unit_Of_Work.classroom_Repository.Select_By_Id(busStudentDTO.ClassID);
            //    busStudentDTO.ClassName = classs.Name;
            //}


            var studentGrade = Unit_Of_Work.studentGrade_Repository
                .Last_Or_Default(s => s.StudentID == busStudent.StudentID && s.IsDeleted != true &&
                s.AcademicYearID == semester.AcademicYearID,
                s => s.ID);

            var studentClass = Unit_Of_Work.studentClassroom_Repository
                .Last_Or_Default(s => s.StudentID == busStudent.StudentID && s.IsDeleted != true &&
                s.Classroom.AcademicYearID == semester.AcademicYearID,
                s => s.ID);

            if (studentGrade != null)
            {
                busStudentDTO.AcademicYearID = studentGrade.AcademicYearID;
                busStudentDTO.GradeID = studentGrade.GradeID;
                var grade = Unit_Of_Work.grade_Repository.Select_By_Id(busStudentDTO.GradeID);
                busStudentDTO.GradeName = grade.Name;

                busStudentDTO.SectionID = grade.SectionID;
                var section = Unit_Of_Work.section_Repository.Select_By_Id(busStudentDTO.SectionID);
                busStudentDTO.SectionName = section.Name;
            }

            if (studentClass != null)
            {
                busStudentDTO.ClassID = studentClass.ClassID;
                var classroom = Unit_Of_Work.classroom_Repository.Select_By_Id(busStudentDTO.ClassID);
                busStudentDTO.ClassName = classroom.Name;
            }

            return Ok(busStudentDTO);
        }

        [HttpPost]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Buses" }
        )]
        public ActionResult Add(BusStudent_AddDTO busStudentAddDTO)
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

            if (busStudentAddDTO == null)
            {
                return BadRequest("Bus Student cannot be null.");
            }

            BusModel bus = Unit_Of_Work.bus_Repository.Select_By_Id(busStudentAddDTO.BusID);
            if (bus == null || bus.IsDeleted == true)
            {
                return NotFound("No Bus with this ID");
            }

            Student student = Unit_Of_Work.student_Repository.Select_By_Id(busStudentAddDTO.StudentID);
            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No Student with this ID");
            }

            if (busStudentAddDTO.SemseterID != null)
            {
                Semester semester = Unit_Of_Work.semester_Repository.Select_By_Id(busStudentAddDTO.SemseterID);
                if (semester == null || semester.IsDeleted == true)
                {
                    return NotFound("No Semester with this ID");
                }
            }

            if (busStudentAddDTO.BusCategoryID != null)
            {
                BusCategory busCategory = Unit_Of_Work.busCategory_Repository.Select_By_Id(busStudentAddDTO.BusCategoryID);
                if (busCategory == null || busCategory.IsDeleted == true)
                {
                    return NotFound("No Bus Category with this ID");
                }
            }

            BusStudent busStudedntExists = Unit_Of_Work.busStudent_Repository.First_Or_Default( 
                d => d.IsDeleted != true && d.StudentID == busStudentAddDTO.StudentID && d.BusID == busStudentAddDTO.BusID && d.SemseterID == busStudentAddDTO.SemseterID
                );

            if (busStudedntExists != null)
            {
                return BadRequest("Student Already Exists In This Bus For This Semester");
            }

            // Check Capacity Per Semester
            if(bus.IsCapacityRestricted == true)
            {
                List<BusStudent> busStudents = Unit_Of_Work.busStudent_Repository.FindBy(
                    b => b.SemseterID == busStudentAddDTO.SemseterID && b.IsDeleted != true && b.BusID == busStudentAddDTO.BusID
                    );

                if(busStudents.Count >= bus.Capacity)
                {
                    return BadRequest("You Exceeded bus Capacity for this Semester");
                }
            }

            BusStudent busStudent = mapper.Map<BusStudent>(busStudentAddDTO);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            busStudent.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                busStudent.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                busStudent.InsertedByUserId = userId;
            }

            Unit_Of_Work.busStudent_Repository.Add(busStudent);
            Unit_Of_Work.SaveChanges();

            return CreatedAtAction(nameof(GetByID), new { Id = bus.ID }, busStudentAddDTO);
        }

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Buses" }
        )]
        public IActionResult Edit(BusStudent_PutDTO busStudentPutDTO)
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

            if (busStudentPutDTO == null)
            {
                return BadRequest("Bus Student cannot be null.");
            }

            BusModel bus = Unit_Of_Work.bus_Repository.Select_By_Id(busStudentPutDTO.BusID);
            if (bus == null || bus.IsDeleted == true)
            {
                return NotFound("No Bus with this ID");
            }

            Student student = Unit_Of_Work.student_Repository.Select_By_Id(busStudentPutDTO.StudentID);
            if (student == null || student.IsDeleted == true)
            {
                return NotFound("No Student with this ID");
            }

            if (busStudentPutDTO.SemseterID != null)
            {
                Semester semester = Unit_Of_Work.semester_Repository.Select_By_Id(busStudentPutDTO.SemseterID);
                if (semester == null || semester.IsDeleted == true)
                {
                    return NotFound("No Semester with this ID");
                }
            }

            if (busStudentPutDTO.BusCategoryID != null)
            {
                BusCategory busCategory = Unit_Of_Work.busCategory_Repository.Select_By_Id(busStudentPutDTO.BusCategoryID);
                if (busCategory == null || busCategory.IsDeleted == true)
                {
                    return NotFound("No Bus Category with this ID");
                }
            }

            BusStudent busStudentExists = Unit_Of_Work.busStudent_Repository.Select_By_Id(busStudentPutDTO.ID);
            if (busStudentExists == null || busStudentExists.IsDeleted == true)
            {
                return NotFound("No Bus Student with this ID");
            } 

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Buses", roleId, userId, busStudentExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            BusStudent whatWeWantToTransferTo = Unit_Of_Work.busStudent_Repository.First_Or_Default(
                d => d.IsDeleted != true && d.StudentID == busStudentPutDTO.StudentID && d.BusID == busStudentPutDTO.BusID && d.ID != busStudentPutDTO.ID && d.SemseterID == busStudentPutDTO.SemseterID
                );

            if(whatWeWantToTransferTo != null)
            { 
                return BadRequest("Student Already Exists In This Bus For This Semester");
            }

            // Check Capacity Per Semester
            if (bus.IsCapacityRestricted == true)
            {
                List<BusStudent> busStudents = Unit_Of_Work.busStudent_Repository.FindBy(
                    b => b.SemseterID == busStudentPutDTO.SemseterID && b.IsDeleted != true && b.BusID == busStudentPutDTO.BusID && b.ID != busStudentPutDTO.ID
                    );

                if (busStudents.Count >= bus.Capacity)
                {
                    return BadRequest("You Exceeded bus Capacity for this Semester");
                }
            }

            mapper.Map(busStudentPutDTO, busStudentExists);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            busStudentExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                busStudentExists.UpdatedByOctaId = userId;
                if (busStudentExists.UpdatedByUserId != null)
                {
                    busStudentExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                busStudentExists.UpdatedByUserId = userId;
                if (busStudentExists.UpdatedByOctaId != null)
                {
                    busStudentExists.UpdatedByOctaId = null;
                }
            }
            Unit_Of_Work.busStudent_Repository.Update(busStudentExists);
            Unit_Of_Work.SaveChanges();

            return Ok(busStudentPutDTO);
        }

        [HttpDelete("{Id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Buses" }
        )]
        public IActionResult Delete(long Id)
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

            if (Id == 0)
            {
                return BadRequest("Bus Student ID cannot be null.");
            }

            BusStudent busStudent = Unit_Of_Work.busStudent_Repository.Select_By_Id(Id);
            if (busStudent == null)
            {
                return NotFound();
            }
            else
            { 
                if (userTypeClaim == "employee")
                {
                    IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Buses", roleId, userId, busStudent);
                    if (accessCheck != null)
                    {
                        return accessCheck;
                    }
                }

                busStudent.IsDeleted = true;
                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                busStudent.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    busStudent.DeletedByOctaId = userId;
                    if (busStudent.DeletedByUserId != null)
                    {
                        busStudent.DeletedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    busStudent.DeletedByUserId = userId;
                    if (busStudent.DeletedByOctaId != null)
                    {
                        busStudent.DeletedByOctaId = null;
                    }
                }
                Unit_Of_Work.busStudent_Repository.Update(busStudent);
                Unit_Of_Work.SaveChanges();
                return Ok(new { message = "Bus Student has Successfully been deleted" });
            }
        }


    }
}
