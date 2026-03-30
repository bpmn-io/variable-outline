import { describe, expect, it, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useState, useImperativeHandle, forwardRef } from 'react';

import useCodeMirror from '../useCodeMirror';


describe('useCodeMirror', () => {

  it('should update document content without recreating editor', async () => {

    // given
    const ref = { current: null };
    render(<TestEditor ref={ ref } doc={ '{ "a": 1 }' } isJson />);

    const initialView = ref.current.view;
    expect(initialView).to.exist;
    expect(initialView.state.doc.toString()).to.equal('{ "a": 1 }');

    // when
    await act(() => {
      ref.current.setDoc('{ "a": 2 }');
    });

    // then
    expect(ref.current.view).to.equal(initialView);
    expect(ref.current.view.state.doc.toString()).to.equal('{ "a": 2 }');
  });


  it('should recreate editor when isJson changes', async () => {

    // given
    const ref = { current: null };
    render(<TestEditor ref={ ref } doc={ 'hello' } />);

    const initialView = ref.current.view;
    expect(initialView).to.exist;

    // when
    await act(() => {
      ref.current.setIsJson(true);
    });

    // then
    expect(ref.current.view).to.not.equal(initialView);
  });


  it('should recreate editor when variableName changes', async () => {

    // given
    const ref = { current: null };
    render(<TestEditor ref={ ref } doc={ 'hello' } variableName="foo" />);

    const initialView = ref.current.view;
    expect(initialView).to.exist;

    // when
    await act(() => {
      ref.current.setVariableName('bar');
    });

    // then
    expect(ref.current.view).to.not.equal(initialView);
  });

});


// helpers /////////////////////////

const TestEditor = forwardRef(function TestEditor(props, ref) {
  const [ doc, setDoc ] = useState(props.doc || '');
  const [ isJson, setIsJson ] = useState(props.isJson || false);
  const [ variableName, setVariableName ] = useState(props.variableName || 'test');

  const { ref: editorRef, view } = useCodeMirror({
    doc,
    variableName,
    isJson,
    onMenuStateChange: vi.fn()
  });

  useImperativeHandle(ref, () => ({
    view,
    setDoc,
    setIsJson,
    setVariableName
  }), [ view ]);

  return <div ref={ editorRef } />;
});
