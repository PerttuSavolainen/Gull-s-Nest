import { GullSNestPage } from './app.po';

describe('gull-s-nest App', function() {
  let page: GullSNestPage;

  beforeEach(() => {
    page = new GullSNestPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
