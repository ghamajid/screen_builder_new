export const dataSources = [
  { value: 'recordForm', text: 'Record Form' },
  { value: 'dataObject', text: 'Request Data' },
  { value: 'dataVariable', text: 'Data Variable' },
];

export const dataSourceValues = dataSources.reduce((values, source) => {
  values[source.value] = source.value;
  return values;
}, {});
