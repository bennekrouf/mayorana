# Writing a post: the fields search engines read

Front matter of `content/<locale>/blog/*.md`, as read by
`scripts/generate-blog-data.js`.

| Field | What it does | Rule |
|---|---|---|
| `title` | The visible heading, and the search title when `seo_title` is absent. | — |
| `seo_title` | The `<title>` and social-card title. Posts get no " \| Mayorana" suffix. | 60 characters at most; the query people type, first. No "Episode N:" at the start. |
| `meta_description` | The description in search results and cards; falls back to `excerpt`. | 160 characters at most. |
| `date` | Publication date: `datePublished`, the sitemap's `<lastmod>`. | — |
| `updated` | Set by hand after a substantial revision: `dateModified`, `<lastmod>`, and "Updated …" under the title. | Leave it out for typo fixes. |
| `author` | An id from `src/lib/authors.ts` (`mayo`, `mayorana`), not a display name. | Add new authors there. |
| `id` | Pairs the English and French versions of a post (hreflang). | Same id in both locales, or the French one with `-fr`. |
| `slug` | The URL. | New French posts can and should use a French slug: pairing is by `id`, so the slug is free. Never change a live slug without a 301 in `next.config.ts`; an unknown post URL is a 404. |
| `tags` | Tag pages. A tag page is indexed and in the sitemap only once 3 posts carry the tag (`MIN_POSTS_TO_INDEX_TAG`). | Reuse existing tags before inventing one. |

Link to related posts in the text where a concept comes up
(`[borrow checker](/en/blog/borrowing-rules-rust)`), not only through the
read-next box. Inside raw HTML (the inline SVG diagrams) markdown is not
parsed, so no links there.
