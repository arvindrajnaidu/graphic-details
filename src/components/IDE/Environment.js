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
 import { buildCode } from './helper';
 
 import { makeStyles } from '@material-ui/core/styles';
 import Paper from '@material-ui/core/Paper';
 import Grid from '@material-ui/core/Grid';
 
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
   pink: '#C61C6F',
   purple: '#595AB7',
   blue: '#2176C7',
   green: '#259286',
   yellowgreen: '#000',
 };
 
 const Functions = props => {
   const [query, setQuery] = useState('');
   const [result, setResult] = useState({ nodes: [], links: [] });
   const [selected, setSelected] = useState();
   const [output, setOutput] = useState('');
   const editor = useRef();
 
   const classes = useStyles();
 
   const handleOnChange = e => {
     setQuery(e.target.value);
   };
 
   const getAllNodes = async () => {
     const data = await fetch('/api/query', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         q:
           'match (fn :Function) with fn match (source:Function)-[impt: Imports]->(target:Function) return impt, fn',
           // `MATCH path=(app:Function {name:'app'})-[*..100]->(:Function) RETURN nodes(path) as fn impt, fn, source, target`,
       }),
     });
     const records = await data.json();
     const newResult = records.reduce(
       (acc, r) => {
         r.keys.forEach(key => {
           let field = r._fields[r._fieldLookup[key]];
           if (field.labels && field.labels.indexOf('Function') > -1) {
             acc.nodes[field.identity.low] = {
               type: 'function',
               id: field.identity.low,
               ...field.properties,
             };
           } else if (field.type === 'Imports') {
             acc.links[`${field.start.low}${field.end.low}`] = {
               start: field.start.low,
               end: field.end.low,
             };
           }
         });
         return acc;
       },
       { nodes: {}, links: {} },
     );
 
     newResult.links = Object.keys(newResult.links).map(id => {
       let link = newResult.links[id];
       return {
         start: newResult.nodes[link.start],
         end: newResult.nodes[link.end],
       };
     });
 
     newResult.nodes = Object.keys(newResult.nodes).map(n => newResult.nodes[n]);
 
     // console.log(newResult)
     setResult(newResult);
   };
 
   useEffect(() => {
     var w = 400, h = 500;
     var circleWidth = 10;
 
     if (!result.nodes.length) {
       return;
     }
 
     d3.select('svg').remove();
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
         setSelected(d);
       })
       //MOUSEOVER
       .on('mouseover', function(d, i) {
         // if (i > 0) {
         //CIRCLE
         d3.select(this)
           .selectAll('circle')
           .transition()
           .duration(250)
           .style('cursor', 'none')
           .attr('r', circleWidth + 3)
           .attr('fill', palette.orange);
 
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
         d3.select(this)
           .selectAll('circle')
           .transition()
           .duration(250)
           .attr('r', circleWidth)
           .attr('fill', palette.pink);
 
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
       .attr('fill', function(d, i) {
         // if (i > 0) {
         return palette.pink;
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
     getAllNodes();
   }, []);
 
   useEffect(() => {
     if (selected) {
       buildCode(selected).then(code => {
         // let wrappedCode = `${code}\n${selected.name}()`;
         // console.log(code)
         const transformedCode = Babel.transform(code, { presets: ['react'] })
           .code;
         console.log(transformedCode);
         var F = new Function(transformedCode);
         setOutput(F());
       });
     }
   }, [selected]);
 
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
 
     // buildCode(selected).then(code => {
     //   const transformedCode = Babel.transform(code, { presets: ['react'] })
     //     .code;
     //   console.log(transformedCode);
     //   var F = new Function(transformedCode);
     //   setOutput(F());
     // });
   };
 
   const addFunction = async name => {
     const q = `MERGE (f:Function {name: '${name}', code: ''})`;
     await fetch('/api/query', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ q }),
     });
     getAllNodes();
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
   //   getAllNodes();
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
     getAllNodes();
   };
 
   const addImport = async rel => {
     const arr = rel.split(' ');
     const q = `MATCH (s:Function {name: ${JSON.stringify(arr[0])}}) WITH s
     MATCH (d:Function {name: ${JSON.stringify(arr[1])}}) WITH s, d
     MERGE (s)-[i:Imports {name: ${JSON.stringify(arr[1])}}]->(d)
    `;
    console.log(q)
     await fetch('/api/query', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ q }),
     });
     getAllNodes();
   };
 
   const removeImport = async rel => {
     const arr = rel.split(' ');
     const q = `MATCH (s:Function {name: ${JSON.stringify(arr[0])}})-[i:Imports]->(d:Function {name: ${JSON.stringify(arr[1])}})
     DETACH DELETE i
    `;
    console.log(q)
     await fetch('/api/query', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ q }),
     });
     getAllNodes();
   };
 
   return (
     <div className={classes.root}>
       <Grid container spacing={3}>
         <Grid item xs={12}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <h1>Graphic Details</h1>
             <Panel addFunction={addFunction} addImport={addImport} removeImport={removeImport} removeFunction={removeFunction} />
           </div>
         </Grid>
         <Grid item xs={3}>
           <div
             style={{
               backgroundColor: 'red',
               height: '50%',
               width: '100%',
               padding: 5,
             }}
             id="outputDiv"
           ></div>
           <div
             style={{
               backgroundColor: '#333',
               height: '50%',
               width: '100%',
               padding: 5,
               color: '#FFF'
             }}
             id="consoleDiv"
           >
             {output === undefined ? 'undefined': output}
           </div>
         </Grid>
         <Grid item xs={6}>
           <div style={{ flex: 1 }} ref={editor}></div>
         </Grid>
         <Grid item xs={3}>
           {selected ? (
             <Editor
               style={{
                 flex: 1,
                 width: '100%',
                 height: '100%',
                 // backgroundColor: 'green',
               }}
               fnCode={selected.code}
               saveCode={saveCode}
               addFunction={addFunction}
             />
           ) : null}
         </Grid>
         {/* <Grid item xs={6}>
             <Paper className={classes.paper}>xs=3</Paper>
           </Grid> */}
       </Grid>
     </div>
   );
 };
 
 export default withStyles(s)(Functions);
 