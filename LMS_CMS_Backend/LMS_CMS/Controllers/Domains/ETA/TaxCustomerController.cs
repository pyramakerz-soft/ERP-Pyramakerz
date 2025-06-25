using AutoMapper;
using LMS_CMS_BL.DTO.ETA;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LMS_CMS_PL.Controllers.Domains.ETA
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class TaxCustomerController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly IMapper _mapper;

        public TaxCustomerController(DbContextFactoryService dbContextFactory, IMapper mapper)
        {
            _dbContextFactory = dbContextFactory;
            _mapper = mapper;
        }

        [HttpGet("Get")]
        //[Authorize_Endpoint_(
        //    allowedTypes: new[] { "octa", "employee" },
        //    pages: new[] { "Certificate Issuer" }
        //)]
        public IActionResult Get()
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

            List<TaxCustomer> taxCustomers = Unit_Of_Work.taxCustomer_Repository.Select_All();

            if (taxCustomers.Count == 0 || taxCustomers == null)
                return NotFound("No tax customers found");

            List<TaxCustomerGetDTO> dto = _mapper.Map<List<TaxCustomerGetDTO>>(taxCustomers);

            return Ok(dto);
        }
    }
}
