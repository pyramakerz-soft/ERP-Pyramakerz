namespace LMS_CMS_PL.Services
{
    public class GetConnectionStringService
    {

        //public string BuildConnectionString(string domainName)
        //{ 
        //    var dataSource = "octa-db.cxg0g2422n2v.us-east-1.rds.amazonaws.com,1433";
        //    var initialCatalog = domainName; 
        //    var userId = "admin";
        //    var password = "PyraDev1*";
        //    var trustServerCertificate = "TrustServerCertificate=True";

        //    return $"Data Source={dataSource};Initial Catalog={initialCatalog};User ID={userId};Password={password};{trustServerCertificate}";
        //}

        public string BuildConnectionString(string domainName)
        {

<<<<<<< HEAD


            var dataSource = "DESKTOP-531QG4Q";

=======
            var dataSource = "SW-13\\SQLEXPRESS";
>>>>>>> 5a10914c3d5af56a1b789f304e185dbf61ff0a0d
            var initialCatalog = domainName;

            return $"Data Source={dataSource};Initial Catalog={initialCatalog};Integrated Security = True;TrustServerCertificate=True";
        }
    }
}