import vm from 'vm';
import fetch from 'node-fetch';

import session from './data/graphdb';

const codeRunner = async (mapper, params, reducer, currentNode) => {
  const foo = `
        ${mapper}
        ${reducer}
        mapper(${JSON.stringify(params)})
            .then(reducer)
    `;

  // console.log(foo, 'IS CODE >>>>>')
  const script = new vm.Script(foo);
  // console.log(currentNode, '<<<')
  const sb = {
    fetch,
    gdquery,
    session,
    currentNode: currentNode.low,
  };
  const result = script.runInNewContext(sb);
  return result;
};

const gdquery = async q => {
  // console.log('IN GDQ: ', q)
  const { records } = await session.run(q);
  const singleRecord = records[0];

  const nodes = {};

  const all = await singleRecord.keys.reduce(async (prev, key) => {
    const record = singleRecord.get(key);
    nodes[record.identity] = record;
    if (record.type === 'Call') {
      const params = record.properties;
      const mapperCode = nodes[record.end].properties.map;
      const reducerCode = nodes[record.end].properties.reduce;
      // console.log(mapperCode)
      const result = await codeRunner(mapperCode, params, reducerCode, record.end);
      const resultStr = JSON.stringify(result);
      await session.run(`MATCH (f) WHERE id(f) = ${record.start.low}
                               WITH f
                               MATCH (t) WHERE id(t) = ${record.end.low}
                               WITH f, t
                               MERGE (t)-[:Result {result: '${resultStr}'}]->(f) `);
      return result
    }
    return prev;
  }, null);

  return all;
};

export default async (req, res) => {
  const query = req.body.q;
  try {
    gdquery(query).then(r => {
      res.json(r);
    });
  } catch (e) {
    // console.log(e);
    res.json({ message: 'Error occured :(' });
  }
};
