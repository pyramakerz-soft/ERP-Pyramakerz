using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ConnectionStatusController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;

        public ConnectionStatusController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper; 
        }

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult Get()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<ConnectionStatus> connectionStatuses = Unit_Of_Work.connectionStatus_Repository.Select_All();

            if (connectionStatuses == null || connectionStatuses.Count == 0)
            {
                return NotFound();
            }

            List<ConnectionStatusGetDTO> connectionStatusesGetDTO = mapper.Map<List<ConnectionStatusGetDTO>>(connectionStatuses);

            return Ok(connectionStatusesGetDTO);
        }

        [HttpGet("GetUserState")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult GetUserState()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            long? connectionStatusID = 0;

            switch (userTypeID)
            {
                case 1:
                    Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (employee == null)
                    {
                        return NotFound("No Employee with this ID");
                    }
                    connectionStatusID = employee.ConnectionStatusID;
                    break;

                case 2:
                    Student student = Unit_Of_Work.student_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (student == null)
                    {
                        return NotFound("No Student with this ID");
                    }
                    connectionStatusID = student.ConnectionStatusID;
                    break;

                case 3:
                    Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (parent == null)
                    {
                        return NotFound("No Parent with this ID");
                    }
                    connectionStatusID = parent.ConnectionStatusID;
                    break;

                default:
                    throw new ArgumentException("Invalid user type ID");
            }

            ConnectionStatus connectionStatus = Unit_Of_Work.connectionStatus_Repository.Select_By_Id(connectionStatusID);

            ConnectionStatusGetDTO connectionStatusGetDTO = mapper.Map<ConnectionStatusGetDTO>(connectionStatus);

            return Ok(connectionStatusGetDTO);
        }

        [HttpGet("ChangeConnectionStatus/{stateID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ChangeConnectionStatus(long stateID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            ConnectionStatus connectionStatus = Unit_Of_Work.connectionStatus_Repository.Select_By_Id(stateID);
            if (connectionStatus == null)
            {
                return NotFound("No Connection Status with this ID");
            }

            switch (userTypeID)
            {
                case 1:
                    Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (employee == null)
                    {
                        return NotFound("No Employee with this ID");
                    }
                    employee.ConnectionStatusID = connectionStatus.ID;
                    Unit_Of_Work.employee_Repository.Update(employee);
                    break;

                case 2:
                    Student student = Unit_Of_Work.student_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (student == null)
                    {
                        return NotFound("No Student with this ID");
                    }
                    student.ConnectionStatusID = connectionStatus.ID;
                    Unit_Of_Work.student_Repository.Update(student);
                    break;

                case 3:
                    Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (parent == null)
                    {
                        return NotFound("No Parent with this ID");
                    }
                    parent.ConnectionStatusID = connectionStatus.ID;
                    Unit_Of_Work.parent_Repository.Update(parent);
                    break;

                default:
                    throw new ArgumentException("Invalid user type ID");
            } 

            Unit_Of_Work.SaveChanges();

            return Ok();
        }
    }
}
