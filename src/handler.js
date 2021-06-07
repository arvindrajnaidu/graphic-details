import vm from 'vm';
import fetch from 'node-fetch';

import driver from './data/graphdb';

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
    session: driver.session(),
    currentNode: currentNode.low,
  };
  const result = script.runInNewContext(sb);
  return result;
};

const gdquery = async q => {
  // console.log('IN GDQ: ', q)
  try {
    const session = driver.session()
    const { records } = await session.run(q);
    // console.log(records)
    session.close()
    return records
    // const singleRecord = records[0];
  
    // // console.log(singleRecord)
    // const nodes = {};
  
    // const all = await singleRecord.keys.reduce(async (prev, key) => {
    //   const record = singleRecord.get(key);

    //   console.log(record)
    //   nodes[record.identity] = record;
    //   // if (record.type === 'Call') {
    //   //   // console.log('WELL<<<')
    //   //   const params = record.properties;
    //   //   const mapperCode = nodes[record.end].properties.map;
    //   //   const reducerCode = nodes[record.end].properties.reduce;
    //   //   // console.log(mapperCode)
    //   //   const result = await codeRunner(mapperCode, params, reducerCode, record.end);
    //   //   const resultStr = JSON.stringify(result);
    //   //   console.log(resultStr)
    //   //   await session.run(`MATCH (f) WHERE id(f) = ${record.start.low}
    //   //                            WITH f
    //   //                            MATCH (t) WHERE id(t) = ${record.end.low}
    //   //                            WITH f, t
    //   //                            MERGE (t)-[:Result {result: '${resultStr}'}]->(f) `);
    //   //   return result
    //   // }
    //   return prev;
    // }, null);
  
    // return all;
  } catch (e) {
    console.log(e)
    return null
  }

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
