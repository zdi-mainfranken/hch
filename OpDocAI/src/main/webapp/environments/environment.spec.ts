import { environment } from './environment';

describe('Environment Configuration', () => {
  it('should have production mode enabled', () => {
    expect(environment.production).toBeTruthy();
  });
});
