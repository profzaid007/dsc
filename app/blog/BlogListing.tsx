"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react"
import { useLang } from "@/lib/lang-context"
import { localizedField } from "@/lib/i18n"
import type { BlogPage, BlogCategory } from "@/types/cms"
import styles from "./blog.module.css"

export type ListingPost = BlogPage & { thumbnailUrl: string | null }
const categoryIcons = [
  UsersRound,
  Brain,
  ChartNoAxesCombined,
  UsersRound,
  BookOpen,
  FileText,
]

function excerpt(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

export function BlogListing({
  posts,
  categories,
  fetchFailed,
}: {
  posts: ListingPost[]
  categories: BlogCategory[]
  fetchFailed: boolean
}) {
  const { lang } = useLang()
  const arabic = lang === "ar"
  const copy = (en: string, ar: string) => (arabic ? ar : en)
  const [query, setQuery] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [slide, setSlide] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const filtered = useMemo(
    () =>
      posts.filter(
        (post) =>
          (!category || post.category === category) &&
          `${localizedField(post, lang, "title")} ${excerpt(localizedField(post, lang, "content"))}`
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase().trim())
      ),
    [posts, category, search, lang]
  )
  const featuredPosts = filtered.slice(0, 4)
  const featured = featuredPosts[slide % Math.max(featuredPosts.length, 1)]
  const Arrow = arabic ? ArrowLeft : ArrowRight
  const Chevron = arabic ? ChevronLeft : ChevronRight
  const label = (post: ListingPost) => {
    const found = categories.find((item) => item.key === post.category)
    return found ? localizedField(found, lang, "label") : post.category
  }
  const colorIndex = (post: ListingPost) =>
    Math.max(
      categories.findIndex((item) => item.key === post.category),
      0
    ) % 6
  const minutes = (post: ListingPost) =>
    Math.max(
      1,
      Math.ceil(
        excerpt(localizedField(post, lang, "content")).split(/\s+/).length / 180
      )
    )
  const date = (post: ListingPost) => {
    const value = new Date(post.created)
    return Number.isNaN(value.getTime())
      ? ""
      : new Intl.DateTimeFormat(arabic ? "ar" : "en", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(value)
  }
  const photo = (post: ListingPost, className: string) => (
    <div className={className}>
      <Image
        unoptimized
        width={900}
        height={600}
        src={post.thumbnailUrl || "/blog/books-hero.jpg"}
        alt={post.thumbnailUrl ? localizedField(post, lang, "title") : ""}
        loading="lazy"
      />
    </div>
  )
  const metadata = (post: ListingPost, author = false) => (
    <div className={styles.metadata}>
      <span>
        <CalendarDays />
        {date(post)}
      </span>
      {author && post.author_name && (
        <span>
          <UserRound />
          {post.author_name}
        </span>
      )}
      <span>
        <Clock3 />
        {minutes(post)} {copy("min read", "دقائق قراءة")}
      </span>
    </div>
  )
  const reset = () => {
    setQuery("")
    setSearch("")
    setCategory("")
    setSlide(0)
    setShowAll(true)
  }

  return (
    <div className={styles.page} dir={arabic ? "rtl" : "ltr"}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>{copy("Blog", "المدونة")}</h1>
          <p>
            {copy(
              "Articles, ideas and resources in special education and human development",
              "مقالات وأفكار وموارد في مجال التربية الخاصة والتنمية البشرية"
            )}
          </p>
        </div>
      </header>
      <div className={styles.layout}>
        <div className={styles.main}>
          {featured && (
            <section
              className={styles.featured}
              aria-label={copy("Featured articles", "مقالات مختارة")}
            >
              <div className={styles.featuredContent}>
                <span className={styles.pill} data-color={colorIndex(featured)}>
                  {label(featured)}
                </span>
                <h2>
                  <Link href={`/blog/${featured.slug}`}>
                    {localizedField(featured, lang, "title")}
                  </Link>
                </h2>
                {metadata(featured, true)}
                <p className={styles.featuredExcerpt}>
                  {excerpt(localizedField(featured, lang, "content"))}
                </p>
                <Link
                  className={styles.readButton}
                  href={`/blog/${featured.slug}`}
                >
                  {copy("Read more", "قراءة المزيد")}
                  <Arrow size={17} />
                </Link>
                <div className={styles.dots}>
                  {featuredPosts.map((post, index) => (
                    <button
                      key={post.id}
                      type="button"
                      aria-label={`${copy("Show article", "عرض المقال")} ${index + 1}`}
                      aria-pressed={index === slide % featuredPosts.length}
                      onClick={() => setSlide(index)}
                    />
                  ))}
                </div>
              </div>
              {photo(featured, styles.featuredPhoto)}
            </section>
          )}
          <section className={styles.latest} id="latest-articles">
            <div className={styles.sectionHeading}>
              <h2>
                {category
                  ? categories.find((item) => item.key === category)
                    ? localizedField(
                        categories.find((item) => item.key === category)!,
                        lang,
                        "label"
                      )
                    : category
                  : copy("Latest articles", "أحدث المقالات")}
              </h2>
              <button
                className={styles.allButton}
                type="button"
                onClick={reset}
              >
                {copy("View all articles", "عرض جميع المقالات")}
                <Arrow size={15} />
              </button>
            </div>
            {fetchFailed ? (
              <div className={styles.empty} role="alert">
                <BookOpen />
                <h3>
                  {copy(
                    "Articles are temporarily unavailable",
                    "المقالات غير متاحة مؤقتاً"
                  )}
                </h3>
                <p>
                  {copy(
                    "Please try again in a moment.",
                    "يرجى المحاولة مرة أخرى بعد قليل."
                  )}
                </p>
                <button
                  className={styles.allButton}
                  onClick={() => window.location.reload()}
                >
                  {copy("Try again", "إعادة المحاولة")}
                </button>
              </div>
            ) : !filtered.length ? (
              <div className={styles.empty} role="status">
                <BookOpen />
                <h3>
                  {posts.length
                    ? copy("No matching articles", "لا توجد مقالات مطابقة")
                    : copy(
                        "New articles are on their way",
                        "مقالات جديدة قريباً"
                      )}
                </h3>
                <p>
                  {posts.length
                    ? copy(
                        "Try another search or browse all articles.",
                        "جرّب بحثاً آخر أو تصفّح جميع المقالات."
                      )
                    : copy(
                        "Check back soon for ideas and resources from our team.",
                        "عد قريباً للاطلاع على أفكار وموارد من فريقنا."
                      )}
                </p>
                {posts.length > 0 && (
                  <button className={styles.allButton} onClick={reset}>
                    {copy("Clear filters", "مسح عوامل التصفية")}
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.cards}>
                {filtered.slice(0, showAll ? undefined : 3).map((post) => (
                  <article key={post.id} className={styles.card}>
                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={localizedField(post, lang, "title")}
                    >
                      {photo(post, styles.cardPhoto)}
                    </Link>
                    <div className={styles.cardBody}>
                      <span
                        className={styles.pill}
                        data-color={colorIndex(post)}
                      >
                        {label(post)}
                      </span>
                      <h3>
                        <Link href={`/blog/${post.slug}`}>
                          {localizedField(post, lang, "title")}
                        </Link>
                      </h3>
                      <p>{excerpt(localizedField(post, lang, "content"))}</p>
                      {metadata(post)}
                      <Link
                        className={styles.textLink}
                        href={`/blog/${post.slug}`}
                      >
                        {copy("Read more", "قراءة المزيد")}
                        <Chevron size={17} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h2>{copy("Search the blog", "البحث في المدونة")}</h2>
            <form
              className={styles.search}
              role="search"
              onSubmit={(event) => {
                event.preventDefault()
                setSearch(query)
                setSlide(0)
                setShowAll(true)
              }}
            >
              <button type="submit" aria-label={copy("Search", "بحث")}>
                <Search size={20} />
              </button>
              <input
                aria-label={copy("Search articles", "البحث عن مقالات")}
                placeholder={copy("Search for an article…", "ابحث عن مقال ...")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>
            {search && (
              <button
                className={styles.clear}
                onClick={() => {
                  setSearch("")
                  setQuery("")
                }}
              >
                {copy("Clear search", "مسح البحث")}
              </button>
            )}
          </section>
          <section className={styles.panel}>
            <h2>{copy("Categories", "التصنيفات")}</h2>
            <div className={styles.categories}>
              {categories.length ? (
                categories.map((item, index) => {
                  const Icon = categoryIcons[index % 6]
                  return (
                    <button
                      key={item.id}
                      data-active={category === item.key}
                      onClick={() => {
                        setCategory(category === item.key ? "" : item.key)
                        setSlide(0)
                        setShowAll(true)
                      }}
                    >
                      <span
                        className={styles.categoryIcon}
                        data-color={index % 6}
                      >
                        <Icon size={21} />
                      </span>
                      <span>
                        {localizedField(item, lang, "label")}{" "}
                        <small>
                          (
                          {
                            posts.filter((post) => post.category === item.key)
                              .length
                          }
                          )
                        </small>
                      </span>
                      <Chevron size={17} />
                    </button>
                  )
                })
              ) : (
                <p className={styles.quiet}>
                  {copy(
                    "Categories will appear here as articles are published.",
                    "ستظهر التصنيفات هنا عند نشر المقالات."
                  )}
                </p>
              )}
            </div>
          </section>
          <section className={styles.panel}>
            <h2>{copy("Selected articles", "مقالات مختارة")}</h2>
            <div className={styles.selected}>
              {posts.slice(0, 3).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div>
                    <h3>{localizedField(post, lang, "title")}</h3>
                    <span>
                      <CalendarDays size={12} />
                      {date(post)}
                    </span>
                  </div>
                  {photo(post, styles.selectedPhoto)}
                </Link>
              ))}
              {!posts.length && (
                <p className={styles.quiet}>
                  {copy(
                    "Discover our latest articles here soon.",
                    "اكتشف أحدث مقالاتنا هنا قريباً."
                  )}
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
