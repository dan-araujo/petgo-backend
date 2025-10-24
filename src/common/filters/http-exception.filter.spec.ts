import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionsFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionFilter()).toBeDefined();
  });
});
