export const dataSources = [
  { value: 'provideData', text: 'Provide Values' },
  { value: 'dataObject', text: 'Request Data' },
  { value: 'dataConnector', text: 'Data Connector' },
  { value: 'dataVariable', text: 'Data Variable' },
];

export const dataSourceValues = dataSources.reduce((values, source) => {
  values[source.value] = source.value;
  return values;
}, {});
