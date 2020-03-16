module.exports.basicSchemaTests = (opts) => {
  const utils = require('./utils');
  
  describe(`Default request returns valid message on /${opts.route}`, () => {
    for (let i = opts.schema.pageStart; i <= opts.schema.pageEnd; i++) {
      test(`/${opts.route}: page[number]=${i} and page[size]=${opts.schema.pageSize}`, () => {
        return utils.axiosInstance.get(`/1.0/${opts.route}?page[size]=${opts.schema.pageSize}&page[number]=${i}`)
                .then( (res) => {
                  let isValid = opts.schema.validate(res.data);
                  expect(isValid).toBe(true);
                });
      })
    }
  })

  describe(`Requests with included returns valid message on /${opts.route}`, () => {
    if(!opts.multiInclude || !opts.multiInclude.relationships)
      return;
      
    for (let i = opts.schema.pageStart; i <= opts.schema.pageEnd; i++) {
      test(`/${opts.route}: page[number]=${i}`, () => {
        return utils.axiosInstance.get(`/1.0/${opts.route}?page[size]=${opts.schema.pageSize}&page[number]=${i}&include=${opts.multiInclude.relationships.join(',')}`)
                .then( (res) => {
                  let isValid = opts.schema.validate(res.data);
                  expect(isValid).toBe(true);
                });
      })
    }
  })
}

// just to avoid warning, that no tests in test file
describe('Basic tests for API endpoints', () => {
  test('should be used per implementation', () => {});
});
