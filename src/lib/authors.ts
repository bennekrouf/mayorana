// Who writes the posts. Front matter names an author by id (`author: mayo`);
// this turns the id into the name readers see and the identity search engines
// read in the article's JSON-LD. Data-free, so client components can use it.

export type Author = {
  name: string;
  kind: 'Person' | 'Organization';
  /** Profiles of the same author on other sites, for JSON-LD sameAs. */
  sameAs?: string[];
};

const AUTHORS: Record<string, Author> = {
  mayo: {
    name: 'Mohamed Bennekrouf',
    kind: 'Person',
    sameAs: ['https://github.com/bennekrouf'],
  },
  mayorana: {
    name: 'Mayorana',
    kind: 'Organization',
    sameAs: ['https://www.linkedin.com/company/mayorana', 'https://github.com/bennekrouf'],
  },
};

export function getAuthor(id: string): Author {
  return AUTHORS[id.trim().toLowerCase()] ?? { name: id, kind: 'Person' };
}

/** The About page's section on the author. */
export const authorPageUrl = (locale: string) => `https://mayorana.ch/${locale}/about#author`;
