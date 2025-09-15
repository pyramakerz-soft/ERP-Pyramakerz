namespace LMS_CMS_PL.Attribute
{ 
    [AttributeUsage(
       AttributeTargets.Class | AttributeTargets.Method | AttributeTargets.Constructor, // Include constructors
       AllowMultiple = false,
       Inherited = true
   )]
    public class CheckSuspensionAttribute : System.Attribute
    {
    }
}
