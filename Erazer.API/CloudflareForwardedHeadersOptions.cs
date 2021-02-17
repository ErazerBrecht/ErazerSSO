using System.Collections.Generic;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.DependencyInjection;
using NetTools;

namespace Erazer.API
{
    public static class CloudflareForwardedHeadersOptions
    {
        private static IEnumerable<string> GetStrings(string url)
        {
            return new WebClient().DownloadString(url).Split('\n').Select(s => s.Trim()).ToArray();
        }

        private static IEnumerable<string> GetPrivateIps()
        {
            return new List<string>{"127.0.0.0/8", "169.254.0.0/16", "192.168.0.0/24", "172.16.0.0/16", "10.0.0/8"};
        }
        
        private static IEnumerable<string> GetCloudflareIps()
        {
            try
            {
                return GetStrings("https://www.cloudflare.com/ips-v4")
                    .Union(GetStrings("https://www.cloudflare.com/ips-v6")).ToArray();
            }
            catch
            {
                return @"173.245.48.0/20
                        103.21.244.0/22
                        103.22.200.0/22
                        103.31.4.0/22
                        141.101.64.0/18
                        108.162.192.0/18
                        190.93.240.0/20
                        188.114.96.0/20
                        197.234.240.0/22
                        198.41.128.0/17
                        162.158.0.0/15
                        104.16.0.0/12
                        172.64.0.0/13
                        131.0.72.0/22
                        2400:cb00::/32
                        2606:4700::/32
                        2803:f800::/32
                        2405:b500::/32
                        2405:8100::/32
                        2a06:98c0::/29
                        2c0f:f248::/32
                        ".Split('\n').Select(s => s.Trim()).ToArray();
            }
        }

        public static void AddCloudflareForwardHeaderOptions(this IServiceCollection collection)
        {
            var ips = GetCloudflareIps().Union(GetPrivateIps());

            collection.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardLimit = null;
                options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
                options.KnownProxies.Clear();
                options.KnownNetworks.Clear();
                
                foreach (var line in ips)
                {
                    if (IPAddressRange.TryParse(line, out var range))
                    {
                        options.KnownNetworks.Add(new IPNetwork(range.Begin, range.GetPrefixLength()));
                    }
                }
            });
        }
    }
}