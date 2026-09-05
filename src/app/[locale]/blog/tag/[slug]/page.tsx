// File: src/app/blog/tag/[slug]/page.tsx
import { notFound } from 'next/navigation';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import BlogList from '@/components/blog/BlogList';
import TagFilter from '@/components/blog/TagFilter';
import {
  getAllTags,
  getPostsByTag,
  getTagBySlug,
} from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string; locale: string }>; // Add locale to type
}

// A slug that is not valid percent-encoding would throw out of
// decodeURIComponent; fall back to the raw value and let the lookup miss.
function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// Generate static parameters for tags
export async function generateStaticParams() {
  const locales = ['en', 'fr'];
  const params = [];

  for (const locale of locales) {
    const tags = getAllTags(locale);
    for (const tag of tags) {
      const slug = tag.toLowerCase().replace(/\s+/g, '-');
      params.push({ locale, slug });
    }
  }
  return params;
}

export default async function TagPage({ params }: Props) {
  const { slug, locale } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  // Accented tags ("mémoire", "opérateurs") reach here percent-encoded, so
  // a raw lookup misses them and the page 404s even though the tag exists.
  const tagSlug = decodeSlug(slug);

  const currentTag = getTagBySlug(tagSlug, locale);

  if (!currentTag) {
    notFound();
  }

  const posts = getPostsByTag(tagSlug, locale);
  const tags = getAllTags(locale);

  // The JSX below is deliberately outside any try/catch. React renders the
  // returned element after this function has finished, so a catch here never
  // saw a render error — what it did catch was the control-flow exception
  // notFound() throws, logging it as "Error in TagPage" on every 404 before
  // re-throwing it. Rendering failures belong to an error boundary.
  return (
    <LayoutTemplate>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">
              #{currentTag}
            </h1>
            <p className="text-xl text-muted-foreground">
              {posts.length} article{posts.length !== 1 ? 's' : ''} about {currentTag}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-12 gap-12">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <TagFilter
                tags={tags}
                currentTag={currentTag}
              />
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <BlogList posts={posts} title="" description="" />
            </div>
          </div>
        </div>
      </section>
    </LayoutTemplate>
  );
}
