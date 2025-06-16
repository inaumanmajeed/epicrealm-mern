import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { connectToDatabase } from './db/index.js';
import { PORT } from './constants.js';
import {app} from './app.js';

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });
