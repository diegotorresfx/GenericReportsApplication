using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EncryptDecrypt
{
    internal interface ISecurity_BL
    {
        public (string PublicKey, string PrivateKey) GenerateKeys();
        public string EncryptLongData(string plainText, string publicKey);
        public string DecryptLongData(string cipher);
    }
}
