import type { MediaLink } from './api';

export function groupMediaLinks(items: MediaLink[]) {
  return {
    social: items.filter((item) => item.category === 'social'),
    sites: items.filter((item) => item.category === 'site'),
    contact: items.filter((item) => item.category === 'contact'),
    portfolio: items.filter((item) => item.category === 'portfolio'),
  };
}
