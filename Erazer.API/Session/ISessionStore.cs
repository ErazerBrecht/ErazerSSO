using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace Erazer.API.Session
{
    public interface ISessionStore
    {
        Task<SessionModel> GetSession(Claim sessionClaim, CancellationToken ct = default);
    }
}