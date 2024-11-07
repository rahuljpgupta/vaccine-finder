exports.mockData = () => `[]`;

exports.handlers = (name, resourceName) => `
  import { rest } from 'msw';
  import {
    getRequestHandler,
    patchRequestHandler,
    postRequestHandler,
    deleteRequestHandler,
  } from './requestHandler';
  import { URL_PREFIX } from '../constant';

  export const ${name}Handlers = [
    rest.get(URL_PREFIX + '/${resourceName}', getRequestHandler),
    rest.get(URL_PREFIX + '/${resourceName}/:id', getRequestHandler),
    rest.patch(URL_PREFIX + '/${resourceName}/:id', patchRequestHandler),
    rest.post(URL_PREFIX + '/${resourceName}', postRequestHandler),
    rest.delete(URL_PREFIX + '/${resourceName}/:id', deleteRequestHandler),
  ];

`;

exports.requestHandler = name => `
  import { errorResponse, successResponse } from '../responseResolver';
  import mockData from './mockData.json';
  import {
    RECORD_NOT_FOUND,
    RECORD_SUCCESSFULLY_UPDATED,
    RECORD_SUCCESSFULLY_ADDED,
    RECORD_SUCCESSFULLY_DELETED,
  } from '../constant';

  export const getRequestHandler = (req, res, ctx) => {
    const { id: ${name}Id } = req.params;

    if (${name}Id) {
      const data = mockData.find(${name}Record => ${name}Record.id === ${name}Id);
      return data ? successResponse(res, ctx, data) : errorResponse(res, ctx, { message: RECORD_NOT_FOUND });
    }

    return successResponse(res, ctx, mockData);
  };

  export const patchRequestHandler = (req, res, ctx) => {
    const { id: ${name}Id, attributes } = req.body.data;
    const data = mockData.find(${name}Record => ${name}Record.id === ${name}Id);

    if (!data) return errorResponse(res, ctx, { message: RECORD_NOT_FOUND });

    mockData.map(
      ${name}Record =>
        ${name}Record.id === ${name}Id
          ? (${name}Record.attributes = {
              ...${name}Record.attributes,
              ...attributes,
            })
          : ${name}Record
    );

    return successResponse(res, ctx, { message: RECORD_SUCCESSFULLY_UPDATED });
  };

  export const postRequestHandler = (req, res, ctx) => {
    const { data } = req.body;
    const ${name}Record = mockData.find(${name} => ${name}.id === data.id);

    ${name}Record
      ? mockData.map(${name} => {
          if (${name}.id === data.id) {
            ${name}.attributes = data.attributes;
          }
        })
      : mockData.push(data);

    return successResponse(res, ctx, { message: RECORD_SUCCESSFULLY_ADDED }, 201);
  };

  export const deleteRequestHandler = (req, res, ctx) => {
    const { id: ${name}Id } = req.params;
    const index = mockData.findIndex(${name}Record => ${name}Record.id === ${name}Id);

    if (index === -1) {
      return errorResponse(res, ctx, { message: RECORD_NOT_FOUND });
    }

    mockData.splice(index, 1);

    return successResponse(res, ctx, { message: RECORD_SUCCESSFULLY_DELETED });
  };

`;
