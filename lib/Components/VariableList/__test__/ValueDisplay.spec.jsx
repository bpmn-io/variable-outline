/* global document */
import { describe, expect, it } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

import ValueDisplay from '../ValueDisplay';


const NESTED_ENTRIES = [
  { name: 'name', info: 'John', type: 'String', entries: [] },
  {
    name: 'address',
    info: null,
    type: null,
    isList: false,
    entries: [
      { name: 'street', info: '123 Main St', type: 'String', entries: [] },
      { name: 'city', info: 'Springfield', type: 'String', entries: [] },
    ]
  },
];

async function waitForEditor(container) {
  await waitFor(() => {
    expect(container.querySelector('.cm-editor')).to.exist;
  });
  return container.querySelector('.cm-editor');
}

function renderValueDisplay(overrides = {}) {
  return render(
    <ValueDisplay
      info={ null }
      type={ null }
      isList={ false }
      variableName="testVar"
      entries={ NESTED_ENTRIES }
      { ...overrides }
    />
  );
}

function mouseDownCenter(element) {
  const rect = element.getBoundingClientRect();
  fireEvent.mouseDown(element, {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
  });
}


describe('ValueDisplay', () => {

  describe('given a JSON value with nested objects', () => {

    it('should show copy path and copy value actions in the context menu', async () => {

      // given
      const { container } = renderValueDisplay();
      const editor = await waitForEditor(container);
      const menuButton = editor.querySelector('.vd-menu-btn');

      // when
      fireEvent.click(menuButton);

      // then
      await waitFor(() => {
        const menu = document.body.querySelector('.vd-context-menu');
        expect(menu).to.exist;

        const items = menu.querySelectorAll('.vd-context-menu-item');
        expect(items).to.have.lengthOf(2);
        expect(items[0].textContent).to.eql('Copy path');
        expect(items[1].textContent).to.eql('Copy value');
      });
    });

    it('should place menu buttons inside cm-line elements', async () => {

      // when
      const { container } = renderValueDisplay();
      const editor = await waitForEditor(container);

      // then
      const menuButtons = editor.querySelectorAll('.vd-menu-btn');
      for (const btn of menuButtons) {
        expect(btn.closest('.cm-line')).to.exist;
      }
    });

    it('should decorate foldable property keys', async () => {

      // when
      const { container } = renderValueDisplay();
      const editor = await waitForEditor(container);

      // then
      const foldableKeys = editor.querySelectorAll('.vd-foldable-key');
      expect(foldableKeys.length).to.be.above(0);
    });

    it('should fold nested value when clicking its property key', async () => {

      // given
      const { container } = renderValueDisplay();
      const editor = await waitForEditor(container);
      const foldableKey = editor.querySelector('.vd-foldable-key');

      // when
      mouseDownCenter(foldableKey);

      // then
      await waitFor(() => {
        expect(editor.querySelector('.vd-fold-placeholder')).to.exist;
      });
    });

    it('should unfold nested value when clicking its fold placeholder', async () => {

      // given
      const { container } = renderValueDisplay();
      const editor = await waitForEditor(container);
      const foldableKey = editor.querySelector('.vd-foldable-key');
      mouseDownCenter(foldableKey);

      let placeholder;
      await waitFor(() => {
        placeholder = editor.querySelector('.vd-fold-placeholder');
        expect(placeholder).to.exist;
      });

      // when
      fireEvent.click(placeholder);

      // then
      await waitFor(() => {
        expect(editor.querySelector('.vd-fold-placeholder')).to.not.exist;
      });
    });
  });
});
