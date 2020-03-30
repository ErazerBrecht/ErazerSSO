using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Erazer.API.Session.Stores
{
    public class JwtStore: ISessionStore
    {
        public Task<SessionModel> GetSession(Claim sessionClaim, CancellationToken ct = default)
        {
            if (sessionClaim == null) throw new ArgumentNullException(nameof(sessionClaim));
            if (sessionClaim.ValueType != "json") throw new ArgumentException("Invalid claim type", nameof(sessionClaim));
            
            var session = JsonConvert.DeserializeObject<SessionModel>(sessionClaim.Value);
            return Task.FromResult<SessionModel>(session);
        }
    }
}