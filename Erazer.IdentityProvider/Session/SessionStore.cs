using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace Erazer.IdentityProvider.Session
{
    public interface ISessionStore
    {
        Task<Session> Get(string key);
        Task Upsert(Session session);
    }
    
    public class InMemorySessionStore: ISessionStore
    {
        private static readonly ConcurrentDictionary<string, Session> Sessions = new ConcurrentDictionary<string, Session>();

        public Task<Session> Get(string key)
        {
            Sessions.TryGetValue(key, out var session);
            return Task.FromResult(session);
        }

        public Task Upsert(Session session)
        {
            Sessions.AddOrUpdate(session.HashedKey, session, (_, __) => session);
            return Task.CompletedTask;
        }
    }
}