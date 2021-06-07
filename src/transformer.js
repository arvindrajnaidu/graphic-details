import vm from 'vm';
import fetch from 'node-fetch';
import driver from './data/graphdb';
var babel = require('babel-core');

const getDependencyCode = async result => {
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

  let acc = `const __DOM_OUTPUT_CONTAINER__ = document.querySelector('#outputDiv');\n`
  for (let curr of code) {
    let wrappedCode = `const ${curr.properties.name} = (function ${curr.properties.name}_fn() {${curr.properties.code}})();`;

    const transformedCode = await babel.transform(wrappedCode, {
        filename: `${curr.properties.name}.js`,
        plugins: [
            'istanbul'
        ],
        "presets": [
          "@babel/react",
        ]
      })
    // console.log(acc, '<<< ACC')
    acc = `${acc}\n${transformedCode.code}`
  }

  return acc
//   const finalCode = code.reduce(async (acc, curr) => {
//     let wrappedCode = `const ${curr.properties.name} = (function ${curr.properties.name}_fn() {${curr.properties.code}})();`;

//     const transformedCode = await babel.transform(wrappedCode, {
//         filename: `${curr.properties.name}.js`,
//         plugins: [
//             'istanbul'
//         ],
//         "presets": [
//           "@babel/react",
//         ]
//       })
//     console.log(acc, '<<< ACC')
//     return `${acc}\n${transformedCode.code}`
//     // return `${acc}\n(function ${curr.properties.name}() {${curr.properties.code}})()`;
//   }, `const __DOM_OUTPUT_CONTAINER__ = document.querySelector('#outputDiv');\n`);
//   return finalCode;
};

const buildCode = async name => {
  const q = `
          MATCH path=(app:Function {name:'${name}'})-[*..100]->(:Function)
          RETURN nodes(path) as fns
      `;
  const session = driver.session();
  const { records } = await session.run(q);

  // const result = await data.json();
//   console.log(records);

  if (records.length === 0) {
    return `const ${name} = (function () {${"console.log('')"}})();`;
    // return `const ${name} = (function () {${node.code}})();`
    // return node.code
  }

  let baseNodeProps = records[0]._fields[0][0].properties;
  //   const baseCode = `const ${baseNodeProps.name} = ${baseNodeProps.code}`;
  const baseCode = `const ${baseNodeProps.name} = (function () {${baseNodeProps.code}})();`;

  const transformedBaseCode = await babel.transform(baseCode, {
    filename: `${baseNodeProps.name}.js`,
    plugins: [
        'istanbul'
    ],
    "presets": [
      "@babel/react",
    ]
  })

  //   const baseCode = baseNodeProps.code
//   console.log(JSON.stringify(records, null, 2))
    console.log(records.length)
  const finalCode = await getDependencyCode(records);

//   console.log('>>>>> Final code', finalCode)
  return `${finalCode}\n ${transformedBaseCode.code}`;
};

// babel.transform("code();", options);

export default async (req, res) => {
  const name = req.query.name;
  try {
    let code =  await buildCode(name);

    // const {code} = await babel.transform(rawCode, {
    //     filename: `${name}.js`,
    //     plugins: [
    //         'istanbul'
    //     ],
    //     "presets": [
    //       "@babel/react",
    //     ]
    //   })
    
    res.send(code);
  } catch (e) {
    console.log(e);
    res.json({ message: 'Error occured :(' });
  }
};
