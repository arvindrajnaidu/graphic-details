/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './IDE.css';
import { element } from 'prop-types';
import Editor from './Editor';
import Panel from './Panel';
import { buildCode, getAllFunctions, getFunction } from './helper';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';

var libCoverage = require('istanbul-lib-coverage');

// import XTerm from './Xterm'

const d3 = require('d3');

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

const palette = {
  // gray: '#708284',
  // mediumgray: '#536870',
  // darkgray: '#475B62',

  // darkblue: '#0A2933',
  // darkerblue: '#042029',

  paleryellow: '#000',
  yellow: '#A57706',
  orange: '#BD3613',
  red: '#D11C24',
  pink: '#219ebc',
  purple: '#595AB7',
  blue: '#2176C7',
  green: '#259286',
  yellowgreen: '#ffb703',
};

const ALL_FUNCTIONS_Q =
  'match (fn:Function)-[impt: Imports]-(target:Function) return [fn], [impt]';
const ALL_RUNTIMES_Q =
  'match (r:Runtime) with r match (r:Runtime)-[h: Hosts]->(fn:Function) return h, r, fn';
const ALL = 'match (s)-[r]-(d) return s, r, d ';

const STEP_IN = name =>
  `MATCH path=(app:Function {name:'${name}'})-[*..100]->(:Function) RETURN nodes(path) as fn, relationships(path) as impt`;



const IDE = props => {
  const [query, setQuery] = useState(ALL_FUNCTIONS_Q);
  const [result, setResult] = useState({ nodes: [], links: [] });
  const [selected, setSelected] = useState(null);
  // const [lastRun, setLastRun] = useState();
  const [output, setOutput] = useState('');

  const lastRun = useRef();
  const editor = useRef();
  const outputRef = useRef();
  // const xtermRef = useRef();

  const classes = useStyles();

  const handleOnChange = e => {
    setQuery(e.target.value);
  };

  const resetColors = () => {
    let node = d3.select(editor.current)
                .selectAll('circle.node')
    // alert(node.selected)
      // d3.selectAll('circle')
      // .attr('fill', function (d, i) {
      //   let color =
      //       d.id === node.selected && node.selected.id
      //         ? palette.orange
      //         : palette.pink;
      //     return color;
      // })
  }

  useEffect(() => {
    var w = 400,
      h = 500;
    var circleWidth = 15;

    d3.select('svg').remove();

    if (!result.nodes.length) {
      return;
    }

    var vis = d3
      .select(editor.current)
      .append('svg:svg')
      .attr('class', 'stage')
      .attr('width', 900)
      .attr('height', 600);

    var force = d3.layout
      .force()
      .nodes(result.nodes)
      .links([])
      .gravity(0.1)
      .charge(-500)
      .size([w, h]);

    var link = vis
      .selectAll('.link')
      .data(result.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#CCC')
      .style('marker-mid', 'url(#arrow)')
      .attr('fill', 'none');

    var node = vis
      .selectAll('circle.node')
      .data(result.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')

      // MOUSEUP
      .on('mouseup', function(d, i) {
        d3.select(this)
          .selectAll('circle')
          .attr('fill', palette.yellowgreen);

        if (node.selected && parseInt(node.selected.id) !== parseInt(d.id)) {
          d3.select(node.selectedElement)
            .selectAll('circle')
            .attr('fill', palette.pink);
        }
        node.selected = d;
        node.selectedElement = this;
        setSelected(d);
      })
      .on('dblclick', function(d, i) {
        setQuery(STEP_IN(d.name));
        // d3.select(this)
        //   .selectAll('circle')
        //   .attr('fill', palette.yellowgreen)

        // if (node.selected && parseInt(node.selected.id) !== parseInt(d.id)) {
        //   d3.select(node.selectedElement)
        //   .selectAll('circle')
        //   .attr('fill', palette.pink)
        // }
        // node.selected = d
        // node.selectedElement = this
        // setSelected(d);
      })
      //MOUSEOVER
      .on('mouseover', function(d, i) {
        // if (i > 0) {
        //CIRCLE
        let color =
          parseInt(d.id) === parseInt(node.selected && node.selected.id)
            ? palette.yellowgreen
            : palette.pink;
        d3.select(this)
          .selectAll('circle')
          .transition()
          .duration(250)
          .style('cursor', 'none')
          .attr('r', circleWidth + 3)
          // .attr('fill', color);

        //TEXT
        d3.select(this)
          .select('text')
          .transition()
          .style('cursor', 'none')
          .duration(250)
          .style('cursor', 'none')
          .attr('font-size', '1.5em')
          .attr('x', 15)
          .attr('y', 5);
        // }
        // else {
        //   //CIRCLE
        //   d3.select(this)
        //     .selectAll('circle')
        //     .style('cursor', 'none');

        //   //TEXT
        //   d3.select(this)
        //     .select('text')
        //     .style('cursor', 'none');
        // }
      })

      //MOUSEOUT
      .on('mouseout', function(d, i) {
        // if (i > 0) {
        //CIRCLE
        let color =
          parseInt(d.id) === parseInt(node.selected && node.selected.id)
            ? palette.yellowgreen
            : palette.pink;
        d3.select(this)
          .selectAll('circle')
          .transition()
          .duration(250)
          .attr('r', circleWidth)
          // .attr('fill', color);

        //TEXT
        d3.select(this)
          .select('text')
          .transition()
          .duration(250)
          .attr('font-size', '1em')
          .attr('x', 8)
          .attr('y', 4);
        // }
      })

      .call(force.drag);

    //CIRCLE
    node
      .append('svg:circle')
      .attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      })
      .attr('r', circleWidth)
      .attr('class', function(d, i) {
        return `${d.name}_fn`;
      })
      .attr('fill', function(d, i) {
        // console.log('>>>', d.id, selected && selected.id)
        // if (i > 0) {
        let color =
          d.id === node.selected && node.selected.id
            ? palette.orange
            : palette.pink;
        // console.log(color)
        return color;
        // return palette.pink;
        // } else {
        //   return palette.paleryellow;
        // }
      });

    //TEXT
    node
      .append('text')
      .text(function(d, i) {
        return d.name;
      })
      .attr('x', function(d, i) {
        return circleWidth + 5;
      })
      .attr('y', function(d, i) {
        return circleWidth + 0;
      })
      .attr('font-family', 'Arial')
      .attr('fill', function(d, i) {
        return palette.paleryellow;
      })
      .attr('font-size', function(d, i) {
        return '1em';
      })
      .attr('text-anchor', function(d, i) {
        if (i > 0) {
          return 'beginning';
        } else {
          return 'end';
        }
      });

    force.on('tick', function(e) {
      node.attr('transform', function(d, i) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

      link
        .attr('x1', function(d) {
          return d.start.x;
        })
        .attr('y1', function(d) {
          return d.start.y;
        })
        .attr('x2', function(d) {
          return d.end.x;
        })
        .attr('y2', function(d) {
          return d.end.y;
        });
    });

    force.start();
  }, [result]);

  useEffect(() => {
    getAllFunctions().then(setResult)
    // xtermRef.current.terminal.writeln("Hello, World!")
  }, [query]);

  // useEffect(() => {
  //   // if (!Terminal) {
  //   //   return
  //   // }
  //   // var term = new Terminal();
  //   // term.open(terminal.current);
  //   // term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
  //   // term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
  // }, [Terminal])

  // useEffect(() => {
  //   if (selected) {
  //     // buildCode(selected).then(code => {
  //     //   // let wrappedCode = `${code}\n${selected.name}()`;
  //     //   // console.log(code)
  //     //   const transformedCode = Babel.transform(code, { presets: ['react'] })
  //     //     .code;
  //     //   console.log(transformedCode);
  //     //   var F = new Function(transformedCode);
  //     //   setOutput(F());
  //     // });
  //   }
  // }, [selected]);

  const saveCode = async code => {
    const q = `MATCH (fn :Function) WHERE ID(fn) = ${
      selected.id
    } SET fn.code = ${JSON.stringify(code)}`;
    await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q }),
    });
    // await getAllFunctions();
    setResult(await getAllFunctions())
    runCode();
  };

  const runCode = async () => {
    // ReactDOM.render(function () {
    //   return <div></div>
    // }, outputRef.current)
    resetColors()
    if (!lastRun.current) {
      lastRun.current = selected;
    }
    if (window.__coverage__) {
      delete window.__coverage__
    }

    let resp = await fetch(`/api/transformer?name=${selected.name}`);
    let transformedCode = await resp.text();

    // buildCode(lastRun.current).then(code => {
    //   // let wrappedCode = `${code}\n${selected.name}()`;
    //   // console.log(code)
    //   const transformedCode = Babel.transform(code, { presets: ['react'], })
    //     .code;
    // console.log(transformedCode);
    var F = new Function(transformedCode);
    setOutput(F());
    var map = libCoverage.createCoverageMap(__coverage__);
    // var summary = libCoverage.createCoverageSummary();

    // console.log(summary)
    map.files().forEach(function(f) {
      var fc = map.fileCoverageFor(f),
        s = fc.toSummary();
      if (s.data.functions.covered > 1) {
        let fnName = f.match(/.*\/(.*)\.js/)[1]
        let className = `${fnName}_fn`
        d3.selectAll(`.${className}`).attr('fill', 'red');
      }
      
      // summary.merge(s);
    });

    // console.log('Global summary', summary);
    // console.log('Global map', map);
    // console.log('coverage', __coverage__);

    // Object.keys(__coverage__).forEach(fileName => {
    //   let fnMap = __coverage__[fileName].fnMap;
    //   Object.keys(fnMap).forEach(fnKey => {
    //     if (fnMap[fnKey].name.endsWith('_fn')) {
    //       let className = fnMap[fnKey].name;

    //       // console.log(fnMap[fnKey])
    //       d3.selectAll(`.${className}`).attr('fill', 'red');
    //     }
    //   });
    // });
  };

  const addFunction = async name => {
    const q = `MERGE (t:Test)-[:Tests]->(f:Function {name: '${name}', code: ''})`;
    await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q }),
    });
    getAllFunctions();
  };

  // const addDockerImage = async name => {
  //   const q = `MERGE (f:Function {name: '${name}', code: ''})`;
  //   await fetch('/api/query', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ q }),
  //   });
  //   getAllFunctions();
  // };

  const removeFunction = async name => {
    const q = `MATCH (f:Function {name: '${name}'}) detach delete f`;
    await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q }),
    });
    setResult(await getAllFunctions())
  };

  const addImport = async rel => {
    const arr = rel.split(' ');
    const q = `MATCH (s:Function {name: ${JSON.stringify(arr[0])}}) WITH s
    MATCH (d:Function {name: ${JSON.stringify(arr[1])}}) WITH s, d
    MERGE (s)-[i:Imports {name: ${JSON.stringify(arr[1])}}]->(d)
   `;
    console.log(q);
    await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q }),
    });
    setResult(await getAllFunctions())
  };

  const removeImport = async rel => {
    const arr = rel.split(' ');
    const q = `MATCH (s:Function {name: ${JSON.stringify(
      arr[0],
    )}})-[i:Imports]->(d:Function {name: ${JSON.stringify(arr[1])}})
    DETACH DELETE i
   `;
    console.log(q);
    await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q }),
    });
    setResult(await getAllFunctions())
  };

  return (
    <div className={classes.root} style={{ padding: 30 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  fontFamily: 'Roboto',
                  fontWeight: 600,
                  padding: 10,
                  fontSize: '1.8rem',
                }}
              >
                Graphic Details
              </div>
              <div style={{ fontFamily: 'Roboto', margin: 10 }}>
                A Graph Based IDE
              </div>
            </div>

            <Panel
              addFunction={addFunction}
              addImport={addImport}
              removeImport={removeImport}
              removeFunction={removeFunction}
            />
          </div>
        </Grid>
        <Grid item xs={3}>
          <div
            style={{
              backgroundColor: '#ffe8d6',
              height: '100%',
              width: '100%',
              overflowWrap: 'break-word',
              padding: 5,
              overflow: 'scroll',
              maxHeight: 650,
            }}
            ref={outputRef}
            id="outputDiv"
          ></div>
        </Grid>
        <Grid
          item
          xs={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {/* <FormControl style={{ flex: 3, margin: 10 }}>
              <InputLabel id="demo-simple-select-label">Query</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={query}
                onChange={event => {
                  setQuery(event.target.value);
                }}
              >
                <MenuItem value={ALL_FUNCTIONS_Q}>All Functions</MenuItem>
                <MenuItem value={ALL_RUNTIMES_Q}>Runtimes</MenuItem>
                <MenuItem value={ALL}>All</MenuItem>                
              </Select>
            </FormControl> */}
            <Button
              disabled={!selected}
              style={{ flex: 1, margin: 10 }}
              variant="contained"
              color="primary"
              onClick={() => {
                runCode();
              }}
            >
              Trace
            </Button>
            <Button
              disabled={!selected}
              style={{ flex: 1, margin: 10 }}
              variant="contained"
              color="primary"
              onClick={() => {
                runCode();
              }}
            >
              Run
            </Button>
            <Button
              disabled={!selected}
              style={{ flex: 1, margin: 10 }}
              variant="contained"
              color="success"
              onClick={() => {
                getFunction(selected.name).then(setResult)
              }}
            >
              Test View
            </Button>
          </div>
          <div style={{ flex: 1 }} ref={editor}></div>
        </Grid>
        <Grid item xs={3}>
          {selected ? (
            <Editor
              style={{
                // flex: 1,
                width: '100%',
                height: '100%',
                // backgroundColor: '#cb997e',
              }}
              fnCode={selected.code || ''}
              saveCode={saveCode}
              addFunction={addFunction}
            />
          ) : null}
        </Grid>
        {/* <Grid item xs={6}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid> */}
        <Grid item xs={12}>
          {/* <XTerm /> */}
          {/* <div style={{ display: 'flex', justifyContent: 'space-between' }} ref={terminal}> 
            
          </div> */}
        </Grid>
      </Grid>
    </div>
  );
};

export default withStyles(s)(IDE);
