using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Erazer.IdentityProvider.Session
{
    public interface ISessionStore
    {
        Task<Session> Get(string key, CancellationToken ct = default);
        Task<IList<Session>> GetAllByIdentityId(string userId, CancellationToken ct = default);
        Task Upsert(Session session, CancellationToken ct = default);
        Task UpsertMany(IEnumerable<Session> sessions, CancellationToken ct = default);
    }
}