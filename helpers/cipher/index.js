const crypto = require('crypto');

module.exports = {
    encryptText: async (message, password) => {
        try {
            // Generate a random IV (Initialization Vector)
            const iv = crypto.randomBytes(16);

            // Derive a 32-byte key using PBKDF2
            const salt = crypto.randomBytes(16);
            const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

            // Create a Cipher object with AES in CBC mode
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

            // Convert the message to a Buffer
            const messageBuffer = Buffer.from(message, 'utf-8');

            // PKCS7 padding
            const paddingLength = 16 - (messageBuffer.length % 16);
            const paddedMessage = Buffer.concat([messageBuffer, Buffer.alloc(paddingLength, paddingLength)]);

            // Encrypt the padded message
            const encryptedBuffer = Buffer.concat([cipher.update(paddedMessage), cipher.final()]);

            // Combine the IV and ciphertext
            const result = Buffer.concat([salt, iv, encryptedBuffer]);

            return result.toString('hex');
        } catch (error) {
            throw error;
        }
    },

    decryptText: async (encryptedHex, password) => {
        try {
            // Convert the hex-encoded string back to a Buffer
            const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
    
            // Extract the salt, IV, and ciphertext from the Buffer
            const salt = encryptedBuffer.slice(0, 16);
            const iv = encryptedBuffer.slice(16, 32);
            const ciphertext = encryptedBuffer.slice(32);
    
            // Derive the key using PBKDF2
            const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    
            // Create a Decipher object with AES in CBC mode
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
            // Decrypt the ciphertext
            let decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    
            // Remove PKCS7 padding
            const paddingLength = decryptedBuffer[decryptedBuffer.length - 1];
            decryptedBuffer = decryptedBuffer.slice(0, -paddingLength);
    
            return decryptedBuffer.toString('utf-8');
        } catch (error) {
            //! handle error

            throw error;
        }
    },
};