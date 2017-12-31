using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;

namespace Erazer.Web.Legacy
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseWebRoot(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "dist"))
                .UseUrls("http://localhost:5001")
                .Build();
    }
}
