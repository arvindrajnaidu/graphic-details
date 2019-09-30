/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './IDE.css';

class IDE extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: `
MATCH (r:Resolver {name: 'userSubmissions'})
WITH r
MERGE (req:Request {reqId: "1004"})-[c:Call {userId: "jl"}]->(r)
return r, req, c`,
      result: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  async handleSubmit() {
    const data = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: this.state.query }),
    });
    const result = await data.json();
    this.setState({
      result: JSON.stringify(result),
    });
  }

  handleOnChange(e) {
    this.setState({
      query: e.target.value,
    });
  }

  render() {
    return (
      <div>
        <h1>Graphic Details</h1>
        <textarea
          style={{ width: '100%', height: 200 }}
          value={this.state.query}
          onChange={this.handleOnChange}
        />
        <button style={{ width: 100, margin: 20 }} onClick={this.handleSubmit} value='Submit'/>
        <div>{this.state.result}</div>
      </div>
    );
  }
}

export default withStyles(s)(IDE);
