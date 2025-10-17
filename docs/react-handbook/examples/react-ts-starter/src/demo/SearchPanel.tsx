import React, { useState } from "react"

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="搜索..."
      className="px-3 py-2 border rounded w-64"
    />
  )
}

function ResultList({ keyword }: { keyword: string }) {
  const data = ["react", "vue", "svelte", "angular", "solid", "next", "nuxt"]
  const list = data.filter((x) => x.toLowerCase().includes(keyword.toLowerCase()))
  return (
    <ul className="list-disc pl-5">
      {list.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  )
}

export function SearchPanel() {
  const [kw, setKw] = useState("")
  return (
    <div className="space-y-3">
      <SearchInput value={kw} onChange={setKw} />
      <ResultList keyword={kw} />
    </div>
  )
}

export default SearchPanel