using System.Threading.Tasks;

namespace Erazer.IdentityProvider.Session
{
    public interface ISessionStore
    {
        Task<Session> Get(string key);
        Task Upsert(Session session);
    }
}