namespace LMS_CMS_PL.Services
{
    public class GetConnectionStringService
    {

        public string BuildConnectionString(string domainName)
        { 
           var dataSource = "awseb-e-z2aaakjmbk-stack-awsebrdsdatabase-dhhclswif7dt.cxg0g2422n2v.us-east-1.rds.amazonaws.com,1433";
           var initialCatalog = domainName; 
           var userId = "pyraerp";
           var password = "erppyra*";
           var trustServerCertificate = "TrustServerCertificate=True";


           return $"Data Source={dataSource};Initial Catalog={initialCatalog};User ID={userId};Password={password};{trustServerCertificate}";
        }

        // public string BuildConnectionString(string domainName)  
        // {       
        //     var dataSource = ".";          

        //     var initialCatalog = domainName;

        //     return $"Data Source={dataSource};Initial Catalog={initialCatalog};Integrated Security = True;TrustServerCertificate=True";
        
        // }
    }
}