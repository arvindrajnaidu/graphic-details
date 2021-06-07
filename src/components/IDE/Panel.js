/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';

const Editor = ({ addFunction, addImport, removeImport, removeFunction, style }) => {
  const [name, setName] = useState('');
  const [rel, setRel] = useState('');
  return (
    <div style={{ ...style, justifyContent: 'flex-end', display: 'flex' }}>
      <FormControl style={{margin: 10, height: 160, display: 'flex', justifyContent: 'space-around'}}>
        <TextField
          id="standard-basic"
          label="Function Name"
          variant="filled"
          value={name}
          onChange={v => {
            setName(v.target.value);
          }}
        />
        <Button
          onClick={() => addFunction(name)}
          variant="contained"
          color="primary"
        >
          New Function
        </Button>
        <Button
          onClick={() => removeFunction(name)}
          variant="contained"
          color="primary"
        >
          Remove Function
        </Button>
      </FormControl>
      <FormControl style={{margin: 10, height: 160, display: 'flex', justifyContent: 'space-around'}}>
        <TextField
          id="standard-basic"
          label="Requirer Requiree"
          variant="filled"
          value={rel}
          onChange={v => {
            setRel(v.target.value);
          }}
        />
        <Button
          onClick={() => addImport(rel)}
          variant="contained"
          color="primary"
        >
          Create Import
        </Button>
        <Button
          onClick={() => removeImport(rel)}
          variant="contained"
          color="primary"
        >
          Remove Import
        </Button>
      </FormControl>
    </div>
  );
};

export default Editor;
