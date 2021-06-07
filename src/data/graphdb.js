import { v1 } from 'neo4j-driver';
// const neo4j = require('neo4j-driver')

const neo4j = v1;

const driver = neo4j.driver(
  'bolt://localhost',
  neo4j.auth.basic('neo4j', 'hack'),
  { encrypted: false } 
);

// const session = driver.session();

export default driver;
