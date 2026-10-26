"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Users,
  UserRoundCheck,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { usePermissions } from "@/hooks/usePermissions"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"
import type { DashboardSnapshot } from "@/lib/admin-dashboard"
import { useLang } from "@/lib/lang-context"
import { securityModules } from "@/lib/security"
import styles from "./AdminStatisticsDashboard.module.css"

const metrics = [
  {
    key: "users",
    en: "User accounts",
    ar: "حسابات المستخدمين",
    icon: Users,
    href: "users",
  },
  {
    key: "experts",
    en: "Expert profiles",
    ar: "ملفات الخبراء",
    icon: UserRoundCheck,
    href: "experts",
  },
  {
    key: "cases",
    en: "Cases",
    ar: "الحالات",
    icon: BriefcaseBusiness,
    href: "cases",
  },
  {
    key: "training",
    en: "Training programs",
    ar: "البرامج التدريبية",
    icon: GraduationCap,
    href: "training",
  },
  {
    key: "lectures",
    en: "Public lectures",
    ar: "المحاضرات العامة",
    icon: BookOpen,
    href: "public-lectures",
  },
  {
    key: "assignments",
    en: "Assignments",
    ar: "التكليفات",
    icon: ClipboardList,
    href: "assignments",
  },
] as const
const labels: Record<string, [string, string]> = {
  pending: ["Pending", "قيد الانتظار"],
  awaiting_payment: ["Awaiting payment", "بانتظار الدفع"],
  under_review: ["Payment under review", "الدفع قيد المراجعة"],
  active: ["Active", "نشط"],
  other: ["Other", "أخرى"],
  expert: ["Experts", "الخبراء"],
  parent: ["Parents", "أولياء الأمور"],
  individual: ["Individuals", "الأفراد"],
  organization: ["Organizations", "المنظمات"],
  care_foundation: ["Care foundations", "مؤسسات الرعاية"],
  staff: ["Administrators", "المشرفون"],
  expert_approvals: ["Experts awaiting approval", "خبراء بانتظار الموافقة"],
  payment_reviews: ["Payments to review", "مدفوعات تحتاج إلى مراجعة"],
  pending_assignments: ["Pending assignments", "تعيينات قيد الانتظار"],
}
const palette = [
  "#0e4868",
  "#198d89",
  "#c19846",
  "#7699af",
  "#9a779c",
  "#657569",
  "#a4a9b2",
]

export function AdminStatisticsDashboard() {
  const { lang } = useLang()
  const { currentUser } = useAuth()
  const access = usePermissions()
  const [months, setMonths] = useState<6 | 12>(6)
  const { data, isLoading, isRefreshing, refresh } = useAdminDashboard(months)
  return (
    <DashboardView
      lang={lang}
      name={currentUser?.name}
      access={access}
      data={data}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      refresh={refresh}
      months={months}
      setMonths={setMonths}
    />
  )
}

export function DashboardView({
  lang,
  name,
  access,
  data,
  isLoading,
  isRefreshing,
  refresh,
  months,
  setMonths,
}: {
  lang: string
  name?: string
  access: Pick<
    ReturnType<typeof usePermissions>,
    "isLoading" | "error" | "isSuperAdmin" | "can" | "refresh"
  >
  data: DashboardSnapshot | null
  isLoading: boolean
  isRefreshing: boolean
  refresh: () => void
  months: 6 | 12
  setMonths: (months: 6 | 12) => void
}) {
  const ar = lang === "ar"
  const t = (en: string, arabic: string) => (ar ? arabic : en)
  const number = (n: number | null | undefined) =>
    n == null ? "—" : new Intl.NumberFormat(ar ? "ar" : "en").format(n)
  const label = (key: string) => labels[key]?.[ar ? 1 : 0] ?? t("Other", "أخرى")
  const available = metrics.filter(
    (m) => data && Object.hasOwn(data.counts, m.key)
  )
  const loading = access.isLoading || isLoading
  const trendKeys = (["users", "cases"] as const).filter((key) =>
    data?.trend.some((row) => row[key] !== undefined)
  )
  const max = Math.max(
    4,
    Math.ceil(
      Math.max(
        0,
        ...(data?.trend.flatMap((row) =>
          trendKeys.map((key) => row[key] ?? 0)
        ) ?? [])
      ) / 4
    ) * 4
  )
  const caseTotal =
    data?.caseStatus.reduce((sum, row) => sum + (row.count ?? 0), 0) ?? 0
  const caseUnknown = data?.caseStatus.some((row) => row.count === null)
  const roleMax = Math.max(
    1,
    ...(data?.userRoles.map((row) => row.count ?? 0) ?? [])
  )
  const moduleHref = (key: string) =>
    key === "cms"
      ? "/cms"
      : key === "messages"
        ? "/dashboard/messages"
        : `/dashboard/admin/${key === "lectures" ? "public-lectures" : key}`

  return (
    <section className={styles.dashboard} dir={ar ? "rtl" : "ltr"}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            {t("DSC • OPERATIONS", "DSC • مؤشرات النظام")}
          </p>
          <h1>{t("Admin overview", "نظرة عامة")}</h1>
          <p className={styles.subtitle}>
            {t("Welcome, ", "مرحباً، ")}
            {name}
            {t(
              ". Here is your system at a glance.",
              ". إليك أهم مؤشرات النظام."
            )}
          </p>
        </div>
        <div className={styles.headerActions}>
          {data && !loading && (
            <span className={styles.updated}>
              {t("Updated ", "آخر تحديث ")}
              {new Date(data.fetchedAt).toLocaleTimeString(ar ? "ar" : "en", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            className={styles.refresh}
            onClick={refresh}
            disabled={isRefreshing || isLoading || access.isLoading}
            aria-label={t("Refresh statistics", "تحديث الإحصاءات")}
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? styles.spinning : ""}
            />
            {t("Refresh", "تحديث")}
          </button>
        </div>
      </header>
      {access.error ? (
        <div className={styles.notice} role="alert">
          {t("Unable to load permissions.", "تعذر تحميل الصلاحيات.")}{" "}
          <button onClick={access.refresh}>
            {t("Retry", "إعادة المحاولة")}
          </button>
        </div>
      ) : loading ? (
        <div
          className={styles.skeleton}
          role="status"
          aria-label={t("Loading statistics", "جارٍ تحميل الإحصاءات")}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} />
          ))}
          <div className={styles.skeletonWide} />
        </div>
      ) : (
        data && (
          <>
            {!!data.errors.length && (
              <div className={styles.notice} role="alert">
                {t(
                  "Some statistics could not be loaded. Available figures are shown below.",
                  "تعذر تحميل بعض الإحصاءات. تظهر البيانات المتاحة أدناه."
                )}{" "}
                <button onClick={refresh}>
                  {t("Retry", "إعادة المحاولة")}
                </button>
              </div>
            )}
            {!!available.length && (
              <div className={styles.metrics}>
                {available.map(
                  ({ key, en, ar: arabic, icon: Icon, href }, i) => (
                    <Link
                      className={styles.metric}
                      href={`/dashboard/admin/${href}`}
                      key={key}
                    >
                      <div className={styles.metricTop}>
                        <span>{t(en, arabic)}</span>
                        <Icon
                          size={19}
                          style={{ color: palette[i % palette.length] }}
                        />
                      </div>
                      <strong>{number(data.counts[key])}</strong>
                      <div className={styles.metricFoot}>
                        <span>
                          {data.counts[key] === null
                            ? t("Unavailable", "غير متاح")
                            : t("All time", "الإجمالي")}
                        </span>
                        <ArrowUpRight
                          size={15}
                          className={ar ? styles.mirror : ""}
                        />
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
            <div className={styles.primaryGrid}>
              {!!trendKeys.length && (
                <article className={`${styles.panel} ${styles.activity}`}>
                  <div className={styles.panelHeading}>
                    <div>
                      <h2>{t("Monthly activity", "النشاط الشهري")}</h2>
                      <p>
                        {t(
                          "New accounts and cases · current month to date (UTC)",
                          "حسابات وحالات جديدة · الشهر الحالي حتى اليوم (UTC)"
                        )}
                      </p>
                    </div>
                    <div
                      className={styles.segment}
                      aria-label={t("Activity period", "فترة النشاط")}
                    >
                      {([6, 12] as const).map((value) => (
                        <button
                          key={value}
                          aria-pressed={months === value}
                          onClick={() => setMonths(value)}
                        >
                          {number(value)} {t("months", "أشهر")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.chartLegend}>
                    {trendKeys.map((key) => (
                      <span key={key}>
                        <i
                          style={{
                            background:
                              key === "users" ? palette[0] : palette[1],
                          }}
                        />
                        {key === "users"
                          ? t("New accounts", "حسابات جديدة")
                          : t("New cases", "حالات جديدة")}
                      </span>
                    ))}
                  </div>
                  <svg
                    className={styles.trend}
                    viewBox="0 0 660 225"
                    role="img"
                    aria-label={t(
                      "Monthly new accounts and cases. Detailed figures follow the chart.",
                      "الحسابات والحالات الجديدة شهرياً. تتوفر الأرقام التفصيلية أسفل الرسم."
                    )}
                    direction="ltr"
                  >
                    <title>{t("Monthly activity", "النشاط الشهري")}</title>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <g key={i}>
                        <line
                          x1="38"
                          x2="644"
                          y1={180 - i * 40}
                          y2={180 - i * 40}
                          stroke="#e4eaf0"
                          strokeDasharray="3 4"
                        />
                        <text
                          x="29"
                          y={184 - i * 40}
                          textAnchor="end"
                          fontSize="11"
                          fill="#667b89"
                        >
                          {number((max * i) / 4)}
                        </text>
                      </g>
                    ))}
                    {data.trend.map((row, i) => {
                      const step = 600 / Math.max(1, data.trend.length)
                      const x = 45 + i * step
                      return (
                        <g key={row.month}>
                          {trendKeys.map((key, j) =>
                            row[key] == null ? null : (
                              <rect
                                key={key}
                                x={x + j * (step * 0.26)}
                                y={180 - ((row[key] ?? 0) / max) * 160}
                                width={Math.min(22, step * 0.23)}
                                height={((row[key] ?? 0) / max) * 160}
                                rx="3"
                                fill={key === "users" ? palette[0] : palette[1]}
                                tabIndex={0}
                              >
                                <title>{`${row.month}: ${key === "users" ? t("New accounts", "حسابات جديدة") : t("New cases", "حالات جديدة")} ${number(row[key])}`}</title>
                              </rect>
                            )
                          )}
                          <text
                            className={
                              months === 12 && i % 2 === 0
                                ? styles.compactMonth
                                : undefined
                            }
                            x={x + step * 0.2}
                            y="206"
                            fontSize="11"
                            textAnchor="middle"
                            fill="#667b89"
                          >
                            {new Date(
                              `${row.month}-01T00:00:00Z`
                            ).toLocaleDateString(ar ? "ar" : "en", {
                              month: "short",
                              timeZone: "UTC",
                            })}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                  {!data.trend.some((row) =>
                    trendKeys.some((key) => (row[key] ?? 0) > 0)
                  ) && (
                    <p className={styles.empty}>
                      {data.trend.some((row) =>
                        trendKeys.some((key) => row[key] === null)
                      )
                        ? t(
                            "Activity figures are unavailable.",
                            "بيانات النشاط غير متاحة."
                          )
                        : t(
                            "No new activity in this period.",
                            "لا يوجد نشاط جديد خلال هذه الفترة."
                          )}
                    </p>
                  )}
                  <details className={styles.details}>
                    <summary>
                      {t("View monthly figures", "عرض الأرقام الشهرية")}
                    </summary>
                    <div className={styles.tableWrap}>
                      <table>
                        <thead>
                          <tr>
                            <th>{t("Month", "الشهر")}</th>
                            {trendKeys.map((key) => (
                              <th key={key}>
                                {key === "users"
                                  ? t("Accounts", "الحسابات")
                                  : t("Cases", "الحالات")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.trend.map((row) => (
                            <tr key={row.month}>
                              <th>
                                {new Date(
                                  `${row.month}-01T00:00:00Z`
                                ).toLocaleDateString(ar ? "ar" : "en", {
                                  month: "long",
                                  year: "numeric",
                                  timeZone: "UTC",
                                })}
                              </th>
                              {trendKeys.map((key) => (
                                <td key={key}>{number(row[key])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </article>
              )}
              {!!data.caseStatus.length && (
                <article className={styles.panel}>
                  <div className={styles.panelHeading}>
                    <div>
                      <h2>{t("Case status", "توزيع الحالات")}</h2>
                      <p>
                        {t(
                          "Current workload distribution",
                          "توزيع الحالات حسب وضعها الحالي"
                        )}
                      </p>
                    </div>
                    <BriefcaseBusiness size={18} />
                  </div>
                  <div className={styles.donutWrap}>
                    <svg
                      viewBox="0 0 200 200"
                      className={styles.donut}
                      role="img"
                      aria-label={t(
                        "Case distribution; values listed below",
                        "توزيع الحالات؛ القيم موضحة أدناه"
                      )}
                    >
                      <title>{t("Case status", "توزيع الحالات")}</title>
                      <circle
                        cx="100"
                        cy="100"
                        r="73"
                        fill="none"
                        stroke="#edf1f4"
                        strokeWidth="20"
                      />
                      {!caseUnknown &&
                        caseTotal > 0 &&
                        data.caseStatus.map((row, i, rows) => {
                          const prior = rows
                            .slice(0, i)
                            .reduce((sum, item) => sum + (item.count ?? 0), 0)
                          return (
                            <circle
                              key={row.key}
                              cx="100"
                              cy="100"
                              r="73"
                              fill="none"
                              stroke={palette[i]}
                              strokeWidth="20"
                              pathLength="100"
                              strokeDasharray={`${((row.count ?? 0) / caseTotal) * 100} 100`}
                              strokeDashoffset={(-prior / caseTotal) * 100}
                              transform="rotate(-90 100 100)"
                            />
                          )
                        })}
                      <text
                        x="100"
                        y="100"
                        textAnchor="middle"
                        className={styles.donutNumber}
                      >
                        {caseUnknown ? "—" : number(caseTotal)}
                      </text>
                      <text
                        x="100"
                        y="122"
                        textAnchor="middle"
                        className={styles.donutCaption}
                      >
                        {t("total cases", "إجمالي الحالات")}
                      </text>
                    </svg>
                  </div>
                  <ul className={styles.legendList}>
                    {data.caseStatus.map((row, i) => (
                      <li key={row.key}>
                        <span>
                          <i style={{ background: palette[i] }} />
                          {label(row.key)}
                        </span>
                        <strong>{number(row.count)}</strong>
                      </li>
                    ))}
                  </ul>
                  {caseUnknown && (
                    <p className={styles.empty}>
                      {t(
                        "Some case counts are unavailable.",
                        "بعض أعداد الحالات غير متاحة."
                      )}
                    </p>
                  )}
                </article>
              )}
            </div>
            <div className={styles.secondaryGrid}>
              {!!data.userRoles.length && (
                <article className={styles.panel}>
                  <div className={styles.panelHeading}>
                    <div>
                      <h2>{t("Account mix", "توزيع الحسابات")}</h2>
                      <p>
                        {t(
                          "Users by account type",
                          "المستخدمون حسب نوع الحساب"
                        )}
                      </p>
                    </div>
                    <Users size={18} />
                  </div>
                  <ul className={styles.roles}>
                    {data.userRoles.map((row, i) => (
                      <li key={row.key}>
                        <div>
                          <span>{label(row.key)}</span>
                          <strong>{number(row.count)}</strong>
                        </div>
                        <div
                          className={`${styles.track} ${row.count === null ? styles.trackUnknown : ""}`}
                          aria-hidden="true"
                        >
                          <span
                            style={{
                              width: `${((row.count ?? 0) / roleMax) * 100}%`,
                              background: palette[i % palette.length],
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                  {data.userRoles.some((row) => row.count === null) && (
                    <p className={styles.empty}>
                      {t(
                        "Some account counts are unavailable. Striped bars indicate unavailable data.",
                        "بعض أعداد الحسابات غير متاحة. تشير الأشرطة المخططة إلى بيانات غير متاحة."
                      )}
                    </p>
                  )}
                </article>
              )}
              {!!data.events.length && (
                <article className={styles.panel}>
                  <div className={styles.panelHeading}>
                    <div>
                      <h2>{t("Learning & events", "التدريب والفعاليات")}</h2>
                      <p>
                        {t(
                          "Program and lecture overview",
                          "ملخص البرامج والمحاضرات"
                        )}
                      </p>
                    </div>
                    <GraduationCap size={19} />
                  </div>
                  {data.events.map((event) => (
                    <div className={styles.event} key={event.key}>
                      <Link
                        href={`/dashboard/admin/${event.key === "training" ? "training" : "public-lectures"}`}
                      >
                        {event.key === "training"
                          ? t("Training programs", "البرامج التدريبية")
                          : t("Public lectures", "المحاضرات العامة")}
                        <ArrowUpRight size={15} />
                      </Link>
                      <div className={styles.eventNumbers}>
                        {(
                          [
                            [t("Total", "الإجمالي"), event.total],
                            [t("Published", "منشور"), event.published],
                            [t("Completed", "مكتمل"), event.completed],
                          ] as const
                        ).map(([text, value]) => (
                          <div key={text}>
                            <strong>{number(value)}</strong>
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </article>
              )}
              {!!data.attention.length && (
                <article className={`${styles.panel} ${styles.attention}`}>
                  <div className={styles.panelHeading}>
                    <div>
                      <h2>{t("Needs attention", "تحتاج إلى متابعة")}</h2>
                      <p>
                        {t(
                          "Keep work moving forward",
                          "تابع المهام التي تتطلب إجراءً"
                        )}
                      </p>
                    </div>
                    <Activity size={19} />
                  </div>
                  <ul className={styles.attentionList}>
                    {data.attention.map((row) => (
                      <li key={row.key}>
                        <Link href={row.href}>
                          <span>{label(row.key)}</span>
                          <strong>{number(row.count)}</strong>
                          <ArrowUpRight size={15} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {data.attention.every((row) => row.count === 0) && (
                    <p className={styles.clear}>
                      {t(
                        "You’re all caught up.",
                        "لا توجد مهام معلّقة حالياً."
                      )}
                    </p>
                  )}
                </article>
              )}
            </div>
            {!available.length && (
              <div className={styles.panel}>
                <h2>{t("Your workspace", "مساحة عملك")}</h2>
                <p className={styles.subtitle}>
                  {t(
                    "Statistics are available for modules you can access.",
                    "تتوفر الإحصاءات للوحدات المسموح لك بالوصول إليها."
                  )}
                </p>
                <div className={styles.shortcuts}>
                  {securityModules
                    .filter(([key]) => access.can(`${key}.read`))
                    .map(([key, en, arabic]) => (
                      <Link key={key} href={moduleHref(key)}>
                        {t(en, arabic)} <ArrowUpRight size={14} />
                      </Link>
                    ))}
                </div>
                {!securityModules.some(([key]) =>
                  access.can(`${key}.read`)
                ) && (
                  <p>
                    {t(
                      "Contact your Super Admin to request module access.",
                      "تواصل مع المشرف العام لطلب الوصول إلى الوحدات."
                    )}
                  </p>
                )}
              </div>
            )}
            {access.isSuperAdmin && (
              <footer className={styles.footer}>
                <ShieldCheck size={15} />
                <Link href="/dashboard/admin/security">
                  {t("Manage roles & permissions", "إدارة الأدوار والصلاحيات")}
                </Link>
              </footer>
            )}
          </>
        )
      )}
      {!access.error && !loading && !data && (
        <div className={styles.notice} role="alert">
          {t("Statistics could not be loaded.", "تعذر تحميل الإحصاءات.")}
          <button onClick={refresh}>{t("Retry", "إعادة المحاولة")}</button>
        </div>
      )}
    </section>
  )
}
