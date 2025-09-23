using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using LMS_CMS_BL.UOW;
using LMS_CMS_BL.Config;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using LMS_CMS_PL.Middleware;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Services;
using LMS_CMS_DAL.Models;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.FileProviders;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Zatca.EInvoice.SDK.Contracts;
using Zatca.EInvoice.SDK;
using Amazon;
using Amazon.S3;
using Amazon.SecretsManager;
using LMS_CMS_BL.Config;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Octa;
using LMS_CMS_PL.Hubs;
using LMS_CMS_PL.Middleware;
using LMS_CMS_PL.Services;
using LMS_CMS_PL.Services.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System;
using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using Zatca.EInvoice.SDK;
using Zatca.EInvoice.SDK.Contracts;
using static Org.BouncyCastle.Math.EC.ECCurve;
using LMS_CMS_PL.Services.FileValidations;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;

namespace LMS_CMS
{
    public class Program
    {
        public static void Main(string[] args)
        {
            //////// TO Open The Cors for the other domains:
            /// 1)

            var builder = WebApplication.CreateBuilder(args);
            const string CorsPolicy = "AllowAllOrigins";

            // Add services to the container.
            //builder.Services.AddControllers();
            /// Json String Enum Converter:
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.EnableAnnotations();
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "ERP System API", Version = "v1" });

                // Add JWT authentication
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter 'Bearer' followed by your token in the input below.\nExample: 'Bearer abc123xyz'"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

                // Add custom header operation filter
                c.OperationFilter<AddCustomHeaderOperationFilter>();
            });



            //////// JWT (Token)
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(option =>
                {
                    option.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidIssuer = builder.Configuration["JWT:Issuer"],
                        ValidAudience = builder.Configuration["JWT:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]))
                    };
                    // Add these for SignalR
                    option.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            // If the request is for our hub...
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) &&
                                 (path.StartsWithSegments("/notificationHub") || path.StartsWithSegments("/requestHub") || path.StartsWithSegments("/chatMessageHub")))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });


            //////// DB
            builder.Services.AddDbContext<Octa_DbContext>(
                op => op.UseSqlServer(builder.Configuration.GetConnectionString("con")));


            builder.Services.AddSingleton<GetConnectionStringService>(); // singleton as i use it in a middleware also
            builder.Services.AddScoped<DynamicDatabaseService>();
            builder.Services.AddScoped<DbContextFactoryService>();
            builder.Services.AddScoped<GenerateJWTService>();
            builder.Services.AddScoped<FileImageValidationService>();
            builder.Services.AddScoped<FileWordPdfValidationService>();
            builder.Services.AddScoped<FileValidationService>();
            builder.Services.AddScoped<CancelInterviewDayMessageService>();
            builder.Services.AddScoped<EmailService>();
            builder.Services.AddScoped<GenerateBarCodeEan13>();
            builder.Services.AddScoped<CheckPageAccessService>();
            builder.Services.AddScoped<InVoiceNumberCreate>();
            builder.Services.AddScoped<CalculateCurrentStock>();
            builder.Services.AddScoped<CreateStudentService>();
            builder.Services.AddScoped<RemoveAllRegistrationFormParentService>();
            builder.Services.AddScoped<SchoolHeaderService>();
            builder.Services.AddScoped<ICsrGenerator, CsrGenerator>();
            builder.Services.AddScoped<IEInvoiceSigner, EInvoiceSigner>();
            builder.Services.AddDefaultAWSOptions(builder.Configuration.GetAWSOptions());
            builder.Services.AddSingleton<IAmazonS3, AmazonS3Client>();
            builder.Services.AddScoped<DomainService>();
            builder.Services.AddScoped<IamNotRobot>();
            builder.Services.AddScoped<UserTreeService>();
            builder.Services.AddScoped<NotificationService>();
            builder.Services.AddScoped<RequestService>();
            builder.Services.AddScoped<ChatMessageService>();
            builder.Services.AddScoped<SendNotificationService>();
            builder.Services.AddScoped<ValidTeachersForStudentService>();

            builder.Services.AddAWSService<IAmazonSecretsManager>(new Amazon.Extensions.NETCore.Setup.AWSOptions
            {
                Region = RegionEndpoint.USEast1
            });

            /// 2)
            // builder.Services.AddCors(options =>
            // {
            //     options.AddPolicy(CorsPolicy, b =>
            //         b
            //             .AllowAnyOrigin()
            //             .AllowAnyMethod()
            //             .AllowAnyHeader()
            //             .WithExposedHeaders("Content-Disposition")
            //     );
            // });

            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(CorsPolicy, policy =>
                {
                    policy
                        .WithOrigins(allowedOrigins)
                        .SetIsOriginAllowedToAllowWildcardSubdomains()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithExposedHeaders("Content-Disposition")
                        .AllowCredentials();
                });
            });

            /// For generic repo:
            builder.Services.AddScoped<UOW>();


            /// For Auto Mapper:
            builder.Services.AddAutoMapper(typeof(AutoMapConfig).Assembly);
             

            builder.Services.Configure<IISServerOptions>(options =>
            {
                options.MaxRequestBodySize = 104857600; // 100 MB
            });

            builder.Services.Configure<KestrelServerOptions>(options =>
            {
                options.Limits.MaxRequestBodySize = 104857600; // 100 MB
            });


            builder.Services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
                options.Providers.Add<BrotliCompressionProvider>();
                options.Providers.Add<GzipCompressionProvider>();
                // Optionally, restrict to certain mime types (Angular outputs are text-based)
                options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
                    new[] { "application/json", "application/javascript", "text/css" });
            });

            builder.Services.AddMemoryCache();

            // SignalR for real-time features
            builder.Services.AddSignalR(hubOptions =>
            {
                //hubOptions.EnableDetailedErrors = true;
                hubOptions.EnableDetailedErrors = builder.Environment.IsDevelopment();
                hubOptions.KeepAliveInterval = TimeSpan.FromMinutes(1);
            });

            var app = builder.Build();

            /// 1) For DB Check
            //app.UseMiddleware<DbConnection_Check_Middleware>(); 
            /// 3)
            /// 

            app.UseResponseCompression();
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();

            // CORS must be after routing and before auth/authorization
            app.UseCors(CorsPolicy);

            // <— OPTIONAL but recommended: built-in exception handler that also stamps 
            //app.UseExceptionHandler(errorApp =>
            //{
            //    errorApp.Run(async context =>
            //    {
            //        // always add permissive CORS on error responses:
            //        var h = context.Response.Headers;
            //        h["Access-Control-Allow-Origin"] = "*";
            //        h["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Domain-Name";
            //        h["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
            //        h["Access-Control-Expose-Headers"] = "Content-Disposition";

            //        // log & return minimal JSON
            //        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
            //        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            //        if (feature?.Error is not null)
            //            logger.LogError(feature.Error, "Unhandled exception for {Path}", context.Request.Path);

            //        // don’t overwrite a specific status set by downstream, but default to 500
            //        if (context.Response.StatusCode < 400) context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            //        context.Response.ContentType = "application/json";
            //        await context.Response.WriteAsync("{\"error\":\"unhandled_server_error\"}");
            //    });
            //});
            app.UseExceptionHandler(errorApp =>
            {
                errorApp.Run(async context =>
                {
                    var h = context.Response.Headers;
                    h["Access-Control-Allow-Origin"] = "*";
                    h["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Domain-Name";
                    h["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
                    h["Access-Control-Expose-Headers"] = "Content-Disposition";

                    var feature = context.Features.Get<IExceptionHandlerFeature>();
                    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();

                    if (feature?.Error is not null && feature.Error is not OperationCanceledException)
                    {
                        if (app.Environment.IsDevelopment())
                        {
                            logger.LogError(feature.Error, "Unhandled exception for {Path}", context.Request.Path);
                        }
                        else
                        {
                            logger.LogError("Unhandled exception at {Path}", context.Request.Path);
                        }
                    }

                    if (context.Response.StatusCode < 400)
                        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsync("{\"error\":\"unhandled_server_error\"}");
                });
            });

            app.UseHttpsRedirection();

            // Resolve tenant for /api/with-domain *after* CORS, *before* auth:
            app.UseWhen(ctx =>
                ctx.Request.Path.StartsWithSegments("/api/with-domain", StringComparison.OrdinalIgnoreCase) ||
                ctx.Request.Path.StartsWithSegments("/notificationHub", StringComparison.OrdinalIgnoreCase) ||
                ctx.Request.Path.StartsWithSegments("/requestHub", StringComparison.OrdinalIgnoreCase) ||
                ctx.Request.Path.StartsWithSegments("/chatMessageHub", StringComparison.OrdinalIgnoreCase),
                branch =>
                {
                    branch.UseMiddleware<GetConnectionStringMiddleware>();
                });

            app.UseAuthentication();
            app.UseMiddleware<Endpoint_Authorization_Middleware>();
            app.UseAuthorization();
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.Urls.Add("http://0.0.0.0:5000");

            app.MapControllers();

            // Real-time hubs
            app.MapHub<NotificationHub>("/notificationHub").RequireAuthorization();
            app.MapHub<RequestHub>("/requestHub").RequireAuthorization();
            app.MapHub<ChatMessageHub>("/chatMessageHub").RequireAuthorization();

            app.MapFallbackToFile("index.html");

            app.Run(); 
        } 
    }
}
