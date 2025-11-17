using AutoMapper;
using LMS_CMS_PL.Services.SignalR;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Services.FileValidations;
using System.Net;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using LMS_CMS_PL.Services.S3;

namespace LMS_CMS_PL.Controllers.Domains.Communication
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;
        private readonly UserTreeService _userTreeService;
        private readonly ValidTeachersForStudentService _validTeachersForStudentService;
        private readonly ChatMessageService _chatMessageService;
        private readonly FileUploadsService _fileService;

        public ChatController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, UserTreeService userTreeService, ValidTeachersForStudentService validTeachersForStudentService, ChatMessageService chatMessageService, FileUploadsService fileService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _userTreeService = userTreeService;
            _validTeachersForStudentService = validTeachersForStudentService;
            _chatMessageService = chatMessageService;
            _fileService = fileService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        private (string EnglishName, string ArabicName, long ConnectionStatusID) GetUserNames(UOW unitOfWork, long userId, long userTypeId)
        {
            string englishName = string.Empty;
            string arabicName = string.Empty;
            long? connectionStatusID = 0;

            switch (userTypeId)
            {
                case 1:
                    Employee employee = unitOfWork.employee_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (employee != null)
                    {
                        englishName = employee.en_name;
                        arabicName = employee.ar_name;
                        connectionStatusID = employee.ConnectionStatusID;
                    }
                    break;

                case 2:
                    Student student = unitOfWork.student_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (student != null)
                    {
                        englishName = student.en_name;
                        arabicName = student.ar_name;
                        connectionStatusID = student.ConnectionStatusID;
                    }
                    break;

                case 3:
                    Parent parent = unitOfWork.parent_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (parent != null)
                    {
                        englishName = parent.en_name;
                        arabicName = parent.ar_name;
                        connectionStatusID = parent.ConnectionStatusID;
                    }
                    break;

                default:
                    throw new ArgumentException("Invalid user type ID");
            }

            return (englishName, arabicName, connectionStatusID.Value);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByUserIDFirst5")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDFirst5()
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

            List<ChatMessage> chatMessages = await Unit_Of_Work.chatMessage_Repository.Select_All_With_IncludesById<ChatMessage>(
                    f => ((f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID) || (f.SenderID == userId && f.SenderUserTypeID == userTypeID)),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType),
                    query => query.Include(d => d.ChatMessageAttachments)
                    );

            if (chatMessages == null || chatMessages.Count == 0)
            {
                return NotFound();
            }

            var conversations = chatMessages
            .GroupBy(m =>
                (m.SenderID == userId && m.SenderUserTypeID == userTypeID) ?
                new { UserId = m.ReceiverID, UserTypeId = m.ReceiverUserTypeID } :
                new { UserId = m.SenderID, UserTypeId = m.SenderUserTypeID }
            )
            .Select(g => new
            {
                OtherUserId = g.Key.UserId,
                OtherUserTypeId = g.Key.UserTypeId,
                LastMessage = g.OrderByDescending(m => m.InsertedAt).FirstOrDefault(),
                UnreadCount = g.Count(m =>
                    m.ReceiverID == userId &&
                    m.ReceiverUserTypeID == userTypeID &&
                    !m.SeenOrNot)
            })
            .OrderByDescending(c => c.LastMessage.InsertedAt)
            .Take(5)
            .ToList();

            var result = new List<ChatGetDTO>();
            foreach (var conv in conversations)
            {
                var lastMessage = conv.LastMessage; 
                 
                (string senderEnglishName, string senderArabicName, long senderConnectionStatusID) = GetUserNames(Unit_Of_Work, lastMessage.SenderID, lastMessage.SenderUserTypeID);
                (string receiverEnglishName, string receiverArabicName, long receiverConnectionStatusID) = GetUserNames(Unit_Of_Work, lastMessage.ReceiverID, lastMessage.ReceiverUserTypeID);

                var chatDto = new ChatGetDTO
                {
                    ID = lastMessage.ID,
                    Message = lastMessage.Message,
                    SeenOrNot = lastMessage.SeenOrNot,
                    ForwardedOrNot = lastMessage.ForwardedOrNot,
                    SenderID = lastMessage.SenderID,
                    SenderEnglishName = senderEnglishName,
                    SenderArabicName = senderArabicName,
                    SenderConnectionStatusID = senderConnectionStatusID,
                    SenderUserTypeID = lastMessage.SenderUserTypeID,
                    SenderUserTypeName = lastMessage.SenderUserType.Title,
                    ReceiverID = lastMessage.ReceiverID,
                    ReceiverEnglishName = receiverEnglishName,
                    ReceiverArabicName = receiverArabicName,
                    ReceiverUserTypeID = lastMessage.ReceiverUserTypeID,
                    ReceiverUserTypeName = lastMessage.ReceiverUserType.Title,
                    ReceiverConnectionStatusID = receiverConnectionStatusID,
                    InsertedAt = lastMessage.InsertedAt,
                    UnreadCount = conv.UnreadCount,
                    ChatMessageAttachments = lastMessage.ChatMessageAttachments?
                        .Select(a => new ChatMessageAttachmentGetDTO
                        {
                            ID = a.ID,
                            ChatMessageID = a.ChatMessageID, 
                            FileLink = a.FileLink
                        }).ToList() ?? new List<ChatMessageAttachmentGetDTO>()
                };
                 
                if (chatDto.ChatMessageAttachments != null && chatDto.ChatMessageAttachments.Count > 0)
                { 
                    foreach (var item in chatDto.ChatMessageAttachments)
                    { 
                        item.FileLink = _fileService.GetFileUrl(item.FileLink, Request, HttpContext);
                    }
                }

                result.Add(chatDto);
            }

            return Ok(result); 
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByUserIDWithAllOtherUsers")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDWithAllOtherUsers()
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

            List<ChatMessage> chatMessages = await Unit_Of_Work.chatMessage_Repository.Select_All_With_IncludesById<ChatMessage>(
                    f => ((f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID) || (f.SenderID == userId && f.SenderUserTypeID == userTypeID)),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType),
                    query => query.Include(d => d.ChatMessageAttachments)
                    );

            if (chatMessages == null || chatMessages.Count == 0)
            {
                return NotFound();
            }

            var conversations = chatMessages
               .GroupBy(m =>
                   (m.SenderID == userId && m.SenderUserTypeID == userTypeID) ?
                   new { UserId = m.ReceiverID, UserTypeId = m.ReceiverUserTypeID } :
                   new { UserId = m.SenderID, UserTypeId = m.SenderUserTypeID }
               )
               .Select(g => new
               {
                   OtherUserId = g.Key.UserId,
                   OtherUserTypeId = g.Key.UserTypeId,
                   LastMessage = g.OrderByDescending(m => m.InsertedAt).FirstOrDefault(), 
                   UnreadCount = g.Count(m =>
                       m.ReceiverID == userId &&
                       m.ReceiverUserTypeID == userTypeID &&
                       !m.SeenOrNot)
               })
               .ToList();

            var result = new List<ChatGetDTO>();
            foreach (var conv in conversations)
            {
                var lastMessage = conv.LastMessage;
                 
                var chatDto = new ChatGetDTO
                {
                    ID = lastMessage.ID,
                    Message = lastMessage.Message,
                    SeenOrNot = lastMessage.SeenOrNot,
                    ForwardedOrNot = lastMessage.ForwardedOrNot, 
                    SenderID = lastMessage.SenderID,
                    SenderUserTypeID = lastMessage.SenderUserTypeID,
                    ReceiverID = lastMessage.ReceiverID,
                    ReceiverUserTypeID = lastMessage.ReceiverUserTypeID,
                    SenderUserTypeName = lastMessage.SenderUserType.Title,
                    ReceiverUserTypeName = lastMessage.ReceiverUserType.Title,
                    InsertedAt = lastMessage.InsertedAt,
                    UnreadCount = conv.UnreadCount,
                    ChatMessageAttachments = lastMessage.ChatMessageAttachments?
                        .Select(a => new ChatMessageAttachmentGetDTO
                        {
                            ID = a.ID,
                            ChatMessageID = a.ChatMessageID,
                            FileLink = a.FileLink
                        }).ToList() ?? new List<ChatMessageAttachmentGetDTO>()
                };
                 
                (chatDto.SenderEnglishName, chatDto.SenderArabicName, chatDto.SenderConnectionStatusID) = GetUserNames(Unit_Of_Work, chatDto.SenderID, chatDto.SenderUserTypeID);
                (chatDto.ReceiverEnglishName, chatDto.ReceiverArabicName, chatDto.ReceiverConnectionStatusID) = GetUserNames(Unit_Of_Work, chatDto.ReceiverID, chatDto.ReceiverUserTypeID); 

                result.Add(chatDto);
            } 
             
            foreach (var chatMessage in result)
            {
                if (chatMessage.ChatMessageAttachments != null && chatMessage.ChatMessageAttachments.Count > 0)
                {
                    foreach (var item in chatMessage.ChatMessageAttachments)
                    { 
                        item.FileLink = _fileService.GetFileUrl(item.FileLink, Request, HttpContext);
                    }
                }
            }
             
            result = result.OrderByDescending(r => r.InsertedAt).ToList();

            return Ok(result);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("BySenderAndReceiverID/{otherUserID}/{otherUserTypeID}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> BySenderAndReceiverID(long otherUserID, long otherUserTypeID)
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

            List<ChatMessage> chatMessages = await Unit_Of_Work.chatMessage_Repository.Select_All_With_IncludesById<ChatMessage>(
                    f => ((f.SenderID == userId && f.SenderUserTypeID == userTypeID && f.ReceiverID == otherUserID && f.ReceiverUserTypeID == otherUserTypeID)
                    || (f.SenderID == otherUserID && f.SenderUserTypeID == otherUserTypeID && f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID)),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType),
                    query => query.Include(d => d.ChatMessageAttachments)
                    );

            if (chatMessages == null)
            {
                return NotFound();
            }

            chatMessages = chatMessages
                .OrderByDescending(d => d.InsertedAt)
                .ToList();

            List<ChatGetDTO> chatMessagesGetDTO = mapper.Map<List<ChatGetDTO>>(chatMessages);

            foreach (var chatMessage in chatMessagesGetDTO)
            {
                if (chatMessage.ChatMessageAttachments != null && chatMessage.ChatMessageAttachments.Count > 0)
                { 
                    foreach (var item in chatMessage.ChatMessageAttachments)
                    {
                        item.FileLink = _fileService.GetFileUrl(item.FileLink, Request, HttpContext);
                    }
                }

                (chatMessage.SenderEnglishName, chatMessage.SenderArabicName, chatMessage.SenderConnectionStatusID) = GetUserNames(Unit_Of_Work, chatMessage.SenderID, chatMessage.SenderUserTypeID);
                (chatMessage.ReceiverEnglishName, chatMessage.ReceiverArabicName, chatMessage.ReceiverConnectionStatusID) = GetUserNames(Unit_Of_Work, chatMessage.ReceiverID, chatMessage.ReceiverUserTypeID);
            }

            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            foreach (var item in chatMessages)
            {
                if (item.ReceiverID == userId && item.ReceiverUserTypeID == userTypeID)
                {
                    item.SeenOrNot = true;
                    Unit_Of_Work.chatMessage_Repository.Update(item); 
                }    
            }

            Unit_Of_Work.SaveChanges(); 
             
            return Ok(chatMessagesGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("UnSeenRequestCount")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult UnSeenRequestCount()
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

            List<ChatMessage> chatMessages = Unit_Of_Work.chatMessage_Repository.FindBy(
                    f => !f.SeenOrNot && f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID);

            return Ok(chatMessages.Count);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> AddAsync([FromForm] ChatAddDTO NewMessage)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            long userTypeID = userTypeClaim switch
            {
                "employee" => 1,
                "student" => 2,
                "parent" => 3
            };

            if (NewMessage == null)
            {
                return BadRequest("Chat Message cannot be null");
            } 

            UserType userTypeForReceiver = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverUserTypeID);
            if (userTypeForReceiver == null)
            {
                return BadRequest("No User Type For Receiver With this ID");
            }

            if((userTypeID == 2 || userTypeID == 3) && NewMessage.ReceiverUserTypeID != 1)
            {
                return BadRequest("You Can't send Messages to This user Type");
            }

            if ((NewMessage.Message == null || NewMessage.Message == "") && (NewMessage.ChatMessageAttachmentFiles == null || NewMessage.ChatMessageAttachmentFiles.Count == 0))
            {
                return BadRequest("You have to choose one element atleast to send (File - Message)");
            }

            foreach (var file in NewMessage.ChatMessageAttachmentFiles)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(file);

                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }
             
            List<long> targetUserIds;
            try
            {
                targetUserIds = _userTreeService.GetUsersAccordingToTree(Unit_Of_Work, NewMessage.ReceiverUserTypeID, NewMessage.UserFilters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            if (targetUserIds.Count == 0)
            {
                return NotFound("No Users To Text");
            }

            long studentId = 0;
            List<long> teacherIDs = new List<long>();

            if (userTypeID == 3)
            { 
                List<Student> students = Unit_Of_Work.student_Repository.FindBy(d => d.IsDeleted != true && d.Parent_Id == userId);
                if (students == null || students.Count == 0)
                {
                    return NotFound("This Parent Doesn't have children");
                }

                foreach(Student student in students)
                {
                    var teacherIdsForStudent = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(student.ID, Unit_Of_Work);
                    teacherIDs.AddRange(teacherIdsForStudent);
                }
            }

            if(userTypeID == 2)
            {
                studentId = userId;
                teacherIDs = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(studentId, Unit_Of_Work);
            }

            if (NewMessage.ReceiverUserTypeID == 1 && (userTypeID == 2 || userTypeID == 3))
            {
                List<long> idsToRemove = new List<long>();

                foreach (long targetUserID in targetUserIds)
                {
                    Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == targetUserID && d.IsDeleted != true);

                    if(NewMessage.IsTeacher == true)
                    {
                        if (teacherIDs.Count == 0 || !teacherIDs.Contains(targetUserID))
                        { 
                            idsToRemove.Add(targetUserID);
                        }
                    }
                    else
                    {
                        if (employee.CanReceiveMessageFromParent != true)
                        {
                            idsToRemove.Add(targetUserID);
                        }
                    } 
                }

                foreach (long idToRemove in idsToRemove)
                {
                    targetUserIds.Remove(idToRemove);
                }
            }

            // Don't message myself
            if (NewMessage.ReceiverUserTypeID == 1 && userTypeID == 1)
            {
                if (targetUserIds.Contains(userId))
                {
                    targetUserIds.Remove(userId);
                }
            }
            
            if (targetUserIds.Count == 0)
            {
                return NotFound("No Users To Text");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (long targetUserID in targetUserIds)
            {
                ChatMessage chat = new ChatMessage();
                chat.Message = NewMessage.Message;
                chat.SenderID = userId;
                chat.SenderUserTypeID = userTypeID;
                chat.ReceiverID = targetUserID;
                chat.ReceiverUserTypeID = NewMessage.ReceiverUserTypeID;
                chat.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                Unit_Of_Work.chatMessage_Repository.Add(chat);
    
                Unit_Of_Work.SaveChanges();
           
                if (NewMessage.ChatMessageAttachmentFiles != null && NewMessage.ChatMessageAttachmentFiles.Count != 0)
                {
                    //var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/ChatMessage");
                    //var chatFolder = Path.Combine(baseFolder, chat.ID.ToString());
                    //if (!Directory.Exists(chatFolder))
                    //{
                    //    Directory.CreateDirectory(chatFolder);
                    //}
                    foreach (var file in NewMessage.ChatMessageAttachmentFiles)
                    {
                        ChatMessageAttachment chatMessageAttachment = new ChatMessageAttachment();
                        chatMessageAttachment.ChatMessageID = chat.ID;

                        //if (file.Length > 0)
                        //{
                        //    var filePath = Path.Combine(chatFolder, file.FileName);
                        //    using (var stream = new FileStream(filePath, FileMode.Create))
                        //    {
                        //        await file.CopyToAsync(stream);
                        //    }
                        //} 
                        chatMessageAttachment.FileLink = await _fileService.UploadFileAsync(file, "Communication/ChatMessage", chat.ID, HttpContext);
                        Unit_Of_Work.chatMessageAttachment_Repository.Add(chatMessageAttachment);
                    }
                }
            }

            Unit_Of_Work.SaveChanges();

            foreach (var userID in targetUserIds)
            {
                await _chatMessageService.PushRealTimeMessage(userID, NewMessage.ReceiverUserTypeID, domainName);
            }

            return Ok();
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost("SendToOneUser")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> SendToOneUser([FromForm] ChatAddDTO NewMessage)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            long userTypeID = userTypeClaim switch
            {
                "employee" => 1,
                "student" => 2,
                "parent" => 3
            };

            if (NewMessage == null)
            {
                return BadRequest("Chat Message cannot be null");
            } 

            UserType userTypeForReceiver = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverUserTypeID);
            if (userTypeForReceiver == null)
            {
                return BadRequest("No User Type For Receiver With this ID");
            }

            if((userTypeID == 2 || userTypeID == 3) && NewMessage.ReceiverUserTypeID != 1)
            {
                return BadRequest("You Can't send Messages to This user Type");
            }

            if ((NewMessage.Message == null || NewMessage.Message == "") && (NewMessage.ChatMessageAttachmentFiles == null || NewMessage.ChatMessageAttachmentFiles.Count == 0))
            {
                return BadRequest("You have to choose one element atleast to send (File - Message)");
            }

            foreach (var file in NewMessage.ChatMessageAttachmentFiles)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(file);

                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            if(NewMessage.ReceiverID == null || NewMessage.ReceiverID == 0)
            {
                return BadRequest("You have to choose who to message");
            }

            switch (NewMessage.ReceiverUserTypeID)
            {
                case 1:
                    Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverID && d.IsDeleted != true);
                    if (employee == null)
                    {
                        return BadRequest("No employee with this ID");
                    }
                    break;

                case 2:
                    Student student = Unit_Of_Work.student_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverID && d.IsDeleted != true);
                    if (student == null)
                    {
                        return BadRequest("No student with this ID");
                    }
                    break;

                case 3:
                    Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverID && d.IsDeleted != true);
                    if (parent == null)
                    {
                        return BadRequest("No student with this ID");
                    }
                    break;

                default:
                    throw new ArgumentException("Invalid user type ID");
            }
             
            long studentId = 0;
            List<long> teacherIDs = new List<long>();

            if (userTypeID == 3)
            { 
                List<Student> students = Unit_Of_Work.student_Repository.FindBy(d => d.IsDeleted != true && d.Parent_Id == userId);
                if (students == null || students.Count == 0)
                {
                    return NotFound("This Parent Doesn't have children");
                }

                foreach(Student student in students)
                {
                    var teacherIdsForStudent = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(student.ID, Unit_Of_Work);
                    teacherIDs.AddRange(teacherIdsForStudent);
                }
            }

            if(userTypeID == 2)
            {
                studentId = userId;
                teacherIDs = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(studentId, Unit_Of_Work);
            }

            if (NewMessage.ReceiverUserTypeID == 1 && (userTypeID == 2 || userTypeID == 3))
            {
                Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverID && d.IsDeleted != true);
                // If can't receive message then see if he is his teacher if not then see if there are history between them if not so error
                if (employee.CanReceiveMessageFromParent != true)
                { 
                    if (teacherIDs.Count == 0 || !teacherIDs.Contains(NewMessage.ReceiverID.Value))
                    {
                        List<ChatMessage> chatMessages = Unit_Of_Work.chatMessage_Repository.FindBy(
                            d => (d.SenderID == userId && d.SenderUserTypeID == userTypeID && d.ReceiverID == NewMessage.ReceiverID && d.ReceiverUserTypeID == NewMessage.ReceiverUserTypeID) ||
                                 (d.SenderID == NewMessage.ReceiverID && d.SenderUserTypeID == NewMessage.ReceiverUserTypeID && d.ReceiverID == userId && d.ReceiverUserTypeID == userTypeID)
                            );
                        if (chatMessages == null || chatMessages.Count == 0)
                        {
                            return BadRequest("You can't send to this user");
                        }
                    }
                }  
            }

            // Don't message myself
            if (NewMessage.ReceiverUserTypeID == 1 && userTypeID == 1 && NewMessage.ReceiverID == userId)
            {
                return BadRequest("You can't send message to yourself");
            } 

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
             
            ChatMessage chat = new ChatMessage();
            chat.Message = NewMessage.Message;
            chat.SenderID = userId;
            chat.SenderUserTypeID = userTypeID;
            chat.ReceiverID = NewMessage.ReceiverID.Value;
            chat.ReceiverUserTypeID = NewMessage.ReceiverUserTypeID;
            chat.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.chatMessage_Repository.Add(chat);
    
            Unit_Of_Work.SaveChanges();
           
            if (NewMessage.ChatMessageAttachmentFiles != null && NewMessage.ChatMessageAttachmentFiles.Count != 0)
            {
                //var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/ChatMessage");
                //var chatFolder = Path.Combine(baseFolder, chat.ID.ToString());
                //if (!Directory.Exists(chatFolder))
                //{
                //    Directory.CreateDirectory(chatFolder);
                //}
                foreach (var file in NewMessage.ChatMessageAttachmentFiles)
                {
                    ChatMessageAttachment chatMessageAttachment = new ChatMessageAttachment();
                    chatMessageAttachment.ChatMessageID = chat.ID;

                    //if (file.Length > 0)
                    //{
                    //    var filePath = Path.Combine(chatFolder, file.FileName);
                    //    using (var stream = new FileStream(filePath, FileMode.Create))
                    //    {
                    //        await file.CopyToAsync(stream);
                    //    }
                    //}
                    //chatMessageAttachment.FileLink = Path.Combine("Uploads", "ChatMessage", chat.ID.ToString(), file.FileName);
                    chatMessageAttachment.FileLink = await _fileService.UploadFileAsync(file, "Communication/ChatMessage", chat.ID, HttpContext);
                    Unit_Of_Work.chatMessageAttachment_Repository.Add(chatMessageAttachment);
                }
            }

            Unit_Of_Work.SaveChanges();
             
            await _chatMessageService.PushRealTimeMessage(NewMessage.ReceiverID.Value, NewMessage.ReceiverUserTypeID, domainName); 

            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost("Forward")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ForwardAsync(ChatForwardDTO ForwardedMessage)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            long userTypeID = userTypeClaim switch
            {
                "employee" => 1,
                "student" => 2,
                "parent" => 3
            };

            if (ForwardedMessage == null)
            {
                return BadRequest("Forward Message cannot be null");
            }

            UserType userTypeForReceiver = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == ForwardedMessage.ReceiverUserTypeID);
            if (userTypeForReceiver == null)
            {
                return BadRequest("No User Type For Receiver With this ID");
            }

            if ((userTypeID == 2 || userTypeID == 3) && ForwardedMessage.ReceiverUserTypeID != 1)
            {
                return BadRequest("You Can't forward Messages to This user Type");
            }

            ChatMessage chatMessageExists = await Unit_Of_Work.chatMessage_Repository.FindByIncludesAsync(
                d => d.ID == ForwardedMessage.ChatMessageID && ( (d.SenderID == userId && d.SenderUserTypeID == userTypeID ) || (d.ReceiverID == userId && d.ReceiverUserTypeID== userTypeID)), 
                query => query.Include(d => d.ChatMessageAttachments));

            if(chatMessageExists == null)
            {
                return NotFound("No chat message with this ID");
            }  

            List<long> targetUserIds = new List<long>();
            try
            {
                targetUserIds = _userTreeService.GetUsersAccordingToTree(Unit_Of_Work, ForwardedMessage.ReceiverUserTypeID, ForwardedMessage.UserFilters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            if (targetUserIds.Count == 0)
            {
                return NotFound("No Users To Transfer to");
            }

            long studentId = 0;
            List<long> teacherIDs = new List<long>();

            if (userTypeID == 3)
            {
                List<Student> students = Unit_Of_Work.student_Repository.FindBy(d => d.IsDeleted != true && d.Parent_Id == userId);
                if (students == null || students.Count == 0)
                {
                    return NotFound("This Parent Doesn't have children");
                }

                foreach (Student student in students)
                {
                    var teacherIdsForStudent = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(student.ID, Unit_Of_Work);
                    teacherIDs.AddRange(teacherIdsForStudent);
                }
            }

            if (userTypeID == 2)
            {
                studentId = userId;
                teacherIDs = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(studentId, Unit_Of_Work);
            }

            if (ForwardedMessage.ReceiverUserTypeID == 1 && (userTypeID == 2 || userTypeID == 3))
            {
                List<long> idsToRemove = new List<long>();

                foreach (long targetUserID in targetUserIds)
                {
                    Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == targetUserID && d.IsDeleted != true);

                    if (ForwardedMessage.IsTeacher == true)
                    {
                        if (teacherIDs.Count == 0 || !teacherIDs.Contains(targetUserID))
                        {
                            idsToRemove.Add(targetUserID);
                        }
                    }
                    else
                    {
                        if (employee.CanReceiveMessageFromParent != true)
                        {
                            idsToRemove.Add(targetUserID);
                        }
                    }
                }
                foreach (long idToRemove in idsToRemove)
                {
                    targetUserIds.Remove(idToRemove);
                }
            }

            // Don't message myself
            if (ForwardedMessage.ReceiverUserTypeID == 1 && userTypeID == 1)
            {
                if (targetUserIds.Contains(userId))
                {
                    targetUserIds.Remove(userId);
                }
            }

            if (targetUserIds.Count == 0)
            {
                return NotFound("No Users To Text");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (long targetUserID in targetUserIds)
            {
                ChatMessage chat = new ChatMessage();
                chat.Message = chatMessageExists.Message;
                chat.SenderID = userId;
                chat.SenderUserTypeID = userTypeID;
                chat.ReceiverID = targetUserID;
                chat.ReceiverUserTypeID = ForwardedMessage.ReceiverUserTypeID;
                chat.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                chat.ForwardedOrNot = true;
                Unit_Of_Work.chatMessage_Repository.Add(chat);

                Unit_Of_Work.SaveChanges();

                //if (chatMessageExists.ChatMessageAttachments != null && chatMessageExists.ChatMessageAttachments.Count != 0)
                //{
                //    foreach (var fileLink in chatMessageExists.ChatMessageAttachments)
                //    {
                //        var normalizedFileLink = fileLink.FileLink.Replace('\\', Path.DirectorySeparatorChar);
                //        var originalFilePath = Path.Combine(Directory.GetCurrentDirectory(), normalizedFileLink);

                //        if (System.IO.File.Exists(originalFilePath))
                //        {
                //            var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/ChatMessage");
                //            var chatFolder = Path.Combine(baseFolder, chat.ID.ToString());

                //            if (!Directory.Exists(chatFolder))
                //            {
                //                Directory.CreateDirectory(chatFolder);
                //            }

                //            // Get the filename from the original path
                //            var fileName = Path.GetFileName(fileLink.FileLink);

                //            // Create new file path
                //            var newFilePath = Path.Combine(chatFolder, fileName);

                //            // Copy the file
                //            System.IO.File.Copy(originalFilePath, newFilePath, overwrite: true);

                //            ChatMessageAttachment chatMessageAttachment = new ChatMessageAttachment();
                //            chatMessageAttachment.ChatMessageID = chat.ID;

                //            chatMessageAttachment.FileLink = Path.Combine("Uploads", "ChatMessage", chat.ID.ToString(), fileName);
                //            Unit_Of_Work.chatMessageAttachment_Repository.Add(chatMessageAttachment);
                //        }
                //        else
                //        {
                //            return BadRequest("File doesn't exists in this route");
                //        }
                //    }
                //}
                if (chatMessageExists.ChatMessageAttachments != null && chatMessageExists.ChatMessageAttachments.Count != 0)
                {
                    foreach (var fileLink in chatMessageExists.ChatMessageAttachments)
                    {
                        try
                        { 
                            string newFilePath = await _fileService.CopyFileAsync(
                                fileLink.FileLink,
                                "Communication/ChatMessage",
                                chat.ID,
                                HttpContext
                            );

                            if (!string.IsNullOrEmpty(newFilePath))
                            {
                                ChatMessageAttachment chatMessageAttachment = new ChatMessageAttachment
                                {
                                    ChatMessageID = chat.ID,
                                    FileLink = newFilePath
                                };
                                Unit_Of_Work.chatMessageAttachment_Repository.Add(chatMessageAttachment);
                            }
                            else
                            {
                                return BadRequest("Failed to copy one or more files.");
                            }
                        }
                        catch (Exception ex)
                        {
                            return BadRequest($"Error copying file: {ex.Message}");
                        }
                    }
                }
            }

            foreach (var userID in targetUserIds)
            {
                 await _chatMessageService.PushRealTimeMessage(userID, ForwardedMessage.ReceiverUserTypeID, domainName);
            }

            chatMessageExists.SeenOrNot = true;
            Unit_Of_Work.chatMessage_Repository.Update(chatMessageExists);

            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
