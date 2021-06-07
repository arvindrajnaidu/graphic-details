## What it does

Graphic Details is an API orchestration layer in a Graph Database. The resolvers are modeled as attributes of nodes in a graph that execute in order to give results. It also lays out clearly how the orchestration is accomplished.

## Inspiration

We have been writing code in files and deploying bundles of code in our servers for ages. I wonder what it would be like if we were to code in files and deploy them as nodes in a graph data base instead.

Also, API orchestration using Graphql does not really feel like I am querying a graph database. It feels more like remote procedure calls with filtered results

## Running it

### DB Configuration

'bolt://localhost'

username:password = neo4j:hack

### Data setup - 3 commands

    MATCH (n) detach delete n;

    MERGE(app: Function {name: 'app', code: '() => welcome()'}) -[:Imports {name: 'welcome'}]->(welcome: Function {name: 'welcome', code: '() => greet()'})-[:Imports {name: 'greet'}]->(greet: Function {name: 'greet', code: "() => 'Hi'"})

    MERGE(:Function {name: 'foo', code: '() => bar()'}) -[:Imports {name: 'bar'}]->(bar: Function {name: 'bar', code: '() => 1'})

    MATCH (fn: Function {name: 'Welcome'})
    WITH fn
    MERGE (fn)-[:Imports]->(l:Function {name: 'log', code: '(...args) => console.log(...args)'})

    MATCH path=(app:Function {name:'App'})-[*..10000]->(:Function)
    RETURN nodes(path) as rels, app

    MERGE (n:Function {name: 'React', url: 'https://unpkg.com/react@17/umd/react.development.js'}) 
    MERGE (n:Function {name: 'ReactDom', url: 'https://unpkg.com/react-dom@17/umd/react-dom.development.js'}) 

    with app
    MERGE (welcome: Function {name: 'Welcome', code: '() => return welcome()'})
    WITH app, welcome

    MERGE (app: Function {name: 'App', code: "function App() { return ( <div> <Welcome name='Sara' /> <Welcome name='Cahal' /> </div>);}'"})
    WITH welcome, app
    MERGE (app)-[d: Imports {name: 'Welcome'}]->(welcome)


<!-- Create a relationship -->

match (f:Function {name: 'bar'}) 
with f
match (r:Function {name: 'ReactDom'}) 
with f, r
merge(f)-[:Imports {name: 'ReactDom'}]->(r)


    MERGE (r:Resolver {map: "const mapper = ({userId}) => fetch(`https://hacker-news.firebaseio.com/v0/user/${userId}.json`).then((data) => data.json())", reduce: "const reducer = (data) => data.submitted.length", name: "hackernews"});

    MERGE (r:Resolver {map: "const mapper = async ({userId}) => {
    return Promise.resolve({
    firstCharacter: userId.split('')[0],
    submissions: await gdquery(`MATCH (r:Resolver {name: 'hackernews'})
    WITH r
    MATCH (req) WHERE id(req) = ${currentNode}
    WITH r, req
    MERGE (req)-[c:Call {userId: \"${userId}\"}]->(r)
    return r, req, c`)
    })
    }", reduce: "const reducer = (data) => data", name: "userSubmissions"});

### Git clone

### yarn install && yarn start

### Go to http://localhost:3000

### Press submit.

You should see the result appear below. Also examine the local DB to see how the resolvers were invoked.


CALL apoc.cypher.runFile("export.cypher");



## Inspiration
My son uses the [Blockly Programming Language](https://developers.google.com/blockly) to code up his new [Sphero Robot](https://sphero.com/) to do tricks. I thought Blockly was really cool.

I wished I could visualize my source code at work the same way. Just like we zoom-in, click and play with Google Maps .. could we also get a 10,000 ft view of a project's source code and zoom-in, click and develop software?

## What it does
Graphic Details helps you visualize, build and run Javascript Code. It is a Graph Based IDE for coding.  All code is broken down into functions .. which become nodes. All dependencies between functions become links.

## How we built it
It is built on Javascript.

## Challenges we ran into
Figuring out the right Cypher Queries.

## Accomplishments that we're proud of
I think I can code an entire React App using this IDE.

## What we learned
Graphs could bring in a paradigm shift for developers to move away from coding in files to coding in a graph. It is much more friendly to understand and visualize.

## What's next for Graphic Details
1) Server side coding
2) Visualizing Tests  and Coverage.