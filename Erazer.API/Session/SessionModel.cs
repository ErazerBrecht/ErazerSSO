using System;

namespace Erazer.API.Session
{
    public class SessionModel
    {
        public string HashedKey { get; set; }
        
        public DateTimeOffset Start { get; set; }
        public DateTimeOffset End { get; set; }

        public string IdentityId { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
    }
}