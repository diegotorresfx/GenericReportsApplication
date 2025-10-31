using System;
using System.Security.Cryptography;
using System.Text;

namespace EncryptDecrypt
{
    public class Security : ISecurity_BL
    {

        // Clave privada en Base64, proveniente por ejemplo de una variable de entorno
        private readonly string _privateKey = Environment.GetEnvironmentVariable("privateKey");

        public (string PublicKey, string PrivateKey) GenerateKeys()
        {
            using var rsa = RSA.Create(2048);
            var publicKey = Convert.ToBase64String(rsa.ExportRSAPublicKey());
            var privateKey = Convert.ToBase64String(rsa.ExportRSAPrivateKey());
            return (publicKey, privateKey);
        }

        public string EncryptLongData(string plainText, string _publicKey)
        {
            // 1. Crear clave AES
            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.GenerateKey();
            aes.GenerateIV();

            byte[] encryptedData;
            using (var encryptor = aes.CreateEncryptor(aes.Key, aes.IV))
            {
                var plainBytes = Encoding.UTF8.GetBytes(plainText);
                encryptedData = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);
            }

            using var rsa = RSA.Create();
            rsa.ImportRSAPublicKey(Convert.FromBase64String(_publicKey), out _);


            var encryptedKey = rsa.Encrypt(aes.Key, RSAEncryptionPadding.OaepSHA256);

            var finalString =
                Convert.ToBase64String(encryptedKey) + "|" +
                Convert.ToBase64String(aes.IV) + "|" +
                Convert.ToBase64String(encryptedData);

            return finalString;
        }

        public string DecryptLongData(string cipher)
        {
            try
            {
                var parts = cipher.Split('|');
                if (parts.Length != 3)
                {
                    throw new ArgumentException("El texto cifrado no tiene el formato esperado.");
                }

                var encryptedKey = Convert.FromBase64String(parts[0]);
                var iv = Convert.FromBase64String(parts[1]);
                var encryptedData = Convert.FromBase64String(parts[2]);

                // 1. Descifrar la clave AES con RSA privada
                using var rsa = RSA.Create();
                rsa.ImportRSAPrivateKey(Convert.FromBase64String(_privateKey), out _);
                var aesKey = rsa.Decrypt(encryptedKey, RSAEncryptionPadding.OaepSHA256);

                // 2. Descifrar los datos con AES
                using var aes = Aes.Create();
                aes.Key = aesKey;
                aes.IV = iv;

                using var decryptor = aes.CreateDecryptor();
                var decryptedBytes = decryptor.TransformFinalBlock(encryptedData, 0, encryptedData.Length);
                var decryptedText = Encoding.UTF8.GetString(decryptedBytes);

                return decryptedText;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
