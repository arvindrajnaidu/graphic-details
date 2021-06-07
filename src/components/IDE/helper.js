const getDependencyCode = result => {
  const sorted = result.sort(
    (a, b) => b._fields[0].length - a._fields[0].length,
  );

  let longestArrLen = sorted[0]._fields[0].length;
  //   console.log('BASE code', baseCode)
  const code = [];
  const codeNames = {};
  while (longestArrLen) {
    sorted.forEach(record => {
      // console.log(record._fields)
      let fn = record._fields[0][longestArrLen];
      // console.log(fn)
      if (fn) {
        // console.log('>>>', fn.properties.name, longestArrLen)
        if (!codeNames[fn.properties.name]) {
          code.push(fn);
          codeNames[fn.properties.name] = true;
        }
        code[fn.properties.name] = fn;
      }
    });
    longestArrLen--;
  }

  const finalCode = code.reduce((acc, curr) => {
    return `${acc}\nconst ${curr.properties.name} = (function () {${curr.properties.code}})();`;
  }, `const __DOM_OUTPUT_CONTAINER__ = document.querySelector('#outputDiv');\n`);
  return finalCode;
};

export const buildCode = async node => {
  const q = `
        MATCH path=(app:Function {name:'${node.name}'})-[*..100]->(:Function)
        RETURN nodes(path) as fns
    `;
  const data = await fetch('/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q }),
  });
  const result = await data.json();
  console.log(result);

  if (result.length === 0) {
    return `const ${node.name} = (function () {${node.code}})();`;
    // return `const ${node.name} = (function () {${node.code}})();`
    // return node.code
  }

  let baseNodeProps = result[0]._fields[0][0].properties;
//   const baseCode = `const ${baseNodeProps.name} = ${baseNodeProps.code}`;
  const baseCode = `const ${baseNodeProps.name} = (function () {${baseNodeProps.code}})();`;
//   const baseCode = baseNodeProps.code
  const finalCode = getDependencyCode(result);
  return `${finalCode}\n ${baseCode}`;
};

export const getAllFunctions = async () => {
  const ALL_FUNCTIONS_Q =
  'match (fn:Function)-[impt: Imports]-(target:Function) return [fn], [impt]';

  const data = await fetch('/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: ALL_FUNCTIONS_Q,
    }),
  });
  const records = await data.json();
  // console.log('records', records);
  const newResult = records.reduce(
    (acc, r) => {
      let fnFields = r._fields[0];
      // console.log(fnField, '>>>>>')
      fnFields.forEach(fnField => {
        acc.nodes[fnField.identity.low] = {
          ...fnField.properties,
          type: fnField.labels[0],
          id: fnField.identity.low,
        };
      });

      let relFields = r._fields[1];
      relFields.forEach(relField => {
        acc.links[relField.identity.low] = {
          start: relField.start.low,
          end: relField.end.low,
        };
      });

      return acc;
    },
    { nodes: {}, links: {} },
  );
  console.log(newResult);

  newResult.links = Object.keys(newResult.links).map(id => {
    let link = newResult.links[id];
    return {
      start: newResult.nodes[link.start],
      end: newResult.nodes[link.end],
    };
  });

  newResult.nodes = Object.keys(newResult.nodes).map(n => newResult.nodes[n]);

  // console.log(newResult);
  return newResult
};

export const getFunction = async (name) => {
  const query = `MATCH (t:Test)-[tsts:Tests]-(fn:Function)-[impt: Imports]->(target: Function) where fn.name='${name}' RETURN [fn], [target], [t], [tsts], [impt]`;

  const data = await fetch('/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
    }),
  });
  const records = await data.json();
  console.log('records', records);
  const newResult = records.reduce(
    (acc, r) => {
      for (let i of [0,1,2]) {
        let fnFields = r._fields[i];
        fnFields.forEach(fnField => {
          acc.nodes[fnField.identity.low] = {
            ...fnField.properties,
            type: fnField.labels[0],
            id: fnField.identity.low,
          };
        });  
      }

      for (let i of [3,4]) {
        let relFields = r._fields[i];
        relFields.forEach(relField => {
          acc.links[relField.identity.low] = {
            start: relField.start.low,
            end: relField.end.low,
          };
        });
      }
      return acc;
    },
    { nodes: {}, links: {} },
  );
  console.log(newResult);

  newResult.links = Object.keys(newResult.links).map(id => {
    let link = newResult.links[id];
    return {
      start: newResult.nodes[link.start],
      end: newResult.nodes[link.end],
    };
  });

  newResult.nodes = Object.keys(newResult.nodes).map(n => newResult.nodes[n]);

  // console.log(newResult);
  return newResult
};