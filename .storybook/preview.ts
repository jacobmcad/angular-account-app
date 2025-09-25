import type { Preview } from '@storybook/angular';
const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    backgrounds: {
      default: 'UMN Gray',
      values: [
        { name: 'UMN Gray', value: '#eef1f5' },
        { name: 'White', value: '#ffffff' }
      ]
    },
    layout: 'fullscreen',
    a11y: {
      element: '#storybook-root'
    }
  }
};

export default preview;
