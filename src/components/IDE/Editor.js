/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';

const Editor = ({ fnCode, saveCode, style }) => {
  const editorDiv = useRef();
  const editor = useRef();
  // const [localCode, setLocalCode] = useState(fnCode);

  useEffect(() => {
    editor.current = ace.edit(editorDiv.current);
    editor.current.setTheme('https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/theme-monokai.min.js');
    editor.current.session.setMode('https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/mode-javascript.min.js');
  }, []);

  useEffect(() => {
    editor.current.setValue(fnCode);
  }, [fnCode]);

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 9 }} ref={editorDiv}></div>
      <Button variant="contained" color="primary" onClick={() => saveCode(editor.current.getValue())}>
        Save
      </Button>
    </div>
  );
};

export default Editor;
