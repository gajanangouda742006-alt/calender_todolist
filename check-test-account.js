
require('dotenv').config();

const { connectMongo, mongoose } = require('./backend/config/mongo');
const { User } = require('./backend/models');

async function main() {
  const email = process.env.SAHRA_TEST_EMAIL;

  if (!email) {
    throw new Error('Set SAHRA_TEST_EMAIL before running this check.');
  }

  if (!(await connectMongo())) {
    throw new Error('MongoDB connection failed.');
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase()
  }).select('_id email');

  console.log(
    user ? 'ACCOUNT_EXISTS: yes' : 'ACCOUNT_EXISTS: no'
  );
}

main()
  .catch((error) => {
    console.error('Check failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
