/* server/init.js
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script from PA03 as 
** inspiration, but you cannot just copy and paste it--you script has to do more
** to handle the addition of users to the data model.
*/

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Users = require('./models/users');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/phreddit'; 

// Expected CLI usage:
// node init.js <firstName> <lastName> <displayName> <email> <password>
const [,, firstName, lastName, displayName, email, password] = process.argv;

if (!firstName || !lastName || !displayName || !email || !password) {
  console.error('Usage: node init.js <firstName> <lastName> <displayName> <email> <password>');
  process.exit(1);
}

async function init() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await Users.findOne({ email });
    if (existing) {
      console.log('User with this email already exists.');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new Users({
      firstName,
      lastName,
      displayName,
      email,
      passwordHash,
      reputation: 1000, // default for admin
      isAdmin: true
    });

    await user.save();
    console.log('Admin user created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

init();