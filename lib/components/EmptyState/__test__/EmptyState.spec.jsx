import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import EmptyState from '../EmptyState';


describe('lib/components/EmptyState', () => {

  describe('no process variables', () => {

    it('should render empty state icon', () => {

      // when
      const { container } = render(<EmptyState rawVariables={ [] } />);

      // then
      const iconContainer = container.querySelector('.bio-vo-empty-state__icon-container');
      expect(iconContainer).to.exist;
      expect(iconContainer.querySelector('svg')).to.exist;
    });


    it('should render title', () => {

      // when
      const { getByRole } = render(<EmptyState rawVariables={ [] } />);

      // then
      expect(getByRole('heading', { name: 'No process variables' })).to.exist;
    });


    it('should render description', () => {

      // when
      const { getByText } = render(<EmptyState rawVariables={ [] } />);

      // then
      expect(getByText('Add variables to your process through mappings, forms or example data.')).to.exist;
    });

  });


  describe('no matching variables', () => {

    it('should render empty state icon', () => {

      // when
      const { container } = render(<EmptyState rawVariables={ [ { name: 'foo' } ] } />);

      // then
      const iconContainer = container.querySelector('.bio-vo-empty-state__icon-container');
      expect(iconContainer).to.exist;
      expect(iconContainer.querySelector('svg')).to.exist;
    });


    it('should render title', () => {

      // when
      const { getByRole } = render(<EmptyState rawVariables={ [ { name: 'foo' } ] } />);

      // then
      expect(getByRole('heading', { name: 'No matching variables' })).to.exist;
    });


    it('should render description', () => {

      // when
      const { getByText } = render(<EmptyState rawVariables={ [ { name: 'foo' } ] } />);

      // then
      expect(getByText('Check your query or select a different element.')).to.exist;
    });

  });


  describe('learn more link', () => {

    it('should render link when learnMoreUrl is provided', () => {

      // when
      const { getByRole } = render(
        <EmptyState rawVariables={ [] } learnMoreUrl="https://docs.example.com" />
      );

      // then
      const link = getByRole('link', { name: 'Learn more' });
      expect(link).to.exist;
      expect(link.getAttribute('href')).to.eql('https://docs.example.com');
      expect(link.getAttribute('target')).to.eql('_blank');
    });


    it('should not render link when learnMoreUrl is not provided', () => {

      // when
      const { queryByRole } = render(<EmptyState rawVariables={ [] } />);

      // then
      expect(queryByRole('link')).to.not.exist;
    });

  });

});
