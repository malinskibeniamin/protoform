"use client";

import React from "react";
import { Badge } from "@/registry/base-nova/protoform/components/badge";
import { Button } from "@/registry/base-nova/protoform/components/button";
import { Field, FieldLabel } from "@/registry/base-nova/protoform/components/field";
import { Input } from "@/registry/base-nova/protoform/components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base-nova/protoform/components/tooltip";
import {
  getReadinessSummary,
  type ReadinessRequirement,
  readinessCategories,
  readinessProfile,
  readinessRequirements,
} from "../../readiness/profile.js";

type StatusFilter = "all" | "gaps" | ReadinessRequirement["status"];
const PAGE_SIZE = 25;

const statusFilters: ReadonlyArray<{
  label: string;
  value: StatusFilter;
}> = [
  { label: "All", value: "all" },
  { label: "Gaps", value: "gaps" },
  { label: "Verified", value: "verified" },
  { label: "Optional", value: "optional" },
  { label: "Deferred", value: "deferred" },
  { label: "Unsupported", value: "unsupported" },
  { label: "External", value: "external" },
  { label: "Out of target", value: "out-of-target" },
  { label: "Superseded", value: "superseded" },
];

function isGapStatus(status: ReadinessRequirement["status"]): boolean {
  return ["missing", "deferred", "unsupported"].includes(status);
}

function statusLabel(status: ReadinessRequirement["status"]): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "optional":
      return "Verified optional";
    case "missing":
      return "Gap";
    case "deferred":
      return "Deferred";
    case "unsupported":
      return "Unsupported";
    case "external":
      return "External";
    case "out-of-target":
      return "Out of target";
    case "superseded":
      return "Superseded";
    default:
      return status satisfies never;
  }
}

function statusSquareClass(status: ReadinessRequirement["status"]): string {
  switch (status) {
    case "verified":
      return "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-400";
    case "optional":
      return "bg-emerald-500/50 hover:bg-emerald-500/65 active:bg-emerald-500/65";
    case "missing":
      return "bg-amber-400 hover:bg-amber-300 active:bg-amber-300";
    case "deferred":
      return "bg-sky-500 hover:bg-sky-400 active:bg-sky-400";
    case "unsupported":
      return "bg-rose-500 hover:bg-rose-400 active:bg-rose-400";
    case "external":
      return "bg-muted-foreground/25 hover:bg-muted-foreground/40 active:bg-muted-foreground/40";
    case "out-of-target":
      return "bg-muted-foreground/15 hover:bg-muted-foreground/30 active:bg-muted-foreground/30";
    case "superseded":
      return "bg-muted-foreground/10 hover:bg-muted-foreground/25 active:bg-muted-foreground/25";
    default:
      return status satisfies never;
  }
}

function requirementExplanation(requirement: ReadinessRequirement): string {
  if (requirement.status === "verified" || requirement.status === "optional") {
    return requirement.description ?? `Evidence: ${requirement.evidence.testName}`;
  }
  if (requirement.status === "missing") {
    return `Next test: ${requirement.nextTest}`;
  }
  return requirement.rationale;
}

function RequirementStatus({ status }: { status: ReadinessRequirement["status"] }) {
  if (status === "verified") {
    return <Badge variant="success-inverted">Verified</Badge>;
  }
  if (status === "optional") {
    return <Badge variant="success-outline">Verified optional</Badge>;
  }
  if (status === "missing") {
    return <Badge variant="warning-inverted">Gap</Badge>;
  }
  if (status === "deferred") {
    return <Badge variant="info-inverted">Deferred</Badge>;
  }
  if (status === "unsupported") {
    return <Badge variant="destructive-inverted">Unsupported</Badge>;
  }
  if (status === "external") {
    return <Badge variant="neutral-inverted">External</Badge>;
  }
  if (status === "out-of-target") {
    return <Badge variant="neutral-outline">Out of target</Badge>;
  }
  return <Badge variant="disabled-inverted">Superseded</Badge>;
}

function RequirementDetail({ requirement }: { requirement: ReadinessRequirement }) {
  if (requirement.status === "verified" || requirement.status === "optional") {
    return (
      <p className="m-0 text-muted-foreground text-xs">
        Evidence: <code className="break-all">{requirement.evidence.file}</code>
        {" · "}
        {requirement.evidence.testName}
      </p>
    );
  }
  if (requirement.status === "missing") {
    return (
      <p className="m-0 text-sm">
        <strong>Next test:</strong> {requirement.nextTest}
      </p>
    );
  }
  if (requirement.status === "deferred" || requirement.status === "unsupported") {
    return (
      <div className="space-y-2 text-sm">
        <p className="m-0 text-muted-foreground">{requirement.rationale}</p>
        <p className="m-0">
          <strong>Next test:</strong> {requirement.nextTest}
        </p>
      </div>
    );
  }
  return <p className="m-0 text-muted-foreground text-sm">{requirement.rationale}</p>;
}

export function ReadinessDashboard() {
  const [page, setPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>(() =>
    readinessRequirements.some((requirement) => isGapStatus(requirement.status)) ? "gaps" : "verified"
  );
  const summary = getReadinessSummary(readinessRequirements);
  const requiredSummary = getReadinessSummary(
    readinessRequirements.filter((requirement) => requirement.level === "required")
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRequirements = readinessRequirements.filter((requirement) => {
    const matchesStatus =
      status === "all" || (status === "gaps" ? isGapStatus(requirement.status) : requirement.status === status);
    const searchable = [
      requirement.id,
      requirement.title,
      requirement.description ?? "",
      requirement.status === "verified" || requirement.status === "optional" ? requirement.evidence.testName : "",
      "nextTest" in requirement ? requirement.nextTest : "",
      "rationale" in requirement ? requirement.rationale : "",
    ]
      .join(" ")
      .toLowerCase();
    return matchesStatus && searchable.includes(normalizedQuery);
  });
  const pageCount = Math.max(1, Math.ceil(filteredRequirements.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const paginatedRequirements = filteredRequirements.slice(pageStart, pageStart + PAGE_SIZE);
  const visibleStart = filteredRequirements.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = Math.min(pageStart + PAGE_SIZE, filteredRequirements.length);

  return (
    <div className="not-prose my-8 space-y-8">
      <section className="overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)] lg:items-end">
          <div>
            <p className="mb-2 font-medium text-muted-foreground text-sm uppercase tracking-wide">
              Production Readiness Profile v{readinessProfile.version}
            </p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="m-0 font-semibold text-5xl tracking-tight">{summary.percentage}%</p>
              <Badge variant={summary.profileComplete ? "success" : "warning-inverted"}>
                Profile complete: {summary.profileComplete ? "yes" : "not yet"}
              </Badge>
            </div>
            <p className="mt-3 mb-0 text-muted-foreground text-sm">
              {summary.verified} of {summary.applicable} applicable checks verified.{" "}
              {summary.deferred + summary.unsupported} open checks count against readiness. {summary.excluded} excluded
              checks stay visible but do not affect the percentage.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span>Overall</span>
              <span className="font-medium">{summary.percentage}%</span>
            </div>
            <div
              aria-label="Overall readiness"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={summary.percentage}
              className="h-3 overflow-hidden rounded-full bg-muted"
              role="progressbar"
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${summary.percentage}%` }} />
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span>Required profile</span>
              <span className="font-medium">{requiredSummary.percentage}%</span>
            </div>
            <div
              aria-label="Required profile readiness"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={requiredSummary.percentage}
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
            >
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${requiredSummary.percentage}%` }} />
            </div>
          </div>
        </div>

        <TooltipProvider delayDuration={100} skipDelayDuration={0}>
          <fieldset
            aria-label="Readiness check status map"
            className="m-0 mt-6 grid min-w-0 grid-cols-[repeat(auto-fill,minmax(0.75rem,1fr))] gap-1 border-0 p-0"
          >
            {readinessRequirements.map((requirement) => {
              const label = `${requirement.title}: ${statusLabel(requirement.status)}`;
              return (
                <Tooltip key={requirement.id}>
                  <TooltipTrigger asChild>
                    <Button
                      aria-label={label}
                      className={`aspect-square h-auto min-h-3 w-full rounded-[2px] p-0 ${statusSquareClass(requirement.status)}`}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    arrow={false}
                    className="max-w-xs text-pretty bg-neutral-950 px-3 py-2 text-white shadow-xl"
                    role="tooltip"
                    transition={{ duration: 0 }}
                  >
                    <span className="block font-semibold">{requirement.title}</span>
                    <span className="mt-1 block text-xs">
                      {statusLabel(requirement.status)} · {requirement.level}
                    </span>
                    <span className="mt-2 block text-xs">{requirementExplanation(requirement)}</span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </fieldset>
        </TooltipProvider>
      </section>

      <section aria-labelledby="category-readiness-heading">
        <h2 className="mb-4 font-semibold text-2xl" id="category-readiness-heading">
          Readiness by area
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4">
          {readinessCategories.map((category) => {
            const categorySummary = getReadinessSummary(
              readinessRequirements.filter((requirement) => requirement.category === category.id)
            );
            return (
              <article className="min-w-0 rounded-lg border bg-card p-5" key={category.id}>
                <h3 className="m-0 break-words font-semibold text-base">{category.title}</h3>
                <p className="mt-3 mb-0 font-semibold text-xl tracking-tight">{categorySummary.percentage}%</p>
                <p className="mt-1 mb-4 text-muted-foreground text-xs">
                  {categorySummary.verified}/{categorySummary.applicable} verified
                </p>
                <div
                  aria-label={`${category.title} readiness`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={categorySummary.percentage}
                  className="h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${categorySummary.percentage}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="capability-ledger-heading">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="m-0 font-semibold text-2xl" id="capability-ledger-heading">
              Capability ledger
            </h2>
            <p aria-live="polite" className="mt-1 mb-0 text-muted-foreground text-sm">
              {`Showing ${visibleStart}–${visibleEnd} of ${filteredRequirements.length} matching checks. ${readinessRequirements.length} profile checks total.`}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(14rem,1fr)_auto]">
            <Field>
              <FieldLabel className="sr-only" htmlFor="readiness-search">
                Search readiness checks
              </FieldLabel>
              <Input
                id="readiness-search"
                onChange={(event) => {
                  setPage(1);
                  setQuery(event.target.value);
                }}
                placeholder="Search checks"
                type="search"
                value={query}
              />
            </Field>
            <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
              <legend className="sr-only">Filter readiness checks</legend>
              {statusFilters.map((filter) => (
                <Button
                  aria-pressed={status === filter.value}
                  key={filter.value}
                  onClick={() => {
                    setPage(1);
                    setStatus(filter.value);
                  }}
                  size="sm"
                  type="button"
                  variant={status === filter.value ? "primary" : "outline"}
                >
                  {filter.label}
                </Button>
              ))}
            </fieldset>
          </div>
        </div>

        {filteredRequirements.length === 0 ? (
          <p className="rounded-lg border bg-card p-6 text-muted-foreground text-sm">
            No readiness checks match these filters.
          </p>
        ) : (
          <div className="space-y-8">
            {readinessCategories.map((category) => {
              const categoryRequirements = paginatedRequirements.filter(
                (requirement) => requirement.category === category.id
              );
              if (categoryRequirements.length === 0) {
                return null;
              }
              return (
                <section aria-labelledby={`readiness-${category.id}`} key={category.id}>
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3 border-b pb-2">
                    <h3 className="m-0 font-semibold text-xl" id={`readiness-${category.id}`}>
                      {category.title}
                    </h3>
                    <a
                      className="text-muted-foreground text-xs underline underline-offset-4"
                      href={category.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {category.sourceLabel}
                    </a>
                  </div>
                  <ul className="m-0 grid list-none gap-3 p-0">
                    {categoryRequirements.map((requirement) => (
                      <li className="rounded-lg border bg-card p-4" key={requirement.id}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="m-0 break-all font-mono text-muted-foreground text-xs">{requirement.id}</p>
                            <h4 className="mt-1 mb-0 font-semibold text-base">
                              {requirement.sourceUrl ? (
                                <a
                                  className="underline underline-offset-4"
                                  href={requirement.sourceUrl}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  {requirement.title}
                                </a>
                              ) : (
                                requirement.title
                              )}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="simple-inverted">{requirement.level}</Badge>
                            <RequirementStatus status={requirement.status} />
                          </div>
                        </div>
                        {requirement.description ? (
                          <p className="mt-3 mb-2 text-muted-foreground text-sm">{requirement.description}</p>
                        ) : null}
                        <div className="mt-3">
                          <RequirementDetail requirement={requirement} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
        {filteredRequirements.length > 0 ? (
          <nav aria-label="Capability ledger pagination" className="mt-6 flex items-center justify-center gap-4">
            <Button
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Previous
            </Button>
            <span aria-current="page" className="text-muted-foreground text-sm">
              {`Page ${page} of ${pageCount}`}
            </span>
            <Button
              aria-label="Next page"
              disabled={page === pageCount}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Next
            </Button>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
