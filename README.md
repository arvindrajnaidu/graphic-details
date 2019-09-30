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

    MERGE (r:Resolver {map: "const mapper = ({userId}) => fetch(`https://hacker-news.firebaseio.com/v0/user/${userId}.json`).then((data) => data.json())", reduce: "const reducer = (data) => data.submitted.length", name: "hackernews"});

    MERGE (r:Resolver {map: "const mapper = async ({userId}) => {
    return Promise.resolve({
    firstCharacter: userId.split('')[0],
    submissions: await gdquery(`MATCH (r:Resolver {name: 'hackernews'})
    WITH r
    MATCH (req) WHERE id(req) = ${currentNode}
    WITH r, req
    MERGE (req)-[c:Call {userId: \"${userId}\"}]->(r)
    return r, req, c`)yaru
    })
    }", reduce: "const reducer = (data) => data", name: "userSubmissions"});

### Git clone

### yarn install && yarn start

### Go to http://localhost:3000

### Press submit.

You should see the result appear below. Also examine the local DB to see how the resolvers were invoked.
