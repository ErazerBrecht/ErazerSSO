using System;

namespace Erazer.IdentityProvider.Session
{
    public class Session
    {
        public string HashedKey { get; set; }
        
        public DateTimeOffset Start { get; set; }
        public DateTimeOffset End { get; set; }

        public string IdentityId { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
    }
}