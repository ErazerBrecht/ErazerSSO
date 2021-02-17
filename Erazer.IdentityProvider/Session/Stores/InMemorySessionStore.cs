using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Erazer.IdentityProvider.Session.Stores
{
    public class InMemorySessionStore: ISessionStore
    {
        private static readonly ConcurrentDictionary<string, Session> Sessions = new ConcurrentDictionary<string, Session>();

        public Task<Session> Get(string key, CancellationToken ct = default)
        {
            Sessions.TryGetValue(key, out var session);
            return Task.FromResult(session);
        }

        public Task<IList<Session>> GetAllByIdentityId(string userId, CancellationToken ct = default)
        {
            var sessions = Sessions.Select(s => s.Value).Where(s => s.IdentityId == userId).ToList();
            return Task.FromResult((IList<Session>) sessions);
        }

        
        public Task Upsert(Session session, CancellationToken ct = default)
        {
            Sessions.AddOrUpdate(session.HashedKey, session, (_, __) => session);
            return Task.CompletedTask;
        }
        
        public Task UpsertMany(IEnumerable<Session> sessions, CancellationToken ct = default)
        {
            foreach (var session in sessions)
            {
                Upsert(session, ct);
            }
            return Task.CompletedTask;
        }
    }
}