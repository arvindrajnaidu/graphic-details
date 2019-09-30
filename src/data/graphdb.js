import { v1 } from 'neo4j-driver';

const neo4j = v1;

const driver = neo4j.driver(
  'bolt://localhost',
  neo4j.auth.basic('neo4j', 'hack'),
);

const session = driver.session();

export default session;
