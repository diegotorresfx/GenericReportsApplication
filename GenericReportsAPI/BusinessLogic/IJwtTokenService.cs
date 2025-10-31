using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogic
{
    public interface IJwtTokenService
    {
        string CreateToken(string username, IEnumerable<Claim>? extraClaims = null);
    }
}
