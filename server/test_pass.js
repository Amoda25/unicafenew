const bcrypt = require('bcryptjs');
const hash = '$2b$10$38Ce7suG4aijasKMHUfIrOhyPATpZ/kAa4Jc5BMC7y5tngMUSo/Oi';
const pass = 'admin123';

bcrypt.compare(pass, hash).then(res => {
    console.log(`Password 'admin123' match: ${res}`);
});
