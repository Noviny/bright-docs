import React from 'react';
import Button from '@atlaskit/button';
import Select from '@atlaskit/select';
import SectionMessage from '@atlaskit/section-message';

const name = 'Src Example page';
const Examples = () => <h1>Hello, {name}. I am a default export</h1>;

export default Examples;

export const NonDefaultExport = () => <Button>Hello World</Button>;

export const SelectExample = () => (
  <Select
    className="single-select"
    classNamePrefix="react-select"
    options={[
      { label: 'Adelaide', value: 'adelaide' },
      { label: 'Brisbane', value: 'brisbane' },
      { label: 'Canberra', value: 'canberra' },
      { label: 'Darwin', value: 'darwin' },
      { label: 'Hobart', value: 'hobart' },
      { label: 'Melbourne', value: 'melbourne' },
      { label: 'Perth', value: 'perth' },
      { label: 'Sydney', value: 'sydney' },
    ]}
    placeholder="Choose a City"
  />
);

const SectionMessages = () => (
  <>
    <SectionMessage apperance="authentication" title="More">
      <p>I count the steps from one end of my island to the other</p>
      <p>It{"'"}s a hundred steps from where I sleep to the sea</p>
    </SectionMessage>
    <SectionMessage appearance="warning">
      <p>And when I say I{"'"}ve learned all there is to know</p>
      <p>Well there{"'"}s another little island lesson</p>
      <p>Gramma Tala shows me</p>
    </SectionMessage>
    <SectionMessage appearance="error">
      <p>I know where I am from the scent of the breeze</p>
      <p>The ascent of the climb</p>
      <p>From the tangle of the trees</p>
    </SectionMessage>
    <SectionMessage appearance="confirmation">
      <p>From the angle of the mountain</p>
      <p>To the sand on our island shore</p>
      <p>I{"'"}ve been here before</p>
    </SectionMessage>
    <SectionMessage appearance="change">
      <p>From the angle of the mountain</p>
      <p>To the sand on our island shore</p>
      <p>I{"'"}ve been here before</p>
    </SectionMessage>
  </>
);

export { SectionMessages };
