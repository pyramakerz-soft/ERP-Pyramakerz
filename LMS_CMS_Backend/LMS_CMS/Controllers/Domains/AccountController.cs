using AutoMapper;
using LMS_CMS_BL.DTO;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LMS_CMS_PL.Controllers.Domains
{

    [Route("api/with-domain/[controller]")]
    [ApiController]
    public class AccountController : Controller
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly GenerateJWTService _generateJWT;
        private readonly UOW _Unit_Of_Work_Octa;

        public AccountController(DbContextFactoryService dbContextFactory, UOW unit_Of_Work_Octa, GenerateJWTService generateJWT)
        {
            _dbContextFactory = dbContextFactory;
            _Unit_Of_Work_Octa = unit_Of_Work_Octa;
            _generateJWT = generateJWT;
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginDTO UserInfo)
        { 
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (UserInfo == null)
            {
                return BadRequest("Data Can't be null");
            }
            if (UserInfo.Type == null || !new[] { "employee", "student", "parent" }.Contains(UserInfo.Type.ToLower()))
            {
                return BadRequest("Invalid user type.");
            }
            if (UserInfo.User_Name.Length == 0)
            {
                return BadRequest("User_Name Can't be null");
            }
            if (UserInfo.Password.Length == 0)
            {
                return BadRequest("Password Can't be null");
            }

            dynamic user = UserInfo.Type switch
            {
                "employee" => Unit_Of_Work.employee_Repository.First_Or_Default(emp => emp.User_Name == UserInfo.User_Name && emp.IsDeleted != true),
                "student" => Unit_Of_Work.student_Repository.First_Or_Default(stu => stu.User_Name == UserInfo.User_Name && stu.IsDeleted != true),
                "parent" => Unit_Of_Work.parent_Repository.First_Or_Default(par => par.User_Name == UserInfo.User_Name && par.IsDeleted != true),
                _ => null,
            };

            if (user == null)
            {
                return BadRequest("UserName or Password is Invalid");
            }
            bool isMatch = BCrypt.Net.BCrypt.Verify(UserInfo.Password, user.Password);
            if (isMatch == false)
            {
                return BadRequest("UserName or Password is Invalid");
            } 

            if (UserInfo.Type == "employee" && user.IsSuspended)
            { 
                return Forbid();
            }
            else if (UserInfo.Type == "student" && user.IsSuspended)
            {
                return Forbid();
            }

            if (UserInfo.Type == "employee" && user is Employee emp)
            {
                var tokenEmp = _generateJWT.Generate_Jwt_Token(emp.User_Name, emp.ID.ToString(), UserInfo.Type, emp.Role_ID.ToString());
                return Ok(new { Token = tokenEmp });
            }
            else if (UserInfo.Type == "student" && user is Student stu)
            {
                var token = _generateJWT.Generate_Jwt_Token(stu.User_Name, stu.ID.ToString(), UserInfo.Type);
                return Ok(new { Token = token });
            }
            else if (UserInfo.Type == "parent" && user is Parent par)
            {
                var token = _generateJWT.Generate_Jwt_Token(par.User_Name, par.ID.ToString(), UserInfo.Type);
                return Ok(new { Token = token });
            }
            return BadRequest(new { error = "Unexpected user type." });

            //var accessToken = _generateJWT.Generate_Jwt_Token(
            //    user.User_Name,
            //    user.ID.ToString(),
            //    UserInfo.Type,
            //    user.Role_ID?.ToString()
            //);

            //var refreshToken = _generateJWT.GenerateRefreshToken();

            // Save refresh token in DB
            //var refreshTokenEntity = new RefreshTokens
            //{
            //    Token = refreshToken,
            //    UserID = user.ID,
            //    UserTypeID = UserInfo.Type == "employee" ? 1 : UserInfo.Type == "parent" ? 3 : 2,
            //    ExpiresAt = DateTime.UtcNow.AddDays(7),
            //    IsRevoked = false
            //};

            //Unit_Of_Work.refreshTokens_Repository.Add(refreshTokenEntity);
            //Unit_Of_Work.SaveChanges();

            //return Ok(new
            //{
            //    AccessToken = accessToken,
            //    RefreshToken = refreshToken
            //});
        }

        ///////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshRequest model)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);  
            RefreshTokens refreshTokenEntity = Unit_Of_Work.refreshTokens_Repository.First_Or_Default(rt => rt.Token == model.RefreshToken);

            if (refreshTokenEntity == null)
                return Unauthorized("Invalid refresh token");
             
            if (refreshTokenEntity.IsRevoked)
            {
                // Optional: Revoke all user tokens to prevent reuse
                var userTokens = Unit_Of_Work.refreshTokens_Repository
                    .FindBy(rt => rt.UserID == refreshTokenEntity.UserID && !rt.IsRevoked)
                    .ToList();

                foreach (var token in userTokens)
                    token.IsRevoked = true;

                Unit_Of_Work.refreshTokens_Repository.UpdateRange(userTokens);
                Unit_Of_Work.SaveChanges();

                return Unauthorized("Refresh token already used or invalidated");
            }

            if (refreshTokenEntity.ExpiresAt < DateTime.UtcNow)
                return Unauthorized("Refresh token expired");

            var userTypeId = refreshTokenEntity.UserTypeID;
            string userType = userTypeId switch
            {
                1 => "employee",
                2 => "student",
                3 => "parent",
                _ => null
            };

            if (userType == null)
                return Unauthorized("Invalid user type");

            // 2. Get the user
            dynamic user = userType switch
            {
                "employee" => Unit_Of_Work.employee_Repository.First_Or_Default(emp => emp.ID == refreshTokenEntity.UserID && emp.IsDeleted != true),
                "student" => Unit_Of_Work.student_Repository.First_Or_Default(stu => stu.ID == refreshTokenEntity.UserID && stu.IsDeleted != true),
                "parent" => Unit_Of_Work.parent_Repository.First_Or_Default(par => par.ID == refreshTokenEntity.UserID && par.IsDeleted != true),
                _ => null,
            };

            if (user == null)
                return Unauthorized("User not found or inactive");

            var newAccessToken = _generateJWT.Generate_Jwt_Token(
                user.User_Name,
                user.ID.ToString(),
                userType,
                user.Role_ID?.ToString()
            );
             
            var newRefreshToken = _generateJWT.GenerateRefreshToken();
             
            refreshTokenEntity.IsRevoked = true;
            Unit_Of_Work.refreshTokens_Repository.Update( refreshTokenEntity);
            Unit_Of_Work.refreshTokens_Repository.Add(new RefreshTokens
            {
                Token = newRefreshToken,
                UserID = user.ID,
                UserTypeID = refreshTokenEntity.UserTypeID,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false
            });

            Unit_Of_Work.SaveChanges();
             
            return Ok(new { AccessToken = newAccessToken, RefreshToken = newRefreshToken });
        }

        ///////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost("Logout")]
        public IActionResult Logout([FromBody] RefreshRequest model)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            RefreshTokens refreshTokenEntity = Unit_Of_Work.refreshTokens_Repository.First_Or_Default(rt => rt.Token == model.RefreshToken);

            if (refreshTokenEntity == null)
                return BadRequest("Invalid refresh token");

            refreshTokenEntity.IsRevoked = true;
            Unit_Of_Work.refreshTokens_Repository.Update(refreshTokenEntity);
            Unit_Of_Work.SaveChanges();

            return Ok("Logged out successfully");
        }

        ///////////////////////////////////////////////////////////////////////////////////////////

        [Authorize]
        [HttpPut("EditPass")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> EditPasswordAsync(EditPasswordDTO model)
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

            if (model.Password == "")
            {
                return BadRequest("password cannot be empty");
            }

            dynamic user = userTypeClaim switch
            {
                "employee" => Unit_Of_Work.employee_Repository.First_Or_Default(emp => emp.ID == model.Id && emp.IsDeleted != true),
                "student" => Unit_Of_Work.student_Repository.First_Or_Default(stu => stu.ID == model.Id && stu.IsDeleted != true),
                "parent" => Unit_Of_Work.parent_Repository.First_Or_Default(par => par.ID == model.Id && par.IsDeleted != true),
                _ => null,
            };
             
            //bool isMatch = BCrypt.Net.BCrypt.Verify(model.OldPassword, user.Password);
            //if (isMatch == false)
            //{
            //    return BadRequest("Old Password isn't right");
            //}

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            if (userTypeClaim == "octa")
            {
                user.UpdatedByOctaId = userId;
                user.UpdatedByUserId = null;
            }
            else if (userTypeClaim == "employee")
            {
                user.UpdatedByUserId = userId;
                user.UpdatedByOctaId = null;
            }
            user.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
            user.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone); 
            switch (userTypeClaim)
            {
                case "employee":
                    Unit_Of_Work.employee_Repository.Update(user);
                    break;
                case "student":
                    Unit_Of_Work.student_Repository.Update(user);
                    break;
                case "parent":
                    Unit_Of_Work.parent_Repository.Update(user);
                    break;
            }
            await Unit_Of_Work.SaveChangesAsync();
            return Ok();
        }
        ///////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost("LoginMobile")]
        public IActionResult LoginMobile([FromBody] LoginDTO UserInfo)
        { 
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            if (UserInfo == null)
            {
                return BadRequest(new { error = "Data Can't be null" });
            }
            if (UserInfo.User_Name.Length == 0)
            {
                return BadRequest(new { error = "User_Name Can't be null" });
            }

            if (UserInfo.Password.Length == 0)
            {
                return BadRequest(new { error = "Password Can't be null" });
            }

            UserInfo.Type = "employee";

            var user = Unit_Of_Work.employee_Repository.First_Or_Default(emp => emp.User_Name == UserInfo.User_Name && emp.IsDeleted != true);

            if (user == null)
            {
                return BadRequest(new { error = "UserName or Password is Invalid" });;
            }
            bool isMatch = BCrypt.Net.BCrypt.Verify(UserInfo.Password, user.Password);
            if (isMatch == false)
            {
                return BadRequest(new { error = "UserName or Password is Invalid" });
            }

            if(user.SerialNumber != null && user.SerialNumber != UserInfo.SerialNumber)
            {
                return BadRequest(new { error = "SerialNumber is Invalid" });
            }

            if (user.SerialNumber == null)
            {
                user.SerialNumber = UserInfo.SerialNumber;
                Unit_Of_Work.employee_Repository.Update(user);
                Unit_Of_Work.SaveChanges();
            }

            if (user.IsSuspended)
            {
                return Forbid();
            }

            if (user is Employee emp)
            { 
                var accessToken = _generateJWT.Generate_Jwt_Token(
                    emp.User_Name,
                    emp.ID.ToString(),
                    UserInfo.Type,
                    emp.Role_ID.ToString()
                );
                  
                var refreshToken = _generateJWT.GenerateRefreshToken();
                 
                var refreshTokenEntity = new RefreshTokens
                {
                    Token = refreshToken,
                    UserID = emp.ID,
                    UserTypeID = 1, // employee
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    IsRevoked = false
                };

                Unit_Of_Work.refreshTokens_Repository.Add(refreshTokenEntity);
                Unit_Of_Work.SaveChanges();
                 
                return Ok(new
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken
                });
            }

            return BadRequest(new { error = "Unexpected user type." });
        } 
    }
}
