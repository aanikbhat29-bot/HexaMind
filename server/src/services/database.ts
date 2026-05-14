import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI } from '../config';

const client = new MongoClient(MONGODB_URI);
let database: Db;

export const connectDatabase = async () => {
  if (!database) {
    await client.connect();
    database = client.db();
  }
  return database;
};

export const getDatabase = () => {
  if (!database) throw new Error('Database connection is not established');
  return database;
};
