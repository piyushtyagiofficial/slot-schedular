import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

export { db };
export default db;
