"use client";

type Props = {
  typeOptions: string[];
  purposeOptions: string[];
  modelOptions: string[];
  ratioOptions: string[];
  authorOptions: string[];
  typeFilter: string;
  purposeFilter: string;
  modelFilter: string;
  ratioFilter: string;
  authorFilter: string;
  query: string;
  onChangeType: (value: string) => void;
  onChangePurpose: (value: string) => void;
  onChangeModel: (value: string) => void;
  onChangeRatio: (value: string) => void;
  onChangeAuthor: (value: string) => void;
  onChangeQuery: (value: string) => void;
};

export default function TemplateFilters({
  typeOptions,
  purposeOptions,
  modelOptions,
  ratioOptions,
  authorOptions,
  typeFilter,
  purposeFilter,
  modelFilter,
  ratioFilter,
  authorFilter,
  query,
  onChangeType,
  onChangePurpose,
  onChangeModel,
  onChangeRatio,
  onChangeAuthor,
  onChangeQuery,
}: Props) {
  return (
    <div className="col-span-2 md:col-span-4 lg:col-span-5 rounded-xl border p-3 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[color:var(--ink-muted)]">Type</label>
        <select
          value={typeFilter}
          onChange={(e) => onChangeType(e.target.value)}
          className="rounded-lg border border-(--ring) bg-white px-2 py-2 text-xs"
        >
          <option value="all">All</option>
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[color:var(--ink-muted)]">Purpose</label>
        <select
          value={purposeFilter}
          onChange={(e) => onChangePurpose(e.target.value)}
          className="rounded-lg border border-(--ring) bg-white px-2 py-2 text-xs"
        >
          <option value="all">All</option>
          {purposeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[color:var(--ink-muted)]">Model</label>
        <select
          value={modelFilter}
          onChange={(e) => onChangeModel(e.target.value)}
          className="rounded-lg border border-(--ring) bg-white px-2 py-2 text-xs"
        >
          <option value="all">All</option>
          {modelOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[color:var(--ink-muted)]">Ratio</label>
        <select
          value={ratioFilter}
          onChange={(e) => onChangeRatio(e.target.value)}
          className="rounded-lg border border-(--ring) bg-white px-2 py-2 text-xs"
        >
          <option value="all">All</option>
          {ratioOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[color:var(--ink-muted)]">Author</label>
        <select
          value={authorFilter}
          onChange={(e) => onChangeAuthor(e.target.value)}
          className="rounded-lg border border-(--ring) bg-white px-2 py-2 text-xs"
        >
          <option value="all">All</option>
          {authorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[color:var(--ink-muted)]">Search</label>
        <input
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder="Name, prompt, model, author..."
          className="rounded-lg border border-(--ring) bg-white px-2 py-2 text-xs"
        />
      </div>
    </div>
  );
}
