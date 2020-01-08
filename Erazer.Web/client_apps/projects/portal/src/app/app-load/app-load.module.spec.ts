import { AppLoadModule } from './app-load.module';

describe('AppLoadModule', () => {
  let appLoadModule: AppLoadModule;

  beforeEach(() => {
    appLoadModule = new AppLoadModule();
  });

  it('should create an instance', () => {
    expect(appLoadModule).toBeTruthy();
  });
});
